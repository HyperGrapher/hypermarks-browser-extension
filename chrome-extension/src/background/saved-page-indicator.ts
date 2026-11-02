import { db, onMarksChanged } from '@extension/storage';

const BADGE_TEXT = '✓';
const BADGE_COLOR = '#16a34a';
const BADGE_TEXT_COLOR = '#ffffff';
const REFRESH_DEBOUNCE_MS = 150;

/**
 * A comparable key for a page, so the same page matches even when the address differs in ways that do not change
 * the page: `#hash`, `www.`, a trailing slash, a YouTube video opened with `&t=` / `&list=`, tracking params on X.
 * Returns null for pages that can never be saved (chrome://, about:, ...).
 */
export function pageKey(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const path = url.pathname.replace(/\/+$/, '');

  if (host === 'youtu.be' && path.length > 1) return `youtube.com/watch?v=${path.slice(1)}`;
  if (host === 'youtube.com') {
    const video = url.searchParams.get('v');
    if (path === '/watch' && video) return `youtube.com/watch?v=${video}`;
    const playlist = url.searchParams.get('list');
    if (path === '/playlist' && playlist) return `youtube.com/playlist?list=${playlist}`;
  }
  // The address of a post / profile is its path, the query only carries tracking params (?s=20, ?t=...)
  if (host === 'x.com' || host === 'twitter.com') return `x.com${path}`;

  return `${host}${path}${url.search}`;
}

/** True if an item with the same page address is saved. `origin` is indexed, so only that origin's items are read. */
export async function isPageSaved(rawUrl: string): Promise<boolean> {
  const key = pageKey(rawUrl);
  if (!key) return false;
  const origin = new URL(rawUrl).origin;
  const match = await db.marks
    .where('origin')
    .equals(origin)
    .filter(mark => pageKey(mark.url) === key)
    .first();
  return match !== undefined;
}

async function updateTabIndicator(tab: chrome.tabs.Tab) {
  if (tab.id === undefined) return;
  try {
    const saved = tab.url ? await isPageSaved(tab.url) : false;
    await chrome.action.setBadgeText({ tabId: tab.id, text: saved ? BADGE_TEXT : '' });
  } catch (error) {
    // The tab was closed while it was being updated
    console.debug('Could not update saved page indicator', error);
  }
}

async function updateAllTabs() {
  const tabs = await chrome.tabs.query({});
  await Promise.all(tabs.map(updateTabIndicator));
}

async function updateActiveTabs() {
  const tabs = await chrome.tabs.query({ active: true });
  await Promise.all(tabs.map(updateTabIndicator));
}

let refreshTimer: ReturnType<typeof setTimeout> | undefined;

/** Saved items changed (save, delete, edit, import): every open tab may be affected. */
export function refreshSavedPageIndicators() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => void updateAllTabs(), REFRESH_DEBOUNCE_MS);
}

/**
 * Shows a badge on the extension icon of the tabs whose page is already saved.
 * Must be called synchronously at the top level of the service worker so the listeners are registered on wake up.
 */
export function initSavedPageIndicator() {
  chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR });
  chrome.action.setBadgeTextColor?.({ color: BADGE_TEXT_COLOR });

  // Navigating clears a tab's badge, so it is applied again when the navigation starts/finishes and on SPA url changes
  chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.status) void updateTabIndicator(tab);
  });
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.tabs.get(tabId).then(updateTabIndicator, () => {});
  });
  chrome.tabs.onReplaced.addListener(addedTabId => {
    chrome.tabs.get(addedTabId).then(updateTabIndicator, () => {});
  });
  chrome.runtime.onStartup.addListener(() => void updateAllTabs());
  chrome.runtime.onInstalled.addListener(() => void updateAllTabs());

  // Changes made inside the service worker itself (e.g. saving from the YouTube menu)
  onMarksChanged(refreshSavedPageIndicators);

  // The worker was woken up by something else and may have missed events while it was asleep
  void updateActiveTabs();
}
