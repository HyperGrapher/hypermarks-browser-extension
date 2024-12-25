import { OpenAction, SiteMeta } from './shared-types';

export async function getActiveTabMeta(): Promise<SiteMeta | null> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      const activeTab = tabs[0];
      if (activeTab) {
        const origin = activeTab.url ? new URL(activeTab.url).origin : '';
        const titleAndIconAndUrl = {
          title: activeTab.title ?? '',
          icon: activeTab.favIconUrl ?? '',
          url: activeTab.url ?? '',
          origin,
        };
        resolve(titleAndIconAndUrl);
      } else {
        resolve(null);
      }
    });
  });
}

export async function getActiveTabIcon(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const activeTab = tabs[0];
      if (activeTab && activeTab.favIconUrl) {
        resolve(activeTab.favIconUrl);
      } else {
        resolve(null);
      }
    });
  });
}

export async function getAllTabIcons(): Promise<
  Array<{ id: number | undefined; title: string | undefined; icon: string | null }>
> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({}, tabs => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const tabIcons = tabs.map(tab => ({
        id: tab.id,
        title: tab.title,
        icon: tab.favIconUrl || null,
      }));
      resolve(tabIcons);
    });
  });
}

export async function deleteAllTabData(): Promise<void> {
  try {
    await chrome.storage.local.remove('pageInfoList');
    await chrome.storage.local.remove('tabs-storage-key');
    await chrome.storage.local.remove('grouped-tabs-storage');
    console.log('Page list cleared successfully');
    // Optionally refresh your UI here...
  } catch (error) {
    console.error('Error clearing page list:', error);
  }
}

export async function openTab(url: string) {
  const settings = await chrome.storage.sync.get('user-prefs'); // {openInNewTab: true}
  if (!settings.openInNewTab) {
    chrome.tabs.create({ url });
    return;
  }
  chrome.tabs.update({ url });
}

export async function openTabByAction(url: string, action: OpenAction) {
  if (action === 'new-tab') {
    chrome.tabs.create({ url });
    return;
  }
  if (action === 'new-window') {
    // open in new window
    chrome.windows.create({ url });
    return;
  }
  if (action === 'incognito') {
    // open in new window
    chrome.windows.create({ url, incognito: true });
    return;
  }
  chrome.tabs.update({ url });
}
