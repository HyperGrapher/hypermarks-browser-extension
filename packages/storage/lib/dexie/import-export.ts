import { db } from './db';
import type { DexieTab } from './dexie-types';

/**
 * `replace`: the selected categories are emptied first, then loaded from the file.
 * If every category of the file is selected, the whole database is wiped instead.
 * `merge`: keep the current data and add what the file has (see `importDatabase`).
 */
export type ImportMode = 'merge' | 'replace';

export type ImportOptions = {
  /** Names of the main categories to import. Everything in the file when omitted. */
  categories?: string[];
};

export type ImportResult = {
  /** Items added to the database */
  items: number;
  /** Items left out because the same url is already saved */
  skippedDuplicates: number;
};

/** A main category found in an import file */
export type ImportPreviewCategory = {
  name: string;
  items: number;
  subCategories: number;
  /** A category with this name already exists in the database */
  existsInDb: boolean;
};

// WARN: Whenever a table/field holds a Date object, add the field name here.
const DATE_FIELDS = ['createdAt', 'updatedAt', 'datetime', 'joinedDate'];

/** Tables that hold extra data of a mark, linked through `mark_id` */
const MARK_DATA_TABLES = [
  'yt_channels',
  'yt_playlists',
  'yt_videos',
  'x_posts',
  'x_profiles',
  'x_screenshots',
] as const;

const FALLBACK_CATEGORY = 'Uncategorized';

type AnyRecord = Record<string, any>;

/** Missing tables (e.g. `subCategories` in files exported before sub categories existed) are simply empty. */
function readTable(file: AnyRecord, tableName: string): AnyRecord[] {
  const value = file[tableName];
  if (!Array.isArray(value)) return [];
  return value.filter((r): r is AnyRecord => r !== null && typeof r === 'object').map(revive);
}

/** JSON turns dates into strings, turn them back into Date objects. */
function revive(record: AnyRecord): AnyRecord {
  const copy = { ...record };
  for (const field of DATE_FIELDS) {
    if (copy[field]) {
      const date = new Date(copy[field]);
      copy[field] = isNaN(date.getTime()) ? new Date(0) : date;
    }
  }
  return copy;
}

/** Reads the three tables that describe the folder structure and checks that this looks like an export. */
function parseFile(file: unknown) {
  if (file === null || typeof file !== 'object' || Array.isArray(file)) {
    throw new Error('Not a HyperMarks export file');
  }
  const data = file as AnyRecord;
  if (!db.tables.some(table => Array.isArray(data[table.name]))) {
    throw new Error('Not a HyperMarks export file');
  }

  const categories = readTable(data, 'categories').filter(
    c => typeof c.category === 'string' && c.category.trim() !== '',
  );
  const subCategories = readTable(data, 'subCategories');
  const marks = readTable(data, 'marks');

  const categoryNames = new Map<number, string>(categories.map(c => [c.id, c.category]));
  // Items pointing to a category that isn't in the file are filed under "Uncategorized"
  const categoryNameOf = (mark: AnyRecord) => categoryNames.get(mark.categoryId) ?? FALLBACK_CATEGORY;

  return { data, categories, subCategories, marks, categoryNameOf };
}

/** Lists the main categories of an import file so the user can choose which ones to import. */
export async function previewImport(file: unknown): Promise<ImportPreviewCategory[]> {
  const { categories, subCategories, marks, categoryNameOf } = parseFile(file);

  const counts = new Map<string, { items: number; subCategories: number }>();
  const entry = (name: string) => {
    if (!counts.has(name)) counts.set(name, { items: 0, subCategories: 0 });
    return counts.get(name)!;
  };

  for (const category of categories) entry(category.category);
  for (const mark of marks) entry(categoryNameOf(mark)).items++;
  for (const sub of subCategories) {
    const parent = categories.find(c => c.id === sub.categoryId);
    if (parent) entry(parent.category).subCategories++;
  }

  const existing = new Set((await db.categories.toArray()).map(c => c.category));
  return [...counts.entries()].map(([name, count]) => ({ name, ...count, existsInDb: existing.has(name) }));
}

