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

type YoutubeType = {
  yt_channel: string;
  yt_channel_img: string;
  yt_video_desc: string;
  yt_video_thumb: string;
};

export type SingleTab = {
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  datetime: string; // ISO string representing the saved time

  youtube: YoutubeType | undefined;
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
      return { ...prev, [category]: [...categoryTabs, tab] };
    });
  },
};
