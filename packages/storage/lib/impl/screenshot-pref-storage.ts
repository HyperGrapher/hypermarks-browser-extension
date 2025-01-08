import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

type ScreenshotPref = {
  pref: boolean;
};

// storage type with methods
type ScreenshotPrefsStorage = BaseStorage<ScreenshotPref> & {
  toggle: () => Promise<void>;
};

const storageKey = 'screenshot-pref-storage';

// Create the storage with an initial empty object
const storage = createStorage<ScreenshotPref>(
  storageKey,
  { pref: true },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

// Extend the storage with custom methods
export const screenshotPrefStorage: ScreenshotPrefsStorage = {
  ...storage,
  toggle: async () => {
    await storage.set(prev => {
      return { pref: !prev.pref };
    });
  },
};
