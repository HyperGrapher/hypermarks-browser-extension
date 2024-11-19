import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import {
  exampleThemeStorage,
  tabsStorage,
  tabsGroupedStorage,
  type CategorizedTab,
  type SingleTab,
} from '@extension/storage';
import type { ComponentPropsWithoutRef } from 'react';

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

function categorizeTab(url: string): string {
  if (url.includes('youtube.com')) return 'Videos';
  if (url.includes('github.com')) return 'Development';
  if (url.includes('x.com')) return 'Twitter';
  if (url.includes('stackoverflow.com')) return 'Programming';
  if (url.includes('dev.to')) return 'Programming';
  return 'Uncategorized';
}

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const tabStore = useStorage(tabsStorage);
  const isLight = theme === 'light';
  const logo = isLight ? 'popup/empty_logo.svg' : 'popup/empty_logo.svg';

  function ex_getFaviconUrlEx(): string {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!favicon) {
      const shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement | null;
      if (!shortcutIcon) {
        const touchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
        if (!touchIcon) {
          return '';
        }
        return touchIcon.href || '';
      }
      return shortcutIcon.href || '';
    }
    return favicon.href || '';
  }

  const goGithubSite = () =>
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  // const injectContentScript = async () => {
  //   const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

  //   if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
  //     chrome.notifications.create('inject-error', notificationOptions);
  //   }

  //   await chrome.scripting
  //     .executeScript({
  //       target: { tabId: tab.id! },
  //       files: ['/content-runtime/index.iife.js'],
  //     })
  //     .catch(err => {
  //       // Handling errors related to other paths
  //       if (err.message.includes('Cannot access a chrome:// URL')) {
  //         chrome.notifications.create('inject-error', notificationOptions);
  //       }
  //     });
  // };

  async function saveCurrentPage(): Promise<void> {
    // Get active tab information
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!activeTab?.id) return;

    // Execute script in the tab context to get page details
    const pageInfo = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      // query the tab to get the favicon url
      func: () => {
        function getFaviconUrl(): string {
          const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
          if (!favicon) {
            const shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement | null;
            if (!shortcutIcon) {
              const touchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
              if (!touchIcon) {
                return '';
              }
              return touchIcon.href || '';
            }
            return shortcutIcon.href || '';
          }
          return favicon.href || '';
        }

        function getYoutubeThumbnail(url: string): string {
          // http://img.youtube.com/vi/FQXuCyL4oUM/0.jpg
          // http://img.youtube.com/vi/[video-id]/[thumbnail-number].jpg

          const youtube_video_id = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/)?.pop();

          return `http://img.youtube.com/vi/${youtube_video_id}/0.jpg`;
        }

        return {
          title: document.title || document.querySelector('h1')?.textContent,
          url: window.location.href,
          // TODO: Youtube ise yt_video_desc icerigi buraya gelecek
          description:
            document.querySelector('meta[name="description"]')?.getAttribute('content') ||
            (document.querySelector('h2')?.textContent ?? ''),
          icon: getFaviconUrl(),
          // TODO: make a function to get channel name when visiting user channel too.
          yt_channel:
            document.title.toLowerCase().includes('youtube') &&
            document.querySelector(
              '#upload-info > #channel-name > #container > #text-container.ytd-channel-name > #text > a.yt-formatted-string',
            )?.textContent,
          yt_channel_img:
            document.title.toLowerCase().includes('youtube') &&
            (document.querySelector<HTMLImageElement>('#owner img#img.yt-img-shadow')?.src || 'nope'),
          yt_video_desc:
            document.title.toLowerCase().includes('youtube') &&
            (document.querySelector('#description #snippet-text span.yt-core-attributed-string--link-inherit-color')
              ?.textContent ||
              'No Description'),
          yt_video_thumb:
            window.location.href.includes('youtube.com/watch?v') && getYoutubeThumbnail(window.location.href),
        };
      },
    });

    // The result is an array of injected script results, we want the first one
    const tabInfo = pageInfo[0].result;

    // Save to storage
    const { pageInfoList = [] } = await chrome.storage.local.get('pageInfoList');
    const newPageInfoList = [...pageInfoList, tabInfo];
    await chrome.storage.local.set({ pageInfoList: newPageInfoList });
  }

  async function saveCurrentTab(): Promise<void> {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!activeTab?.id) return;

    // Execute script in the tab context to get page details
    const pageInfo = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      // query the tab to get the favicon url
      func: () => {
        function getFaviconUrl(): string {
          const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
          if (!favicon) {
            const shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement | null;
            if (!shortcutIcon) {
              const touchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
              if (!touchIcon) {
                return '';
              }
              return touchIcon.href || '';
            }
            return shortcutIcon.href || '';
          }
          return favicon.href || '';
        }

        function getYoutubeThumbnail(url: string): string {
          // http://img.youtube.com/vi/FQXuCyL4oUM/0.jpg
          // http://img.youtube.com/vi/[video-id]/[thumbnail-number].jpg

          const youtube_video_id = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/)?.pop();

          return `http://img.youtube.com/vi/${youtube_video_id}/0.jpg`;
        }

        return {
          title: document.title || document.querySelector('h1')?.textContent,
          url: window.location.href,
          // TODO: Youtube ise yt_video_desc icerigi buraya gelecek
          description:
            document.querySelector('meta[name="description"]')?.getAttribute('content') ||
            (document.querySelector('h2')?.textContent ?? ''),
          icon: getFaviconUrl(),
          // TODO: make a function to get channel name when visiting user channel too.
          yt_channel:
            document.title.toLowerCase().includes('youtube') &&
            document.querySelector(
              '#upload-info > #channel-name > #container > #text-container.ytd-channel-name > #text > a.yt-formatted-string',
            )?.textContent,
          yt_channel_img:
            document.title.toLowerCase().includes('youtube') &&
            (document.querySelector<HTMLImageElement>('#owner img#img.yt-img-shadow')?.src || 'nope'),
          yt_video_desc:
            document.title.toLowerCase().includes('youtube') &&
            (document.querySelector('#description #snippet-text span.yt-core-attributed-string--link-inherit-color')
              ?.textContent ||
              'No Description'),
          yt_video_thumb:
            window.location.href.includes('youtube.com/watch?v') && getYoutubeThumbnail(window.location.href),
        };
      },
    });

    // The result is an array of injected script results, we want the first one
    const tabInfo = pageInfo[0].result;

    const tab: SingleTab = {
      title: tabInfo?.title ?? '',
      description: tabInfo?.description ?? '',
      url: tabInfo?.url ?? '',
      icon: tabInfo?.icon ?? '',
      tags: ['tag1', 'tag2'],
      youtube: undefined,

      // tabInfo?.yt_channel && {
      //   yt_channel: tabInfo.yt_channel ?? '',
      //   yt_video_desc: tabInfo.yt_video_desc ?? '',
      //   yt_video_thumb: tabInfo.yt_video_thumb ?? '',
      //   yt_channel_img: tabInfo.yt_channel_img ?? '',
      // }
    };

    tabsStorage.save({
      category: 'Programming',
      item: tab,
    });
  }

  async function saveCurrentTabCategorized(): Promise<void> {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!activeTab?.id) return;

    const pageInfo = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => {
        function getFaviconUrl(): string {
          const favicon =
            document.querySelector<HTMLLinkElement>('link[rel="icon"]') ||
            document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]') ||
            document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
          return favicon?.href || '';
        }

        function isYouTube(): boolean {
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
          icon: getFaviconUrl(),
          youtube: youtubeDetails,
        };
      },
    });

    const tabInfo = pageInfo[0]?.result;

    if (!tabInfo) return;

    const tab: SingleTab = {
      title: tabInfo.title || '',
      description: tabInfo.youtube ? tabInfo.youtube.yt_video_desc : tabInfo.description || '',
      url: tabInfo.url || '',
      icon: tabInfo.icon || '',
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
    await saveCurrentTab();
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

  // With confirmation dialog
  async function clearPageListWithConfirm(): Promise<void> {
    if (window.confirm('Are you sure you want to clear all saved pages?')) {
      await clearPageList();
    }
  }

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        <button className="hidden" onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button>

        {/* <button
          className={
            'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
            (isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white')
          }
          onClick={injectContentScript}>
          Click to inject Content Script!
        </button> */}

        <button
          className="font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 bg-blue-500"
          onClick={saveCurrentTabCategorized}>
          Save current Tab
        </button>

        <button className="font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 bg-red-500" onClick={clearPageList}>
          Clear saved pages...
        </button>

        <ToggleButton>Toggle theme</ToggleButton>
      </header>
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorage(exampleThemeStorage);
  return (
    <button
      className={
        props.className +
        ' ' +
        'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
        (theme === 'light' ? 'bg-white text-black shadow-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
