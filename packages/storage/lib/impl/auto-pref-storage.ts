import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

type LastCategoryType = { id: number; category: string };
type LastPanelType = 'categories' | 'all' | 'search';

type AutoPrefs = {
  lastCategory: LastCategoryType;
  lastPanel: LastPanelType;
};

// storage type with methods
type AutoPrefsStorage = BaseStorage<AutoPrefs> & {
  saveLastCategory: (lastCategory: LastCategoryType) => Promise<void>;
  saveLastPanel: (lastPanel: LastPanelType) => Promise<void>;
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
};
