import Dexie, { Table } from 'dexie';
import { DexieTab, FavoriteColor, SubCategory, XpostDexie, XPostScreenshot, XProfile, YouTube } from './dexie-types';
import { announceMarksChangedOnComplete } from './marks-changed';

export type UpdateItemInput = {
  /** Category name, created if it doesn't exist yet. */
  category: string;
  /** Sub category name inside `category`, created if it doesn't exist yet. Empty for none. */
  subCategory?: string;
  tags: string[];
  note: string;
  favorite?: FavoriteColor;
};

// WARN: When adding Date object to any table use one of this names: 'createdAt', 'updatedAt', 'datetime'
// WARN: OR update the DATE_FIELDS list in import-export.ts.
export class TabsDB extends Dexie {
  categories!: Table<{ id?: number; category: string }, number>;
  subCategories!: Table<SubCategory, number>;
  marks!: Table<DexieTab, number>;
  yt_channels!: Table<YouTube.Channel, number>;
  yt_playlists!: Table<YouTube.Playlist, number>;
  yt_videos!: Table<YouTube.Video, number>;
  x_posts!: Table<XpostDexie, number>;
  x_profiles!: Table<XProfile, number>;
  x_screenshots!: Table<XPostScreenshot, number>;
  constructor() {
    super('HyperMarksDB');
    // INFO: Only existing index fields can be searched
    this.version(1).stores({
      categories: '++id,category',
      marks: '++id,categoryId,title,*tags,origin,createdAt,[origin+tags]',
      yt_channels: 'mark_id,channelName',
      yt_playlists: 'mark_id,channelName',
      yt_videos: 'mark_id,channelName',
      x_posts: 'mark_id,handle,datetime',
      x_profiles: 'mark_id,username,handle,isFollowing',
      x_screenshots: 'mark_id',
    });
    // v2: optional sub categories (sub folders) under a main category. Additive only, no data migration needed.
    // marks.subCategoryId is not indexed; items are filtered by categoryId first and then in memory.
    this.version(2).stores({
      subCategories: '++id,categoryId,name,[categoryId+name]',
    });

    // Lets the background refresh the "page is saved" indicator on the extension icon, whoever changed the items
    this.marks.hook('creating', (_primKey, _obj, transaction) => {
      announceMarksChangedOnComplete(transaction);
    });
    this.marks.hook('updating', (_mods, _primKey, _obj, transaction) => {
      announceMarksChangedOnComplete(transaction);
    });
    this.marks.hook('deleting', (_primKey, _obj, transaction) => {
      announceMarksChangedOnComplete(transaction);
    });
  }

  /**
   * Deletes a category with everything in it: its items, the YouTube/X data of those items and its sub categories.
   * All or nothing. Returns how many items were deleted.
   */
  deleteCategoryAndItems(categoryId: number) {
    const dataTables = [
      this.yt_channels,
      this.yt_playlists,
      this.yt_videos,
      this.x_posts,
      this.x_profiles,
      this.x_screenshots,
    ];

    return this.transaction('rw', [this.marks, this.categories, this.subCategories, ...dataTables], async () => {
      const markIds = await this.marks.where({ categoryId }).primaryKeys();
      for (const table of dataTables) await table.bulkDelete(markIds);
      await this.marks.bulkDelete(markIds);
      await this.subCategories.where({ categoryId }).delete();
      await this.categories.delete(categoryId);
      return markIds.length;
    });
  }

  /** Deletes the sub category if no item uses it anymore. Must run inside a transaction that includes marks and subCategories. */
  async deleteSubCategoryIfEmpty(subCategoryId: number | undefined) {
    if (!subCategoryId) return;
    const remaining = await this.marks.filter(m => m.subCategoryId === subCategoryId).count();
    if (remaining === 0) await this.subCategories.delete(subCategoryId);
  }

