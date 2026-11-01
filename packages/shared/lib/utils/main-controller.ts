import { DexieTab, screenshotPrefStorage, XpostDexie, XProfile, YouTube } from '@extension/storage';
import { getActiveTabIcon } from './chrome-utils';
import type { SiteMeta } from './shared-types';
import { getGenericTab } from './scrapers/get-generic';
import { db } from '@extension/storage';
import { twitterController } from './scrapers/get-twitter';
import { youtubeController } from './scrapers/youtube-controller';

export async function captureScreenshot(): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let selectorForScreenshot = 'article[data-testid="tweet"][tabindex="-1"]';
  if (tab.url?.includes('bilyoner.com')) {
    selectorForScreenshot = '.betslip.betslip--active';
    // } else if (tab.url?.includes('//x.com') && tab.url?.includes('/status/')) {
    // URL matches "https://x.com/.../status/..."
  } else if (/^https?:\/\/x\.com\/.*\/status\//.test(tab.url ?? '')) {
    selectorForScreenshot = 'article[data-testid="tweet"][tabindex="-1"]';
  } else return '';

  // Wrap chrome.runtime.sendMessage in a Promise
  const screenshotSaved = new Promise<{ success: boolean; croppedScreenshot?: string; error?: string }>(
    (resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'captureTweetScreenshot', tabId: tab.id, selectorForScreenshot },
        response => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (response?.success) {
            resolve(response); // Resolve with the screenshot data
          } else {
            reject(new Error(response?.error || 'Unknown error while capturing screenshot.'));
          }
        },
      );
    },
  );

  try {
    const screenshotResponse = await screenshotSaved;
    console.log('Screenshot cropped');

    // return data to popup
    return screenshotResponse.croppedScreenshot ?? '';
  } catch (error) {
    console.error('Error capturing tweet screenshot:', error);
    throw error; // Re-throw the error to propagate it
  }
}

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
  /** Optional sub folder name inside `category`. Created if it doesn't exist yet. */
  subCategory?: string;
  sitemeta: SiteMeta | undefined;
  note: string;
}): Promise<{ id: number; success: boolean }> {
  let scrapedSiteData: Partial<DexieTab>;
  let xpost: XpostDexie;
  let xProfile: XProfile;
  let ytVideo: YouTube.Video;
  let ytPlaylist: YouTube.Playlist;
  let screenshot: string;

  if (popupData.sitemeta?.origin.includes('//x.com')) {
    const screenshotPref = await screenshotPrefStorage.get();
    if (screenshotPref.pref) screenshot = await captureScreenshot();
    const [tab, xdata] = await twitterController(popupData.sitemeta.url);
    scrapedSiteData = tab;
    if (tab.itemType === 'x-post') {
      xpost = xdata as XpostDexie;
      scrapedSiteData.description = xpost.content;
    } else if (tab.itemType === 'x-profile') {
      xProfile = xdata as XProfile;
    }
    console.log('scrape assign', scrapedSiteData);
    // console.log('xpost assign', xpost);
  } else if (popupData.sitemeta?.origin.includes('youtube.com')) {
    scrapedSiteData = {};
    const [tab, ytData] = await youtubeController(popupData.sitemeta.url);

    if (tab.itemType === 'yt-video') {
      ytVideo = ytData as YouTube.Video;
      scrapedSiteData = tab;
    }

    if (tab.itemType === 'yt-playlist') {
      ytPlaylist = ytData as YouTube.Playlist;
      scrapedSiteData = tab;
    }
  } else {
    const generic = await getGenericTab();
    scrapedSiteData = generic;
  }

  // Combine partialSiteData with additional site data
  const combinedSiteData = combineSiteData(popupData, scrapedSiteData) as DexieTab;

  // TODO: Assign required DexieTab attrs from XProfile
  // TODO: check itemType and save
  const mark_id = await db.transaction(
    'rw',
    [
      db.categories,
      db.subCategories,
      db.marks,
      db.x_posts,
      db.x_profiles,
      db.x_screenshots,
      db.yt_videos,
      db.yt_playlists,
      db.yt_channels,
    ],
    async () => {
      console.log('STARTING TRANS');

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

      // Optional sub category: find or create it under the resolved category
      const subCategoryName = popupData.subCategory?.trim();
      if (subCategoryName) {
        const existingSub = await db.subCategories.where({ categoryId, name: subCategoryName }).first();
        combinedSiteData.subCategoryId =
          existingSub?.id ?? (await db.subCategories.add({ categoryId, name: subCategoryName }));
      }

      // Save the tab data
      const tabSaved = await db.marks.add(combinedSiteData);

      if (combinedSiteData.itemType === 'x-post') {
        xpost.mark_id = tabSaved;
        await db.x_posts.add(xpost);
        if (screenshot) {
          await db.x_screenshots.add({ mark_id: tabSaved, data: screenshot });
        }
      } else if (combinedSiteData.itemType === 'x-profile') {
        xProfile.mark_id = tabSaved;
        await db.x_profiles.add(xProfile);
      } else if (combinedSiteData.itemType === 'yt-video') {
        ytVideo.mark_id = tabSaved;
        await db.yt_videos.add(ytVideo);
      } else if (combinedSiteData.itemType === 'yt-playlist') {
        ytPlaylist.mark_id = tabSaved;
        await db.yt_playlists.add(ytPlaylist);
      }

      return tabSaved;
    },
  );

  return { id: mark_id, success: true };
}
