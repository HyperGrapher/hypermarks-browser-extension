import { tabsGroupedStorage } from '@extension/storage';
import { getActiveTabIcon } from './chrome-utils';
import { YouTube as YT, ItemType, SingleTab } from './shared-types';

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Unexpected Error',
  message: 'Something went wrong. Please try again later.',
} as const;

function categorizeTab(url: string): string {
  if (url.includes('youtube.com')) return 'Videos';
  if (url.includes('github.com')) return 'Development';
  if (url.includes('x.com')) return 'Twitter';
  if (url.includes('stackoverflow.com')) return 'Programming';
  if (url.includes('dev.to')) return 'Programming';
  return 'Uncategorized';
}

export async function saveCurrentTab(): Promise<void> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!activeTab?.id) return;
  const favicon = await getActiveTabIcon();
  const pageInfo = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () => {
      function isYouTubeVideo(): boolean {
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

      function getYoutubeChannelDetails(): YT.Channel | null {
        if (!isYouTubeChannel()) return null;

        const channelName = document.querySelector('h1.dynamic-text-view-model-wiz__h1')?.textContent || '';

        const avatar =
          document.querySelector<HTMLImageElement>('#page-header .yt-spec-avatar-shape img.yt-core-image')?.src || '';
        const banner = document.querySelector<HTMLImageElement>('#page-header-banner  img.yt-core-image')?.src || '';
        const description =
          document.querySelector(
            '#page-header > yt-page-header-renderer > yt-page-header-view-model yt-description-preview-view-model > truncated-text > truncated-text-content > span',
          )?.textContent || '';

        const subcriberCount =
          document.querySelector(
            '#page-header > yt-page-header-renderer > yt-page-header-view-model > div > div.page-header-view-model-wiz__page-header-headline > div > yt-content-metadata-view-model > div:nth-child(3) > span:nth-child(1)',
          )?.textContent || '';

        const videoCount =
          document.querySelector(
            '#page-header > yt-page-header-renderer > yt-page-header-view-model > div > div.page-header-view-model-wiz__page-header-headline > div > yt-content-metadata-view-model > div:nth-child(3) > span:nth-child(3) > span',
          )?.textContent || '';

        const isSubscribed =
          document.querySelector(
            '#page-header > yt-page-header-renderer > yt-page-header-view-model > div > div.page-header-view-model-wiz__page-header-headline > div > yt-flexible-actions-view-model > div:nth-child(1) > yt-subscribe-button-view-model > yt-animated-action > div.animated-action__content-with-background > div.yt-subscribe-button-view-model-wiz__container > button > div.yt-spec-button-shape-next__button-text-content',
          )?.textContent === 'Subscribed';

        return { channelName, avatar, description, subcriberCount, videoCount, isSubscribed, banner };
      }

      function getYouTubeVideoDetails(): YT.Video | null {
        if (!isYouTubeVideo()) return null;

        const title = document.querySelector('#title .style-scope .ytd-watch-metadata')?.textContent || '';

        const channelName =
          document.querySelector(
            '#upload-info #channel-name #container #text-container.ytd-channel-name #text a.yt-formatted-string',
          )?.textContent || '';

        const avatar = document.querySelector<HTMLImageElement>('#owner img#img.yt-img-shadow')?.src || '';

        const description = document.querySelector('#description #snippet-text')?.textContent || '';

        const youtubeVideoId = window.location.href.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/)?.pop();

        const thumbnail = youtubeVideoId ? `http://img.youtube.com/vi/${youtubeVideoId}/0.jpg` : '';

        return { title, channelName, avatar, description, thumbnail };
      }

      function getYoutubeListDetails(): YT.Playlist | null {
        if (!isYouTubeList()) return null;

        // TODO:  position of elements change when window is resized

        const title = document.querySelector('h1.dynamic-text-view-model-wiz__h1')?.textContent || '';

        const channelName =
          document.querySelector(
            '#upload-info #channel-name #container #text-container.ytd-channel-name #text a.yt-formatted-string',
          )?.textContent || '';

        const avatar = document.querySelector<HTMLImageElement>('#page-header img.yt-core-image')?.src || '';
        const thumbnail =
          document.querySelector<HTMLImageElement>('#page-header img[alt="Play all"].yt-core-image')?.src || '';

        const description =
          document.querySelector(
            ".yt-description-preview-view-model-wiz--clickable .truncated-text-wiz.truncated-text-wiz--overlay span[role='text'].yt-core-attributed-string.yt-core-attributed-string--white-space-pre-wrap",
          )?.textContent || '';

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

        return { title, channelName, avatar, description, viewCount: views, videoCount: videos, thumbnail };
      }

      function getDescription(origin: string): string {
        let description = '';

        if (origin.includes('youtube.com')) {
          if (getItemType() === 'yt-video') {
            return getYouTubeVideoDetails()?.description ?? '';
          } else if (getItemType() === 'yt-channel') {
            return getYoutubeChannelDetails()?.description ?? '';
          } else if (getItemType() === 'yt-playlist') {
            return getYoutubeListDetails()?.description ?? '';
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
    chrome.notifications.create('save-error', notificationOptions);
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
    tags: ['tag1', 'tag2'],
    itemType: data.item_type,
    note: undefined,
    youtubeChannel: data.youtube_channel ?? undefined,
    youtubePlaylist: data.youtube_list ?? undefined,
    youtubeVideo: data.youtube_video
      ? {
          title: data.youtube_video.title,
          channelName: data.youtube_video.channelName,
          description: data.youtube_video.description,
          thumbnail: data.youtube_video.thumbnail,
          avatar: data.youtube_video.avatar,
        }
      : undefined,
  };

  const category = categorizeTab(tab.url);

  await tabsGroupedStorage.save(category, tab);
}
