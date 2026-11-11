import { DexieTab } from '@extension/storage';
import { getActiveTabIcon } from '../chrome-utils';

type PageInfo = { title: string; description: string };

/**
 * Pages Chrome does not let extensions inject scripts into (the Chrome Web Store, ...) make `executeScript` throw.
 * Their title and description are still in the page's HTML, which the extension may download (host_permissions).
 */
async function getPageInfoByFetch(url: string, tabTitle: string): Promise<PageInfo> {
  let title = tabTitle;
  let description = '';
  try {
    const response = await fetch(url);
    if (response.ok) {
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const meta = (selector: string) => doc.querySelector(selector)?.getAttribute('content') ?? '';
      title = doc.title || meta('meta[property="og:title"]') || tabTitle;
      description = meta('meta[name="description"]') || meta('meta[property="og:description"]');
    }
  } catch (error) {
    console.warn('Could not download the page to read its description', error);
  }
  return { title, description };
}

export async function getGenericTab(): Promise<Partial<DexieTab>> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) throw new Error('No active tab found');

  let data: PageInfo | undefined;
  try {
    const pageInfo = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => {
        function getDescription(): string {
          const description =
            document.querySelector('meta[name="description"]')?.getAttribute('content') ||
            document.querySelector('h2')?.textContent ||
            '';

          return description;
        }

        const description = getDescription();
        return {
          title: document.title || document.querySelector('h1')?.textContent || '',
          url: window.location.href,
          origin: 'generic',
          description,
        };
      },
    });
    data = pageInfo[0]?.result;
  } catch (error) {
    console.warn('Cannot inject a script into this page, reading it with fetch instead', error);
    if (!activeTab.url) throw error;
    data = await getPageInfoByFetch(activeTab.url, activeTab.title ?? '');
  }

  if (!data) {
    // TODO show notification
    // chrome.notifications.create('save-error', notificationOptions);
    throw new Error('Error getting data from page');
  }

  //   const titleCleaned = data.title.endsWith('- YouTube') ? data.title.slice(0, -10) : data.title;

  const tab: Partial<DexieTab> = {
    title: data.title,
    description: data.description,
    itemType: 'other',
  };

  return tab;
}
