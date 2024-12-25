import { tabsGroupedStorage } from '@extension/storage';
import { getActiveTabIcon } from './chrome-utils';
import type { YouTube as YT, ItemType, SingleTab, Xpost } from './shared-types';
// import { generateCategoryAndTags } from './gemini-ai';
// import { getXPostContent } from './xcom-queries';

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

export async function getAiResponseForTab() /* : Promise<{ category: string; tags: string[] }> */ {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!activeTab?.id) throw new Error('No active tab found');
  const favicon = await getActiveTabIcon();
  const pageInfo = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () => {
      function isXPost(): boolean {
        return window.location.hostname.includes('x.com') && window.location.pathname.includes('/status/');
      }

      function isYouTubeVideo(): boolean {
        return window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/watch');
      }

      function isYouTubeShorts(): boolean {
        return window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/shorts');
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
        if (window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/watch'))
          return 'yt-video';
        if (window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/shorts'))
          return 'yt-shorts';
        if (window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/channel'))
          return 'yt-channel';
        if (window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/@'))
          return 'yt-channel';
        if (window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/playlist'))
          return 'yt-playlist';
        if (window.location.hostname.includes('x.com') && window.location.pathname.includes('/status/'))
          return 'x-post';
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

      function getYoutubeShortsDetails(): YT.Short | null {
        if (!isYouTubeShorts()) return null;

        const avatar =
          document.querySelector<HTMLImageElement>('#metapanel img.yt-core-image.yt-core-image--loaded')?.src || '';
        const channelName = document.querySelector('#metapanel span.yt-core-attributed-string > a')?.textContent || '';
        const youtubeVideoId = window.location.pathname.split('/')[2];
        const thumbnail = youtubeVideoId ? `http://img.youtube.com/vi/${youtubeVideoId}/0.jpg` : '';

        return { avatar, channelName, thumbnail };
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
        // TODO: make these number for better search
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

      function getXPostContent(): Xpost | null {
        if (!isXPost) return null;

        let profileName = '';
        let handle = '';
        let avatar = '';
        let content = '';
        let views = '';
        let likes = '';
        let comments = '';
        let datetime;
        let datetimeStr = '';
        let isPremium = false;
        avatar =
          document.querySelector<HTMLImageElement>(
            '[data-testid="tweet"][tabindex="-1"] [data-testid="Tweet-User-Avatar"] img',
          )?.src || '';

        if (avatar.endsWith('normal.jpg')) avatar = avatar.replace('normal.jpg', '400x400.jpg');

        isPremium = !!document.querySelector(
          '[data-testid="tweet"][tabindex="-1"] [data-testid="User-Name"] [data-testid="icon-verified"]',
        );

        profileName =
          document
            .querySelector('[data-testid="tweet"][tabindex="-1"] [data-testid="User-Name"] span')
            ?.textContent?.trim() || '';
        handle =
          document
            .querySelector('[data-testid="tweet"][tabindex="-1"] [data-testid="User-Name"] a')
            ?.getAttribute('href') || '';
        handle = handle.slice(1); // remove "/" char at the start

        views =
          document.querySelector('[data-testid="tweet"][tabindex="-1"] [data-testid="app-text-transition-container"]')
            ?.textContent || '0';
        likes =
          document.querySelector(
            '[data-testid="tweet"][tabindex="-1"] [data-testid="like"] [data-testid="app-text-transition-container"]',
          )?.textContent || '0';

        datetime = document.querySelector('[data-testid="tweet"][tabindex="-1"] time')?.getAttribute('datetime');

        // TODO: Check in tests if date is "1970-01-01T00:00:00.000Z", this is kinda smoke test.
        datetime = new Date(datetime ?? 0).toISOString();

        datetimeStr = document.querySelector('[data-testid="tweet"][tabindex="-1"] time')?.textContent || '';
        content =
          document
            .querySelector('[data-testid="tweet"][tabindex="-1"] [data-testid="tweetText"]')
            ?.textContent?.trim() || '';

        const obj = {
          likes,
          views,
          handle,
          profileName,
          datetime,
          datetimeStr,
          isPremium,
          content,
          avatar,
          comments,
        } satisfies Xpost;
        // console.log(obj);

        return obj;
      }

      function getDescription(origin: string): string {
        let description = '';

        if (origin.includes('youtube.com')) {
          if (getItemType() === 'yt-video') {
            return getYouTubeVideoDetails()?.description ?? '';
          } else if (getItemType() === 'yt-shorts') {
            return 'No description available for shorts';
          } else if (getItemType() === 'yt-channel') {
            return getYoutubeChannelDetails()?.description ?? '';
          } else if (getItemType() === 'yt-playlist') {
            return getYoutubeListDetails()?.description ?? '';
          } else return '';
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
        youtube_short: getYoutubeShortsDetails(),
        youtube_list: getYoutubeListDetails(),
        xpost: getXPostContent(),
      };
    },
  });

  const data = pageInfo[0]?.result;

  if (!data) {
    chrome.notifications.create('save-error', notificationOptions);
    throw new Error('Error getting data from page');
  }

  const titleCleaned = data.title.endsWith('- YouTube') ? data.title.slice(0, -10) : data.title;

  console.log(`aiResult for: \n${data.title} \n${data.description}`);
  const aiResult = {}; //await generateCategoryAndTags(data.title, data.description);
  console.log(aiResult);

  return aiResult;
}

// https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/cookbook.offscreen-dom/offscreen.js
export async function captureTweetScreenshot() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log({ sharedTabId: tab.id });

  chrome.runtime.sendMessage({ action: 'captureTweetScreenshot', tabId: tab.id }, response => {
    console.log(response);

    if (response?.success) {
      console.log('Screenshot saved:', response.key);
    } else {
      console.log('Error capturing tweet screenshot:', response?.error);
    }
    return true;
  });

  // Get element bounds

  // chrome.tabs.sendMessage(tab.id!, { action: 'getElementBounds' }, response => {
  //   console.log(response);

  //   if (response?.success) {
  //     const bounds = response.bounds;

  //     // Capture element screenshot
  //     chrome.runtime.sendMessage({ action: 'captureElement', bounds }, screenshotResponse => {
  //       if (screenshotResponse?.success) {
  //         const base64Image = screenshotResponse.screenshot;
  //         console.log('base64Image');
  //         console.log(base64Image);

  //         // Save the base64 image to local storage
  //         const key = `tweet_screenshot`; // Unique key for each image
  //         // chrome.storage.local.set(key, base64Image);

  //         console.log(`Screenshot saved to local storage with key: ${key}`);
  //       } else {
  //         console.log(screenshotResponse?.error || screenshotResponse);
  //       }
  //     });
  //   } else {
  //     console.error('Failed to get element bounds');
  //   }
  // });
}

export async function saveCurrentTab(tags: string[] | null, category: string): Promise<boolean> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) return false;

  const favicon = await getActiveTabIcon();
  const pageInfo = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () => {
      function isXPost(): boolean {
        return window.location.hostname.includes('x.com') && window.location.pathname.includes('/status/');
      }

      function isYouTubeVideo(): boolean {
        return window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/watch');
      }

      function isYouTubeShorts(): boolean {
        return window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/shorts');
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
        if (window.location.pathname.startsWith('/shorts')) return 'yt-shorts';
        if (window.location.pathname.startsWith('/channel')) return 'yt-channel';
        if (window.location.pathname.startsWith('/@')) return 'yt-channel';
        if (window.location.pathname.startsWith('/playlist')) return 'yt-playlist';
        if (window.location.hostname.includes('x.com') && window.location.pathname.includes('/status/'))
          return 'x-post';
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

      function getYoutubeShortsDetails(): YT.Short | null {
        if (!isYouTubeShorts()) return null;

        const avatar =
          document.querySelector<HTMLImageElement>('#metapanel img.yt-core-image.yt-core-image--loaded')?.src || '';
        const channelName = document.querySelector('#metapanel span.yt-core-attributed-string > a')?.textContent || '';
        const youtubeVideoId = window.location.pathname.split('/')[2];
        const thumbnail = youtubeVideoId ? `http://img.youtube.com/vi/${youtubeVideoId}/0.jpg` : '';

        return { avatar, channelName, thumbnail };
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
          } else if (getItemType() === 'yt-shorts') {
            return 'No description available for shorts';
          } else if (getItemType() === 'yt-channel') {
            return getYoutubeChannelDetails()?.description ?? '';
          } else if (getItemType() === 'yt-playlist') {
            return getYoutubeListDetails()?.description ?? '';
          } else return '';
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

      function getXPostContent(): Xpost | null {
        if (!isXPost) return null;

        let profileName = '';
        let handle = '';
        let avatar = '';
        let content = '';
        let views = '';
        let likes = '';
        let comments = '';
        let datetime;
        let datetimeStr = '';
        let isPremium = false;
        // let photos = ''; // data-testid="tweetPhoto"

        let photoElems = document.querySelectorAll<HTMLImageElement>(
          '[data-testid="tweet"][tabindex="-1"] [data-testid="tweetPhoto"] img',
        );

        let photos: string[] = [];
        for (let i = 0; i < photoElems.length; i++) {
          photos.push(photoElems[i].src);
        }

        avatar =
          document.querySelector<HTMLImageElement>(
            '[data-testid="tweet"][tabindex="-1"] [data-testid="Tweet-User-Avatar"] img',
          )?.src || '';

        if (avatar.endsWith('normal.jpg')) avatar = avatar.replace('normal.jpg', '400x400.jpg');

        isPremium = !!document.querySelector(
          '[data-testid="tweet"][tabindex="-1"] [data-testid="User-Name"] [data-testid="icon-verified"]',
        );

        profileName =
          document
            .querySelector('[data-testid="tweet"][tabindex="-1"] [data-testid="User-Name"] span')
            ?.textContent?.trim() || '';
        handle =
          document
            .querySelector('[data-testid="tweet"][tabindex="-1"] [data-testid="User-Name"] a')
            ?.getAttribute('href') || '';
        handle = handle.slice(1); // remove "/" char at the start

        // data-testid="app-text-transition-container"
        comments =
          document.querySelector(
            '[data-testid="tweet"][tabindex="-1"] [data-testid="reply"] [data-testid="app-text-transition-container"]',
          )?.textContent || '0';

        views =
          document.querySelector('[data-testid="tweet"][tabindex="-1"] [data-testid="app-text-transition-container"]')
            ?.textContent || '0';
        likes =
          document.querySelector(
            '[data-testid="tweet"][tabindex="-1"] [data-testid="like"] [data-testid="app-text-transition-container"]',
          )?.textContent || '0';

        datetime = document.querySelector('[data-testid="tweet"][tabindex="-1"] time')?.getAttribute('datetime');
        console.log({ datetime });

        // TODO: Check in tests if date is "1970-01-01T00:00:00.000Z", this is kinda smoke test.
        datetime = new Date(datetime ?? 0).toISOString();
        console.log({ datetime });

        datetimeStr = document.querySelector('[data-testid="tweet"][tabindex="-1"] time')?.textContent || '';
        content =
          document
            .querySelector('[data-testid="tweet"][tabindex="-1"] [data-testid="tweetText"]')
            ?.textContent?.trim() || '';

        const obj = {
          likes,
          views,
          handle,
          profileName,
          datetime,
          datetimeStr,
          isPremium,
          content,
          avatar,
          comments,
          photos,
        } satisfies Xpost;
        console.log(obj);

        return obj;
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
        youtube_short: getYoutubeShortsDetails(),
        youtube_list: getYoutubeListDetails(),
        xpost: getXPostContent(),
      };
    },
  });

  const data = pageInfo[0]?.result;

  if (!data) {
    chrome.notifications.create('save-error', notificationOptions);
    return false;
  }

  const titleCleaned = data.title.endsWith('- YouTube') ? data.title.slice(0, -10) : data.title;

  const tab: SingleTab = {
    title: titleCleaned,
    description: data.description,
    origin: data.origin || '',
    url: data.url || '',
    icon: favicon || '',
    datetime: new Date().toISOString(),
    tags: tags ?? [],
    itemType: data.item_type,
    note: undefined,
    xpost: data.xpost ?? undefined,
    youtubeChannel: data.youtube_channel ?? undefined,
    youtubeShort: data.youtube_short ?? undefined,
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

  // const category = categorizeTab(tab.url);
  console.log({ category });

  await tabsGroupedStorage.save(category ?? 'Uncategorized', tab);

  return true;
}
