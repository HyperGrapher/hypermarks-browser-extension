import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

// async function updateTabsForRenamedTag(oldTag: string, newTag: string) {
//  const tabsGrouped = await tabsGroupedStorage.get();

//   // Update the tags in the grouped tabs
//   const updatedTabsGrouped = Object.entries(tabsGrouped).map(([category, tabs]) => ({
//     category,
//     tabs: tabs.map((tab) => ({
//       ...tab,
//       item: {
//         ...tab.item,
//         tags: tab.item.tags.map((tag) => (tag === oldTag ? newTag : tag)), // Replace old tag with the new one
//       },
//     })),
//   }));

//   // Save the updated tabs back to storage
//   await tabsGroupedStorage.set(updatedTabsGrouped);
// }

export type YoutubeVideo = {
  channel_name: string;
  avatar: string;
  desc: string;
  thumb: string;
};

export type YoutubeChannel = {
  name: string;
  avatar: string;
  banner: string;
  desc: string;
  subs: string;
  videos: string;
  is_subbed: boolean;
};

export type YoutubeList = {
  title: string;
  channel: string;
  avatar: string;
  thumb: string;
  desc: string;
  views: string;
  videos: string;
};

export type ItemType =
  | 'other'
  | 'yt-video'
  | 'yt-channel'
  | 'yt-playlist'
  | 'github-repo'
  | 'x-post'
  | 'x-profile'
  | 'x-channel'
  | 'x-list'
  | 'twitter-tweet'
  | 'twitter-user'
  | 'twitter-list'
  | 'instagram-post'
  | 'instagram-user'
  | 'instagram-story'
  | 'soundcloud-track'
  | 'soundcloud-playlist'
  | 'dev-to-post'
  | 'dev-to-user'
  | 'dribble-shot'
  | 'dribble-team'
  | 'eksi-post'
  | 'eksi-user'
  | 'aliexpress-product'
  | 'aliexpress-user'
  | 'amazon-product'
  | 'amazon-user'
  | 'reddit'
  | undefined;

export type SingleTab = {
  title: string;
  description: string;
  origin: string;
  url: string;
  icon: string;
  note: string | undefined;
  tags: string[];
  datetime: string; // ISO string representing the saved time
  item_type: ItemType;
  youtube_video: YoutubeVideo | undefined;
  youtube_channel: YoutubeChannel | undefined;
  youtube_list: YoutubeList | undefined;
};

// type CategorizedTabsType = {
//   [category: string]: SingleTabType[];
// }

export type CategorizedTab = {
  category: string;
  item: SingleTab;
};

type TabsStorage = BaseStorage<CategorizedTab[]> & {
  save: (data: CategorizedTab) => Promise<void>;
};

interface StorageConfig {
  storageEnum: StorageEnum;
  liveUpdate: boolean;
}

const storage = createStorage<CategorizedTab[]>('tabs-storage-key', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
} as StorageConfig);

// You can extend it with your own methods
export const tabsStorage: TabsStorage = {
  ...storage,
  save: async (data: CategorizedTab) => {
    try {
      await storage.set(prev => [...prev, data]);
    } catch (error) {
      console.error('Failed to save tab:', error);
    }
  },
};

// Improved Saving

type TabsGroupedStorage = BaseStorage<{ [category: string]: SingleTab[] }> & {
  save: (category: string, tab: SingleTab) => Promise<void>;
  delete: (datetime: string) => Promise<void>;
};

const groupedStorage = createStorage<{ [category: string]: SingleTab[] }>(
  'grouped-tabs-storage',
  {},
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const tabsGroupedStorage: TabsGroupedStorage = {
  ...groupedStorage,
  save: async (category: string, tab: SingleTab) => {
    await groupedStorage.set(prev => {
      const categoryTabs = prev[category] || [];
      return { ...prev, [category]: [tab, ...categoryTabs] };
    });
  },

  delete: async (datetime: string) => {
    await groupedStorage.set(prev => {
      // Iterate over each category
      const updatedStorage = Object.entries(prev).reduce(
        (acc, [category, tabs]) => {
          // Filter out the tab with the matching datetime
          const filteredTabs = tabs.filter(tab => tab.datetime !== datetime);

          // Only include categories with remaining tabs
          if (filteredTabs.length > 0) {
            acc[category] = filteredTabs;
          }

          return acc;
        },
        {} as { [category: string]: SingleTab[] },
      );

      // TODO: Check if return is needed
      return updatedStorage;
    });
  },
};
