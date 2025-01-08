import Dexie, { Table } from 'dexie';
import { DexieTab, XpostDexie, XPostScreenshot, XProfile, YouTube } from './dexie-types';

// WARN: When adding Date object to any table use one of this names: 'createdAt', 'updatedAt', 'datetime'
// WARN: OR update ExportImport component to include the field name in "dateFields" variable.
export class TabsDB extends Dexie {
  categories!: Table<{ id?: number; category: string }, number>;
  marks!: Table<DexieTab, number>;
  yt_channels!: Table<YouTube.Channel, number>;
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
      yt_videos: 'mark_id,channelName',
      x_posts: 'mark_id,handle,datetime',
      x_profiles: 'mark_id,username,handle,isFollowing',
      x_screenshots: 'mark_id',
    });
  }

  // TODO: THis needs to be fixed
  deleteCategoryAndItems(categoryId: number) {
    return this.transaction('rw', this.marks, this.categories, () => {
      this.marks.where({ categoryId }).delete();
      this.categories.delete(categoryId);
    });
  }

  deleteItem(id: number | undefined, categoryId: number) {
    if (!id) return;

    return this.transaction(
      'rw',
      [
        this.marks,
        this.categories,
        this.x_posts,
        this.x_profiles,
        this.x_screenshots,
        this.yt_channels,
        this.yt_videos,
      ],
      async () => {
        this.marks.where({ id }).delete();

        const xpostCount = await this.x_posts.where({ mark_id: id }).count();
        const xProfileCount = await this.x_profiles.where({ mark_id: id }).count();
        const xScreenshotCount = await this.x_screenshots.where({ mark_id: id }).count();
        const ytChannelCount = await this.yt_channels.where({ mark_id: id }).count();
        const ytVideoCount = await this.yt_videos.where({ mark_id: id }).count();

        if (xpostCount > 0) {
          this.x_posts.where({ mark_id: id }).delete();
        }

        if (xProfileCount > 0) {
          this.x_profiles.where({ mark_id: id }).delete();
        }

        if (xScreenshotCount > 0) {
          this.x_screenshots.where({ mark_id: id }).delete();
        }

        if (ytChannelCount > 0) {
          this.yt_channels.where({ mark_id: id }).delete();
        }

        if (ytVideoCount > 0) {
          this.yt_videos.where({ mark_id: id }).delete();
        }

        this.marks
          .where({ categoryId })
          .count()
          .then(c => {
            if (c === 0) {
              this.categories.where({ id: categoryId }).delete();
            }
          });
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