  /**
   * Copies an item, including its YouTube/X data, into another category (and optionally a sub category).
   * The copy is an independent item: editing or deleting one never touches the other.
   * Returns the id of the new item. Nothing is written if anything fails.
   */
  duplicateItem(id: number, target: { categoryId: number; subCategoryId?: number }) {
    const dataTables: Table<{ mark_id?: number }, number>[] = [
      this.yt_channels,
      this.yt_playlists,
      this.yt_videos,
      this.x_posts,
      this.x_profiles,
      this.x_screenshots,
    ];

    return this.transaction('rw', [this.marks, this.categories, this.subCategories, ...dataTables], async () => {
      const mark = await this.marks.get(id);
      if (!mark) throw new Error('Item not found');
      if (!(await this.categories.get(target.categoryId))) throw new Error('Category not found');
      if (target.subCategoryId !== undefined) {
        const sub = await this.subCategories.get(target.subCategoryId);
        if (!sub || sub.categoryId !== target.categoryId) throw new Error('Sub category not found');
      }

      const now = new Date();
      const copy: DexieTab = { ...mark, categoryId: target.categoryId, createdAt: now, updatedAt: now };
      delete copy.id;
      delete copy.subCategoryId;
      if (target.subCategoryId !== undefined) copy.subCategoryId = target.subCategoryId;
      const newId = await this.marks.add(copy);

      for (const table of dataTables) {
        const row = await table.get(id);
        if (row) await table.put({ ...row, mark_id: newId });
      }
      return newId;
    });
  }

  /**
   * Changes the category, sub category, tags, note and favorite of a saved item (the page data is left as it is).
   * A category / sub category left empty by moving the item is removed, like when an item is deleted.
   */
  updateItem(id: number, changes: UpdateItemInput) {
    return this.transaction('rw', [this.marks, this.categories, this.subCategories], async () => {
      const mark = await this.marks.get(id);
      if (!mark) throw new Error('Item not found');

      const categoryId =
        (await this.categories.where('category').equals(changes.category).first())?.id ??
        (await this.categories.add({ category: changes.category }));

      const subCategoryName = changes.subCategory?.trim();
      const subCategoryId = subCategoryName
        ? ((await this.subCategories.where({ categoryId, name: subCategoryName }).first())?.id ??
          (await this.subCategories.add({ categoryId, name: subCategoryName })))
        : undefined;

      const updated: DexieTab = {
        ...mark,
        categoryId,
        tags: changes.tags,
        note: changes.note,
        updatedAt: new Date(),
      };
      if (subCategoryId !== undefined) updated.subCategoryId = subCategoryId;
      else delete updated.subCategoryId;
      if (changes.favorite) updated.favorite = changes.favorite;
      else delete updated.favorite;
      await this.marks.put(updated);

      if (mark.categoryId !== categoryId && (await this.marks.where({ categoryId: mark.categoryId }).count()) === 0) {
        await this.categories.delete(mark.categoryId);
      }
      if (mark.subCategoryId !== subCategoryId) await this.deleteSubCategoryIfEmpty(mark.subCategoryId);
    });
  }

  deleteItem(id: number | undefined, categoryId: number) {
    if (!id) return;

    return this.transaction(
      'rw',
      [
        this.marks,
        this.categories,
        this.subCategories,
        this.x_posts,
        this.x_profiles,
        this.x_screenshots,
        this.yt_channels,
        this.yt_playlists,
        this.yt_videos,
      ],
      async () => {
        const subCategoryId = (await this.marks.get(id))?.subCategoryId;
        await this.marks.where({ id }).delete();

        // Every deletion is awaited so a failure rolls the whole transaction back instead of leaving orphans
        for (const table of [
          this.x_posts,
          this.x_profiles,
          this.x_screenshots,
          this.yt_channels,
          this.yt_videos,
          this.yt_playlists,
        ]) {
          await table.where({ mark_id: id }).delete();
        }

        if ((await this.marks.where({ categoryId }).count()) === 0) {
          await this.categories.where({ id: categoryId }).delete();
        }

        await this.deleteSubCategoryIfEmpty(subCategoryId);
      },
    );
  }
}

export const db = new TabsDB();

// db.on('populate', populate);

export function resetDatabase() {
  return db.transaction('rw', db.categories, db.marks, db.x_posts, async () => {
    await Promise.all(db.tables.map(table => table.clear()));
    // await populate();
  });
}
