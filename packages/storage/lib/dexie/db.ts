import Dexie, { Table } from 'dexie';
import type { CategorizedTab, SingleTab, YouTube } from '../../../shared';
import { populate } from './populate';

export interface XpostDexie {
  profileName: string;
  handle: string;
  avatar: string;
  isPremium: boolean;
  datetime: Date;
  datetimeStr: string;
  content: string;
  views: number;
  likes: number;
  comments: number;
  photos?: string[];
  screenshotId?: number;
  tabId?: number;
  id?: number;
}

export type DexieTab = Omit<
  SingleTab,
  'youtubeChannel' | 'youtubeVideo' | 'youtubeShort' | 'youtubePlaylist' | 'tempCaps' | 'xpost' | 'datetime'
> & {
  id?: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  youtubeChannelId?: number;
  youtubeVideoId?: number;
  youtubePlaylistId?: number;
  youtubeShortId?: number;
  xpostId?: number;
};

export class TabsDB extends Dexie {
  categories!: Table<{ id?: number; category: string }, number>;
  tabs!: Table<DexieTab, number>;
  ytChannels!: Table<YouTube.Channel, number>;
  xPosts!: Table<XpostDexie, number>;
  constructor() {
    super('TabsDB');
    this.version(1).stores({
      categories: '++id,category',
      tabs: '++id,categoryId,datetime,title,url,icon,description,tags,origin,note,itemType,youtubeChannelId,youtubeVideoId,youtubeShortId,youtubePlaylistId,xpostId,createdAt,updatedAt',
      ytChannels: '++id,channelName,avatar,banner,description,subcriberCount,videoCount,isSubscribed,tabId',
      xPosts:
        '++id,tabId,profileName,handle,avatar,isPremium,datetime,datetimeStr,content,views,likes,comments,photos,screenshotId',
    });
  }

  // TODO: THis needs to be fixed
  deleteCategoryAndItems(categoryId: number) {
    return this.transaction('rw', this.tabs, this.categories, () => {
      this.tabs.where({ categoryId }).delete();
      this.categories.delete(categoryId);
    });
  }

  deleteItem(id: number | undefined, categoryId: number) {
    console.log({ id, categoryId });
    if (!id) return;

    return this.transaction('rw', this.tabs, this.categories, () => {
      this.tabs.where({ id }).delete();
      this.tabs
        .where({ categoryId })
        .count()
        .then(c => {
          console.log({ count: c });

          if (c === 0) {
            this.categories.where({ id: categoryId }).delete();
          }
        });
    });
  }
}

export const db = new TabsDB();

db.on('populate', populate);

export function resetDatabase() {
  return db.transaction('rw', db.categories, db.tabs, async () => {
    await Promise.all(db.tables.map(table => table.clear()));
    await populate();
  });
}
