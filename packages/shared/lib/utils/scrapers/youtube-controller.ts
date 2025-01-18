import { DexieTab, XpostDexie, XProfile, YouTube } from '@extension/storage';
import { getActiveTabIcon } from '../chrome-utils';

export async function youtubeController(
  url: string,
): Promise<[Partial<DexieTab>, YouTube.Video | YouTube.Channel | YouTube.Playlist]> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) throw new Error('No active tab found');
  if (url.includes('/watch?v')) {
    const tab: Partial<DexieTab> = {
      itemType: 'yt-video',
    };
    console.log('before GetVideo');

    const video = await getVideo(activeTab.id);
    tab.title = video.title;
    tab.description = video.description;
    // video.datetime = new Date(video.datetime);

    if (!video) throw new Error('Cannot get xpost data!');
    console.log('ok we get xpost in twitterController');

    return [tab, video];
  } else if (url.includes('/playlist')) {
    const tab: Partial<DexieTab> = {
      itemType: 'yt-playlist',
    };

    const pl = await getPlaylist(activeTab.id);
    tab.description = pl.description;
    tab.title = pl.title;

    return [tab, pl as YouTube.Playlist];
  } else {
    const tab: Partial<DexieTab> = {
      itemType: 'x-profile',
    };
    console.log('before GetXProfile in get-twitter.ts/twitterController');

    const channel = await getChannel(activeTab.id);
    tab.title = channel.channelName;
    tab.description = channel.channelName;

    if (!channel) throw new Error('Cannot get xpost data!');
    console.log('ok we get xprofile in twitterController');
    // throw new Error('Cannot get xpost data!');

    return [tab, channel];
  }
}

async function getPlaylist(tabId: number) {
  const scrapedData = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      console.log('>>>>>>>> Start Playlist<<<<<<<<');

      type MultiplierMap = {
        [key: string]: number;
      };

      const parseAbbrTwitterNumber = (value: string): number => {
        // Remove commas from the input
        const cleanValue = value.replace(/,/g, '');

        const multipliers: MultiplierMap = {
          K: 1000,
          M: 1000000,
          B: 1000000000,
        };

        // If the input is just a number without suffix
        if (!isNaN(Number(cleanValue))) {
          return Number(cleanValue);
        }

        // Extract the number and suffix parts
        const match = cleanValue.match(/^(\d+(\.\d+)?)([KMB])$/);

        if (!match) {
          return 0;
          throw new Error('Invalid number format');
        }

        const [, numberPart, , suffix] = match;
        const number = parseFloat(numberPart);
        const multiplier = multipliers[suffix];

        return number * multiplier;
      };

      const d = {} as YouTube.Playlist;

      const title = document.querySelector('#page-manager h1')?.textContent || '';
      d.title = title.trim();

      const channelName =
        document.querySelector('#page-manager .page-header-view-model-wiz__page-header-headline a')?.textContent || '';

      const channelHandle =
        document.querySelector('#page-manager .page-header-view-model-wiz__page-header-headline a')?.textContent || '';
      d.channelName = channelHandle.trim();

      const description =
        document.querySelector(
          ".yt-description-preview-view-model-wiz--clickable .truncated-text-wiz.truncated-text-wiz--overlay span[role='text'].yt-core-attributed-string.yt-core-attributed-string--white-space-pre-wrap",
        )?.textContent || '';

      d.description = description.trim();

      const avatar = document.querySelector<HTMLImageElement>('img.yt-core-image--loaded')?.src || '';
      d.avatar = avatar;

      let thumbnail = document.querySelector<HTMLImageElement>('img[alt="Play all"]')?.src || '';

      if (!thumbnail) {
        thumbnail =
          document.querySelector<HTMLImageElement>('a.style-scope.ytd-thumbnail img.yt-core-image')?.src || '';
      }

      d.thumbnail = thumbnail;

      const metaspanEls = document.querySelectorAll(
        '#page-manager .yt-content-metadata-view-model-wiz__metadata-row span.yt-content-metadata-view-model-wiz__metadata-text',
      );
      const metaspans = Array.from(metaspanEls);
      const textList = metaspans.map(span => span.textContent) ?? [];
      let metadata = [];
      for (let i = 0; i < textList.length; i++) {
        if (textList[i]?.includes('views') || textList[i]?.includes('videos')) metadata.push(textList[i]);
      }

      metadata = [...new Set(metadata)];

      d.videoCount = metadata[0]?.split(' ')[0] ?? '0';
      d.viewCount = metadata[1]?.split(' ')[0] ?? '0';

      console.log({
        videos: parseAbbrTwitterNumber(d.videoCount),
        views: parseAbbrTwitterNumber(d.viewCount),
      });

      console.log(d);
      return d;
    },
  });

  const data = scrapedData[0].result as YouTube.Playlist;

  return data;
}

