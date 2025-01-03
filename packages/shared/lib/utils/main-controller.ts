import { DexieTab, XpostDexie } from '@extension/storage';
import { getActiveTabIcon } from './chrome-utils';
import type { YouTube as YT, SiteMeta } from './shared-types';
import { getGenericTab } from './scrapers/get-generic';
import { db } from '@extension/storage';
import { twitterController } from './scrapers/get-twitter';

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
): Omit<DexieTab, keyof T> & T {
  console.log('combineSiteData');

  const siteData = {
    categoryId: 0, // Will be updated in the transaction
    url: popupData.sitemeta?.url ?? '',
    origin: popupData.sitemeta?.origin ?? '',
    icon: popupData.sitemeta?.icon ?? '',
    tags: popupData.tags ?? [],
    note: popupData.note ?? '', // Default fallback for required properties
    title: popupData.sitemeta?.title ?? 'Untitled', // Fallback for required title
    createdAt: partialSiteData?.createdAt ?? new Date(),
    updatedAt: partialSiteData?.updatedAt ?? new Date(),
    ...partialSiteData,
  };

  console.log(siteData);

  // Type assertion ensures that required properties are fulfilled.
  return siteData as Omit<DexieTab, keyof T> & T;
}

export async function saveDexieTab(popupData: {
  tags: string[];
  category: string;
  sitemeta: SiteMeta | undefined;
  note: string;
}): Promise<{ id: number; success: boolean }> {
  let scrapedSiteData: Partial<DexieTab>;
  let xpost: XpostDexie;

  if (popupData.sitemeta?.origin.includes('//x.com')) {
    const [tab, xdata] = await twitterController(popupData.sitemeta.url);
    scrapedSiteData = tab;
    xpost = xdata as XpostDexie;
    scrapedSiteData.description = xpost.content;
    console.log('scrape assign', scrapedSiteData);
    console.log('xpost assign', xpost);
  } else {
    const generic = await getGenericTab();
    scrapedSiteData = generic;
  }

  // Combine partialSiteData with additional site data
  const combinedSiteData = combineSiteData(popupData, scrapedSiteData) as DexieTab;

  const tabId = await db.transaction('rw', db.categories, db.tabs, db.xPosts, async () => {
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
    combinedSiteData.categoryId = categoryId;

    // Save the tab data
    const tabSaved = await db.tabs.add(combinedSiteData);
    xpost.tabId = tabSaved;
    const xPostSaved = await db.xPosts.add(xpost);
    await db.tabs.update(tabSaved, { xpostId: xPostSaved });

    return tabSaved;
  });

  return { id: tabId, success: true };
}
