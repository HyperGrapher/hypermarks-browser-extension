import Dexie, { Table } from 'dexie';
import type { YouTube } from '../../../shared';
import { DexieTab, XpostDexie, XPostScreenshot, XProfile } from './dexie-types';

export interface Video {
  title: string;
  channelName: string;
  avatar: string;
  description: string;
  thumbnail: string;
}

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
    super('TabsDB');
    this.version(1).stores({
      categories: '++id,category',
      marks:
        '++id,categoryId,title,url,icon,description,tags,origin,note,itemType,youtubeChannelId,youtubeVideoId,youtubeShortId,youtubePlaylistId,xpostId,createdAt,updatedAt',
      yt_channels: 'markId,channelName,avatar,banner,description,subcriberCount,videoCount,isSubscribed',
      yt_videos: 'markId,title,channelName,avatar,description,thumbnail',
      x_posts:
        'markId,profileName,handle,avatar,isPremium,datetime,datetimeStr,content,views,likes,comments,videos,photos,screenshotId',
      x_profiles:
        'markId,username,handle,avatar,header,bio,isPremium,isFollowing,followers,following,followedBy,bday,uniqueId,website,location,joinedDateStr,joinedDate',
      x_screenshots: 'markId,data',
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
    console.log({ id, categoryId });
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

        const xpostCount = await this.x_posts.where({ markId: id }).count();
        const xProfileCount = await this.x_profiles.where({ markId: id }).count();
        const xScreenshotCount = await this.x_screenshots.where({ markId: id }).count();
        const ytChannelCount = await this.yt_channels.where({ markId: id }).count();
        const ytVideoCount = await this.yt_videos.where({ markId: id }).count();

        // console.log({xpostCount, xProfileCount, xScreenshotCount, ytChannelCount, ytVideoCount});

        if (xpostCount > 0) {
          this.x_posts.where({ markId: id }).delete();
        }

        if (xProfileCount > 0) {
          this.x_profiles.where({ markId: id }).delete();
        }

        if (xScreenshotCount > 0) {
          this.x_screenshots.where({ markId: id }).delete();
        }

        if (ytChannelCount > 0) {
          this.yt_channels.where({ markId: id }).delete();
        }

        if (ytVideoCount > 0) {
          this.yt_videos.where({ markId: id }).delete();
        }

        this.marks
          .where({ categoryId })
          .count()
          .then(c => {
            console.log({ count: c });

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