async function getChannel(tabId: number) {
  const scrapedData = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      console.log('>>>>>>>> Start Profile<<<<<<<<');

      type MultiplierMap = {
        [key: string]: number;
      };

      const parseAbbrTwitterNumber = (value: string): number => {
        // Remove commas from the input
        const cleanValue = value.replace(/,/g, '');

        const multipliers: MultiplierMap = {
          K: 1000,
          M: 1000000,
          B: 1000000000,
        };

        // If the input is just a number without suffix
        if (!isNaN(Number(cleanValue))) {
          return Number(cleanValue);
        }

        // Extract the number and suffix parts
        const match = cleanValue.match(/^(\d+(\.\d+)?)([KMB])$/);

        if (!match) {
          return 0;
          throw new Error('Invalid number format');
        }

        const [, numberPart, , suffix] = match;
        const number = parseFloat(numberPart);
        const multiplier = multipliers[suffix];

        return number * multiplier;
      };

      const d = {} as YouTube.Channel;

      console.log(d);
      return d;
    },
  });

  const data = scrapedData[0].result as YouTube.Channel;

  return data;
}

// i get this error while scraping data from twitter. "Uncaught ReferenceError: __spreadValues$9 is not defined"
// only       "console.log('>>>>>>>> Start <<<<<<<<');"  is printed in the console
async function getVideo(tabId: number) {
  const scrapedData = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      console.log('>>>>>>>> Start <<<<<<<<');

      type MultiplierMap = {
        [key: string]: number;
      };

      const parseAbbrTwitterNumber = (value: string): number => {
        console.log('parseAbbrTwitterNumber');

        // Define multipliers for different suffixes
        const multipliers: MultiplierMap = {
          K: 1000,
          M: 1000000,
          B: 1000000000,
        };

        // If the input is just a number without suffix
        if (!isNaN(Number(value))) {
          return Number(value);
        }

        // Extract the number and suffix parts
        const match = value.match(/^(\d+(\.\d+)?)([KMB])$/);

        if (!match) {
          // FIXME: ThROWS HERE   ;
          return 0;
          // throw new Error('Invalid number format');
        }

        const [, numberPart, , suffix] = match;
        const number = parseFloat(numberPart);
        const multiplier = multipliers[suffix];

        return number * multiplier;
      };

      const title = document.querySelector('#title .style-scope .ytd-watch-metadata')?.textContent || '';

      const channelName =
        document.querySelector(
          '#upload-info #channel-name #container #text-container.ytd-channel-name #text a.yt-formatted-string',
        )?.textContent || '';

      const avatar = document.querySelector<HTMLImageElement>('#owner img#img.yt-img-shadow')?.src || '';

      const description = document.querySelector('#description #snippet-text')?.textContent || '';

      const youtubeVideoId = window.location.href.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/)?.pop();

      const thumbnail = youtubeVideoId ? `http://img.youtube.com/vi/${youtubeVideoId}/0.jpg` : '';
      console.log({ title, channelName, avatar, description, thumbnail });

      return { title, channelName, avatar, description, thumbnail };
    },
  });

  const data = scrapedData[0].result;

  return data as YouTube.Video;
}
