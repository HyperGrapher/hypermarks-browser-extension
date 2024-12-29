import { tabsGroupedStorage } from '@extension/storage';
import { getActiveTabIcon } from './chrome-utils';
import type { YouTube as YT, ItemType, SingleTab, Xpost, SiteMeta } from './shared-types';
import { parseAbbrTwitterNumber } from './abbreviated-string-parser';
import { DexieTab } from '@extension/storage/lib/dexie/db';
import { getGenericTab } from './scrapers/get-generic';
import { db } from '@extension/storage';
import { twitterController } from './scrapers/get-twitter';

// https://claude.ai/chat/4355f721-1160-4c12-9933-69d1b03641c2

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Unexpected Error',
  message: 'Something went wrong. Please try again later.',
} as const;

// https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/cookbook.offscreen-dom/offscreen.js

function combineSiteData<T extends Partial<DexieTab>>(
  popupData: {
    tags: string[] | null;
    category: string;
    sitemeta: SiteMeta | undefined;
    note: string;
  },
  partialSiteData: T,
): Omit<SingleTab, keyof T> & T {
  const siteData = {
    categoryId: 0, // Will be updated in the transaction
    url: popupData.sitemeta?.url ?? '',
    origin: popupData.sitemeta?.origin ?? '',
    icon: popupData.sitemeta?.icon ?? '',
    tags: popupData.tags ?? [],
    note: popupData.note ?? '', // Default fallback for required properties
    title: popupData.sitemeta?.title ?? 'Untitled', // Fallback for required title
    createdAt: partialSiteData.createdAt ?? new Date(),
    updatedAt: partialSiteData.updatedAt ?? new Date(),
    ...partialSiteData,
  };

  // Type assertion ensures that required properties are fulfilled.
  return siteData as Omit<SingleTab, keyof T> & T;
}

export async function dispatcher(popupData: {
  tags: string[];
  category: string;
  sitemeta: SiteMeta | undefined;
  note: string;
}): Promise<{ id: number; success: boolean }> {
  let scrapedSiteData = await getGenericTab();

  // Combine partialSiteData with additional site data
  const siteData = combineSiteData(popupData, scrapedSiteData) as DexieTab;

  const tabId = await db.transaction('rw', db.categories, db.tabs, async () => {
    // Check if the category exists
    let categoryId = await db.categories
      .where('category')
      .equals(popupData.category)
      .first()
      .then(existingCategory => existingCategory?.id);

    // Create the category if it doesn't exist
    if (!categoryId) {
      categoryId = await db.categories.add({ category: popupData.category });
    }
    // Update the siteData with the resolved categoryId
    siteData.categoryId = categoryId;

    // Save the tab data
    return await db.tabs.add(siteData);
  });

  return { id: tabId, success: true };
}
