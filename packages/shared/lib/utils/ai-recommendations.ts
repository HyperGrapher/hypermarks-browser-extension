import { generateCategoryAndTags } from './gemini-ai';
import { getActiveTabIcon } from './chrome-utils';
import type { YouTube as YT, ItemType, SingleTab, Xpost } from './shared-types';

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

        const channelName = document.querySelector('#page-header h1')?.textContent || '';

        const avatar = document.querySelector<HTMLImageElement>('#page-header img')?.src || '';
        const banner = document.querySelector<HTMLImageElement>('yt-image-banner-view-model img')?.src || '';
        const description =
          document.querySelector('#page-header yt-description-preview-view-model span[role="text"]')?.textContent || '';

        // e.g. "1.36M subscribers", "986 videos"
        const metadataTexts = Array.from(
          document.querySelectorAll(
            '#page-header yt-content-metadata-view-model span.ytContentMetadataViewModelMetadataText',
          ),
        ).map(el => el.textContent || '');

        const subcriberCount = metadataTexts.find(text => text.includes('subscribers')) || '';
        const videoCount = metadataTexts.find(text => text.includes('videos')) || '';

        const isSubscribed = Array.from(
          document.querySelectorAll('#page-header yt-flexible-actions-view-model button'),
        ).some(button => button.textContent?.trim() === 'Subscribed');

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

        const title = document.querySelector('#page-manager h1')?.textContent || '';

        // The owner link text is "by <channel name>"
        const channelName = (document.querySelector('#page-manager yt-page-header-view-model a')?.textContent || '')
          .replace(/^\s*by\s+/, '')
          .trim();

        // The page renders several copies of the header; some images never get a src
        const avatar =
          Array.from(
            document.querySelectorAll<HTMLImageElement>('#page-manager yt-page-header-view-model yt-avatar-shape img'),
          )
            .map(img => img.src)
            .find(Boolean) || '';
        const thumbnail =
          Array.from(document.querySelectorAll<HTMLImageElement>('img[alt="Play all"]'))
            .map(img => img.src)
            .find(src => src.includes('ytimg')) || '';

        const description =
          document.querySelector('#page-manager yt-description-preview-view-model span[role="text"]')?.textContent ||
          '';

        const metadataElems = document.querySelectorAll(
          '#page-manager .ytContentMetadataViewModelMetadataRow span.ytContentMetadataViewModelMetadataText',
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
          likes: 0,
          views: 0,
          handle,
          profileName,
          datetime,
          datetimeStr,
          isPremium,
          content,
          avatar,
          comments: 0,
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
    throw new Error('Error getting data from page');
  }

  const titleCleaned = data.title.endsWith('- YouTube') ? data.title.slice(0, -10) : data.title;

  console.log(`aiResult for: \n${data.title} \n${data.description}`);
  const aiResult = {}; //await generateCategoryAndTags(data.title, data.description);
  console.log(aiResult);

  return aiResult;
}
