import '@src/Popup.css';
import { getActiveTabIcon, withErrorBoundary, withSuspense } from '@extension/shared';
import {
  tabsGroupedStorage,
  type YoutubeVideo,
  type SingleTab,
  type YoutubeList,
  type YoutubeChannel,
  type ItemType,
} from '@extension/storage';
import { Button, PillsFormDemo } from '@extension/ui';

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

/*
  eski: https://img.youtube.com/vi/2fSBLH-ISaE/0.jpg
  yeni https://i.ytimg.com/vi/2fSBLH-ISaE/hqdefault.jpg
  
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
        function isYouTubeVideo(): boolean {
          console.log(window.location); // prints into webpage console
          console.log(window.location.hostname);
          return window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/watch');
        }

        function isYouTubeChannel(): boolean {
          return (
            window.location.hostname.includes('youtube.com') &&
            (window.location.pathname.startsWith('/@') || window.location.pathname.startsWith('/channel'))
          );
        }

        function isYouTubeList(): boolean {
          return window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/playlist');
        }

        function getItemType(): ItemType {
          if (window.location.pathname.startsWith('/watch')) return 'yt-video';
          if (window.location.pathname.startsWith('/channel')) return 'yt-channel';
          if (window.location.pathname.startsWith('/@')) return 'yt-channel';
          if (window.location.pathname.startsWith('/playlist')) return 'yt-playlist';
          return 'other';
        }

        function getYoutubeChannelDetails(): YoutubeChannel | null {
          if (!isYouTubeChannel()) return null;

          const name = document.querySelector('h1.dynamic-text-view-model-wiz__h1')?.textContent || '';

          const avatar =
            document.querySelector<HTMLImageElement>('#page-header .yt-spec-avatar-shape img.yt-core-image')?.src || '';
          const banner = document.querySelector<HTMLImageElement>('#page-header-banner  img.yt-core-image')?.src || '';
          const desc =
            document.querySelector(
              '#page-header > yt-page-header-renderer > yt-page-header-view-model yt-description-preview-view-model > truncated-text > truncated-text-content > span',
            )?.textContent || '';

          const subs =
            document.querySelector(
              '#page-header > yt-page-header-renderer > yt-page-header-view-model > div > div.page-header-view-model-wiz__page-header-headline > div > yt-content-metadata-view-model > div:nth-child(3) > span:nth-child(1)',
            )?.textContent || '';

          const videos =
            document.querySelector(
              '#page-header > yt-page-header-renderer > yt-page-header-view-model > div > div.page-header-view-model-wiz__page-header-headline > div > yt-content-metadata-view-model > div:nth-child(3) > span:nth-child(3) > span',
            )?.textContent || '';

          const is_subbed =
            document.querySelector(
              '#page-header > yt-page-header-renderer > yt-page-header-view-model > div > div.page-header-view-model-wiz__page-header-headline > div > yt-flexible-actions-view-model > div:nth-child(1) > yt-subscribe-button-view-model > yt-animated-action > div.animated-action__content-with-background > div.yt-subscribe-button-view-model-wiz__container > button > div.yt-spec-button-shape-next__button-text-content',
            )?.textContent === 'Subscribed';

          return { name, avatar, desc, subs, videos, is_subbed, banner };
        }

        function getYouTubeVideoDetails(): YoutubeVideo | null {
          if (!isYouTubeVideo()) return null;

          const channel_name =
            document.querySelector(
              '#upload-info #channel-name #container #text-container.ytd-channel-name #text a.yt-formatted-string',
            )?.textContent || '';

          const avatar = document.querySelector<HTMLImageElement>('#owner img#img.yt-img-shadow')?.src || '';

          // const yt_video_desc =
          //   document.querySelector('#description #snippet-text span.yt-core-attributed-string--link-inherit-color')
          //     ?.textContent || '';

          const desc = document.querySelector('#description #snippet-text')?.textContent || '';

          const youtubeVideoId = window.location.href.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/)?.pop();
          const thumb = youtubeVideoId ? `http://img.youtube.com/vi/${youtubeVideoId}/0.jpg` : '';

          return { channel_name, avatar, desc, thumb };
        }

        function getYoutubeListDetails(): YoutubeList | null {
          if (!isYouTubeList()) return null;

          const title = document.querySelector('h1.dynamic-text-view-model-wiz__h1')?.textContent || '';

          const channel =
            document.querySelector(
              '#upload-info #channel-name #container #text-container.ytd-channel-name #text a.yt-formatted-string',
            )?.textContent || '';

          // const avatar = document.querySelector<HTMLImageElement>('#owner img#img.yt-img-shadow')?.src || '';
          const avatar = document.querySelector<HTMLImageElement>('#page-header img.yt-core-image')?.src || '';
          const thumb =
            document.querySelector<HTMLImageElement>('#page-header img[alt="Play all"].yt-core-image')?.src || '';
          // TODO: Simplify selectors
          const desc =
            document.querySelector(
              ".yt-description-preview-view-model-wiz--clickable .truncated-text-wiz.truncated-text-wiz--overlay span[role='text'].yt-core-attributed-string.yt-core-attributed-string--white-space-pre-wrap",
            )?.textContent || '';

          // yt-content-metadata-view-model-wiz__metadata-row
          // #page-header > yt-page-header-renderer > yt-page-header-view-model > div.page-header-view-model-wiz__page-header-content > div.page-header-view-model-wiz__page-header-headline > div > yt-content-metadata-view-model > div:nth-child(3)

          const metadataElems = document.querySelectorAll(
            '#page-header .yt-content-metadata-view-model-wiz__metadata-row--metadata-row-inline span[role="text"][dir="auto"].yt-core-attributed-string.yt-content-metadata-view-model-wiz__metadata-text',
          );
          let videos = '0 videos';
          let views = '0 views';

          metadataElems.forEach(item => {
            if (item && item.textContent?.includes('views')) {
              views = item.textContent;
            } else if (item && item.textContent?.includes('videos')) {
              videos = item.textContent;
            }
          });

          return { title, channel, avatar, desc, views, videos, thumb };
        }

        function getDescription(origin: string): string {
          console.log({ origin });

          let description = '';

          if (origin.includes('youtube.com')) {
            if (getItemType() === 'yt-video') {
              return getYouTubeVideoDetails()?.desc ?? '';
            } else if (getItemType() === 'yt-channel') {
              return getYoutubeChannelDetails()?.desc ?? '';
            } else if (getItemType() === 'yt-playlist') {
              return getYoutubeListDetails()?.desc ?? '';
            }
          }

          if (origin.includes('github.com')) {
            description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
            return description;
          }

          if (origin.includes('x.com')) {
            description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
            return description;
          }

          description =
            document.querySelector('meta[name="description"]')?.getAttribute('content') ||
            document.querySelector('h2')?.textContent ||
            '';

          return description;
        }

        const origin = window.location.hostname.startsWith('www')
          ? window.location.hostname.slice(4)
          : window.location.hostname;
        const description = getDescription(origin);
        return {
          title: document.title || document.querySelector('h1')?.textContent || '',
          url: window.location.href,
          origin,
          description,
          item_type: getItemType(),
          youtube_video: getYouTubeVideoDetails(),
          youtube_channel: getYoutubeChannelDetails(),
          youtube_list: getYoutubeListDetails(),
        };
      },
    });

    const data = pageInfo[0]?.result;

    if (!data) {
      chrome.notifications.create('inject-error', notificationOptions);
      return;
    }

    const titleCleaned = data.title.endsWith('- YouTube') ? data.title.slice(0, -10) : data.title;

    const tab: SingleTab = {
      title: titleCleaned,
      description: data.description,
      origin: data.origin || '',
      url: data.url || '',
      icon: favicon || '',
      datetime: new Date().toISOString(),
      tags: ['tag1', 'tag2'], // Replace with actual logic if needed
      item_type: data.item_type,
      note: undefined,
      youtube_channel: data.youtube_channel ?? undefined,
      youtube_list: data.youtube_list ?? undefined,
      youtube_video: data.youtube_video
        ? {
            channel_name: data.youtube_video.channel_name,
            desc: data.youtube_video.desc,
            thumb: data.youtube_video.thumb,
            avatar: data.youtube_video.avatar,
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
        <PillsFormDemo />
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
