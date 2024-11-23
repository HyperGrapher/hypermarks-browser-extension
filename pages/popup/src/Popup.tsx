import '@src/Popup.css';
import { getActiveTabIcon, withErrorBoundary, withSuspense } from '@extension/shared';
import { tabsGroupedStorage, type SingleTab } from '@extension/storage';
import { Button } from '@extension/ui';

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

/*
 #* fikir su:
 #* alt categori olustur . belli basli siteler, ozellikle dedicated data/ui'i olan
 #* 
 */

function categorizeTab(url: string): string {
  if (url.includes('youtube.com')) return 'Videos';
  if (url.includes('github.com')) return 'Development';
  if (url.includes('x.com')) return 'Twitter';
  if (url.includes('stackoverflow.com')) return 'Programming';
  if (url.includes('dev.to')) return 'Programming';
  return 'Uncategorized';
}

const Popup = () => {
  async function saveCurrentTabCategorized(): Promise<void> {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!activeTab?.id) return;
    const favicon = await getActiveTabIcon();
    const pageInfo = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => {
        function isYouTube(): boolean {
          console.log(window.location.hostname + 'powowowp'); // prints extension id
          return window.location.hostname.includes('youtube.com');
        }

        function getYouTubeDetails(): {
          yt_channel: string;
          yt_channel_img: string;
          yt_video_desc: string;
          yt_video_thumb: string;
        } | null {
          if (!isYouTube()) return null;

          const yt_channel =
            document.querySelector(
              '#upload-info #channel-name #container #text-container.ytd-channel-name #text a.yt-formatted-string',
            )?.textContent || '';

          const yt_channel_img = document.querySelector<HTMLImageElement>('#owner img#img.yt-img-shadow')?.src || '';

          const yt_video_desc =
            document.querySelector('#description #snippet-text span.yt-core-attributed-string--link-inherit-color')
              ?.textContent || '';

          const youtubeVideoId = window.location.href.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/)?.pop();
          const yt_video_thumb = youtubeVideoId ? `http://img.youtube.com/vi/${youtubeVideoId}/0.jpg` : '';

          return { yt_channel, yt_channel_img, yt_video_desc, yt_video_thumb };
        }

        const youtubeDetails = getYouTubeDetails();

        return {
          title: document.title || document.querySelector('h1')?.textContent || '',
          url: window.location.href,
          description:
            document.querySelector('meta[name="description"]')?.getAttribute('content') ||
            document.querySelector('h2')?.textContent ||
            '',
          youtube: youtubeDetails,
        };
      },
    });

    const tabInfo = pageInfo[0]?.result;

    if (!tabInfo) {
      chrome.notifications.create('inject-error', notificationOptions);
      return;
    }

    const tab: SingleTab = {
      title: tabInfo.title || '',
      description: tabInfo.youtube ? tabInfo.youtube.yt_video_desc : tabInfo.description || '',
      url: tabInfo.url || '',
      icon: favicon || '',
      datetime: new Date().toISOString(),
      tags: ['tag1', 'tag2'], // Replace with actual logic if needed
      youtube: tabInfo.youtube
        ? {
            yt_channel: tabInfo.youtube.yt_channel,
            yt_video_desc: tabInfo.youtube.yt_video_desc,
            yt_video_thumb: tabInfo.youtube.yt_video_thumb,
            yt_channel_img: tabInfo.youtube.yt_channel_img,
          }
        : undefined,
    };

    const category = categorizeTab(tab.url); // Determine category dynamically

    await tabsGroupedStorage.save(category, tab);
  }

  async function clearPageList(): Promise<void> {
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

  return (
    <div className={`App`}>
      <header className={`App-header h-full`}>
        <Button onClick={saveCurrentTabCategorized} variant="default">
          Save current Tab
        </Button>
        <button className="mt-4 rounded bg-red-500 px-4 py-1 font-bold shadow hover:scale-105" onClick={clearPageList}>
          Clear saved pages...
        </button>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
