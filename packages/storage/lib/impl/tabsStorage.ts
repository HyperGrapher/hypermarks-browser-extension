import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';
import type { CategorizedTab, SingleTab } from '../../../shared';

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

// type CategorizedTabsType = {
//   [category: string]: SingleTabType[];
// }

// type TabsStorage = BaseStorage<CategorizedTab[]> & {
//   save: (data: CategorizedTab) => Promise<void>;
// };

// interface StorageConfig {
//   storageEnum: StorageEnum;
//   liveUpdate: boolean;
// }

// const storage = createStorage<CategorizedTab[]>('tabs-storage-key', [], {
//   storageEnum: StorageEnum.Local,
//   liveUpdate: true,
// } as StorageConfig);

// You can extend it with your own methods
// export const tabsStorage: TabsStorage = {
//   ...storage,
//   save: async (data: CategorizedTab) => {
//     try {
//       await storage.set(prev => [...prev, data]);
//     } catch (error) {
//       console.error('Failed to save tab:', error);
//     }
//   },
// };

// Improved Saving

type TabsGroupedStorage = BaseStorage<{ [category: string]: SingleTab[] }> & {
  save: (category: string, tab: SingleTab) => Promise<void>;
  delete: (datetime: string) => Promise<void>;
  getByIdWithCategory: (datetime: string) => Promise<{ item: SingleTab; category: string } | null>;
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
  getByIdWithCategory: async (datetime: string) => {
    const storage = await groupedStorage.get(); // Fetch current storage state
    for (const [category, tabs] of Object.entries(storage)) {
      const foundTab = tabs.find(tab => tab.datetime === datetime);
      if (foundTab) {
        return { item: foundTab, category };
      }
    }
    return null; // Return null if the tab is not found
  },
};

export async function deleteTab(datetime: string) {
  console.log(datetime);
  try {
    await tabsGroupedStorage.delete(datetime);
    console.log(`Tab with datetime ${datetime} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting tab:', error);
  }
}
