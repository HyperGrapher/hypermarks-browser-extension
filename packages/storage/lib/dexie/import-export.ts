import { db } from './db';
import type { DexieTab } from './dexie-types';

/**
 * `replace`: wipe the current data and load the file.
 * `merge`: keep the current data and add what the file has (see `importDatabase`).
 */
export type ImportMode = 'merge' | 'replace';

export type ImportResult = {
  /** Items added to the database */
  items: number;
  /** Items left out because the same url is already saved (merge only) */
  skippedDuplicates: number;
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

/**
 * Imports the JSON produced by the export button.
 *
 * Works for files exported with any older schema: tables or fields that didn't exist yet fall back to defaults
 * (no sub categories, no sub category on items).
 *
 * Ids inside the file are never trusted, every record gets a fresh id and the links
 * (item -> category, item -> sub category, item data -> item) are re-mapped. This is what makes merging safe.
 * - categories are matched by name, sub categories by (category, name), so merging doesn't duplicate folders.
 * - items whose url is already saved are skipped when merging.
 *
 * Everything runs in one transaction, if anything fails the database is left untouched.
 */
export async function importDatabase(file: unknown, mode: ImportMode): Promise<ImportResult> {
  if (file === null || typeof file !== 'object' || Array.isArray(file)) {
    throw new Error('Not a HyperMarks export file');
  }
  const data = file as AnyRecord;
  const tableNames = db.tables.map(t => t.name);
  if (!tableNames.some(name => Array.isArray(data[name]))) {
    throw new Error('Not a HyperMarks export file');
  }

  const categories = readTable(data, 'categories');
  const subCategories = readTable(data, 'subCategories');
  const marks = readTable(data, 'marks');

  return db.transaction('rw', db.tables, async () => {
    if (mode === 'replace') {
      await Promise.all(db.tables.map(table => table.clear()));
    }

    // Urls that were saved before this import, used to skip duplicates
    const existingUrls = new Set((await db.marks.toArray()).map(m => m.url));

    const findOrCreateCategory = async (name: string) =>
      (await db.categories.where('category').equals(name).first())?.id ?? (await db.categories.add({ category: name }));

    // file category id -> database category id
    const categoryIds = new Map<number, number>();
    for (const category of categories) {
      if (typeof category.category !== 'string' || !category.category.trim()) continue;
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
      if (existingUrls.has(mark.url)) {
        skippedDuplicates++;
        continue;
      }

      // Items pointing to a category that isn't in the file still get a home
      const categoryId = categoryIds.get(mark.categoryId) ?? (await findOrCreateCategory(FALLBACK_CATEGORY));
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
        // Data of items that were skipped (duplicates) or are missing from the file is dropped
        if (markId === undefined) continue;
        await db.table(tableName).put({ ...record, mark_id: markId });
      }
    }

    return { items, skippedDuplicates };
  });
}
