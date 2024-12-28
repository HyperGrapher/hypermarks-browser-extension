import { DexieTab } from '@extension/storage/lib/dexie/db';
import { getActiveTabIcon } from '../chrome-utils';

export async function getGenericTab(): Promise<Partial<DexieTab>> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) throw new Error('No active tab found');

  const favicon = await getActiveTabIcon();
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

  const data = pageInfo[0]?.result;

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