/**
 * Imports the JSON produced by the export button.
 *
 * Works for files exported with any older schema: tables or fields that didn't exist yet fall back to defaults
 * (no sub categories, no sub category on items).
 *
 * Ids inside the file are never trusted, every record gets a fresh id and the links
 * (item -> category, item -> sub category, item data -> item) are re-mapped. This is what makes merging safe.
 * - categories are matched by name, sub categories by (category, name), so merging doesn't duplicate folders.
 * - items whose url is already saved are skipped.
 * - `options.categories` limits the import to those main categories, the rest of the file is ignored and
 *   the rest of the database is left alone.
 *
 * Everything runs in one transaction, if anything fails the database is left untouched.
 */
export async function importDatabase(
  file: unknown,
  mode: ImportMode,
  options: ImportOptions = {},
): Promise<ImportResult> {
  const { data, categories, subCategories, marks, categoryNameOf } = parseFile(file);

  const fileCategoryNames = new Set([...categories.map(c => c.category), ...marks.map(categoryNameOf)]);
  const selected = options.categories ? new Set(options.categories) : fileCategoryNames;
  const isSelected = (name: string) => selected.has(name) && fileCategoryNames.has(name);
  const everythingSelected = [...fileCategoryNames].every(name => selected.has(name));

  return db.transaction('rw', db.tables, async () => {
    if (mode === 'replace') {
      if (everythingSelected) {
        await Promise.all(db.tables.map(table => table.clear()));
      } else {
        // Only empty the chosen categories (the category itself is kept and filled below)
        for (const name of selected) {
          const existing = await db.categories.where('category').equals(name).first();
          if (!existing?.id) continue;
          const markIds = await db.marks.where({ categoryId: existing.id }).primaryKeys();
          for (const tableName of MARK_DATA_TABLES) await db.table(tableName).bulkDelete(markIds);
          await db.marks.bulkDelete(markIds);
          await db.subCategories.where({ categoryId: existing.id }).delete();
        }
      }
    }

    // Urls that were saved before this import, used to skip duplicates
    const existingUrls = new Set((await db.marks.toArray()).map(m => m.url));

    const findOrCreateCategory = async (name: string) =>
      (await db.categories.where('category').equals(name).first())?.id ?? (await db.categories.add({ category: name }));

    // file category id -> database category id (selected categories only)
    const categoryIds = new Map<number, number>();
    for (const category of categories) {
      if (!isSelected(category.category)) continue;
      categoryIds.set(category.id, await findOrCreateCategory(category.category));
    }

    // file sub category id -> database sub category id
    const subCategoryIds = new Map<number, number>();
    for (const sub of subCategories) {
      const categoryId = categoryIds.get(sub.categoryId);
      if (categoryId === undefined || typeof sub.name !== 'string' || !sub.name.trim()) continue;
      const existing = await db.subCategories.where({ categoryId, name: sub.name }).first();
      subCategoryIds.set(sub.id, existing?.id ?? (await db.subCategories.add({ categoryId, name: sub.name })));
    }

    // file item id -> database item id
    const markIds = new Map<number, number>();
    let items = 0;
    let skippedDuplicates = 0;
    for (const mark of marks) {
      const categoryName = categoryNameOf(mark);
      if (!isSelected(categoryName)) continue;

      if (existingUrls.has(mark.url)) {
        skippedDuplicates++;
        continue;
      }

      const categoryId = categoryIds.get(mark.categoryId) ?? (await findOrCreateCategory(categoryName));
      // Older files have no sub categories at all, so this is simply undefined for them
      const subCategoryId = mark.subCategoryId === undefined ? undefined : subCategoryIds.get(mark.subCategoryId);

      const { id: oldId, ...rest } = mark;
      const newMark: DexieTab = {
        ...(rest as Omit<DexieTab, 'id' | 'categoryId'>),
        tags: Array.isArray(rest.tags) ? rest.tags : [],
        categoryId,
        subCategoryId,
      };
      // Only a valid sub category may be set, and never as a dangling reference
      if (subCategoryId === undefined) delete newMark.subCategoryId;

      const newId = await db.marks.add(newMark);
      if (oldId !== undefined) markIds.set(oldId, newId);
      items++;
    }

    for (const tableName of MARK_DATA_TABLES) {
      for (const record of readTable(data, tableName)) {
        const markId = markIds.get(record.mark_id);
        // Data of items that were skipped, not selected or missing from the file is dropped
        if (markId === undefined) continue;
        await db.table(tableName).put({ ...record, mark_id: markId });
      }
    }

    return { items, skippedDuplicates };
  });
}
