import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

type LastCategoryType = { id: number; category: string };
type LastPanelType = 'categories' | 'all' | 'search';

/** How the items of a list are ordered */
export type SortOption = 'newest' | 'oldest' | 'updated' | 'title-asc' | 'title-desc';

type AutoPrefs = {
  lastCategory: LastCategoryType;
  lastPanel: LastPanelType;
  /** Sort order of the "Categories" tab. Missing in preferences saved by older versions. */
  categoriesSort?: SortOption;
  /** Sort order of the "All" tab. Missing in preferences saved by older versions. */
  allSort?: SortOption;
};

// storage type with methods
type AutoPrefsStorage = BaseStorage<AutoPrefs> & {
  saveLastCategory: (lastCategory: LastCategoryType) => Promise<void>;
  saveLastPanel: (lastPanel: LastPanelType) => Promise<void>;
  saveCategoriesSort: (sort: SortOption) => Promise<void>;
  saveAllSort: (sort: SortOption) => Promise<void>;
};

const tagsStorageKey = 'auto-prefs-storage';

// Create the storage with an initial empty object
const storage = createStorage<AutoPrefs>(
  tagsStorageKey,
  { lastCategory: { id: 0, category: '' }, lastPanel: 'all' as LastPanelType },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

// Extend the storage with custom methods
export const autoPrefsStorage: AutoPrefsStorage = {
  ...storage,
  saveLastCategory: async (lastCategory: LastCategoryType) => {
    await storage.set(prev => {
      return { ...prev, lastCategory };
    });
  },
  saveLastPanel: async (lastPanel: LastPanelType) => {
    await storage.set(prev => {
      return { ...prev, lastPanel };
    });
  },
  saveCategoriesSort: async (categoriesSort: SortOption) => {
    await storage.set(prev => {
      return { ...prev, categoriesSort };
    });
  },
  saveAllSort: async (allSort: SortOption) => {
    await storage.set(prev => {
      return { ...prev, allSort };
    });
  },
};
