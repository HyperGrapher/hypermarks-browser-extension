import Dexie, { Table } from 'dexie';
import type { YouTube } from '../../../shared';
import { DexieTab, XpostDexie, XProfile } from './dexie-types';

export class TabsDB extends Dexie {
  categories!: Table<{ id?: number; category: string }, number>;
  tabs!: Table<DexieTab, number>;
  ytChannels!: Table<YouTube.Channel, number>;
  xPosts!: Table<XpostDexie, number>;
  xProfile!: Table<XProfile, number>;
  constructor() {
    super('TabsDB');
    this.version(1).stores({
      categories: '++id,category',
      tabs: '++id,categoryId,datetime,title,url,icon,description,tags,origin,note,itemType,youtubeChannelId,youtubeVideoId,youtubeShortId,youtubePlaylistId,xpostId,createdAt,updatedAt',
      ytChannels: '++id,channelName,avatar,banner,description,subcriberCount,videoCount,isSubscribed,tabId',
      xPosts:
        '++id,tabId,profileName,handle,avatar,isPremium,datetime,datetimeStr,content,views,likes,comments,videos,photos,screenshotId',
      xProfile:
        '++id,username,handle,avatar,header,bio,isPremium,isFollowing,followers,following,followedBy,bday,uniqueId,website,location,joinedDateStr,joinedDate,tabId',
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

// db.on('populate', populate);

export function resetDatabase() {
  return db.transaction('rw', db.categories, db.tabs, db.xPosts, async () => {
    await Promise.all(db.tables.map(table => table.clear()));
    // await populate();
  });
}
