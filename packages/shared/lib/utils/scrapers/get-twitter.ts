import { DexieTab, XpostDexie } from '@extension/storage/lib/dexie/db';
import { getActiveTabIcon } from '../chrome-utils';
type XProfile = {
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  tweets: number;
  joined: string;
};
export async function twitterController(): Promise<[Partial<DexieTab>, XpostDexie | XProfile]> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) throw new Error('No active tab found');

  //   const titleCleaned = data.title.endsWith('- YouTube') ? data.title.slice(0, -10) : data.title;

  const tab: Partial<DexieTab> = {
    itemType: 'x-post',
  };
  console.log('before GetXPost in get-twitter.ts/twitterController');

  const xpost = await getXPost(activeTab.id);
  console.log(xpost);

  if (!xpost) throw new Error('Cannot get xpost data!');
  console.log('ok we get xpost in twitterController');

  return [tab, xpost];
}
// i get this error while scraping data from twitter. "Uncaught ReferenceError: __spreadValues$9 is not defined"
// only       "console.log('>>>>>>>> Start <<<<<<<<');"  is printed in the console
async function getXPost(tabId: number) {
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

      function getXPostContent(): XpostDexie | null {
        //   if (!isXPost) return null;
        console.log('getXpostContent');

        let profileName = '';
        let handle = '';
        let avatar = '';
        let content = '';
        let views: string | number = '0';
        let likes: string | number = '0';
        let comments: string | number = '0';
        let datetime;
        let datetimeStr = '';
        let isPremium = false;

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

        // TODO: Check in tests if date is "1970-01-01T00:00:00.000Z", this is kinda smoke test.
        datetime = new Date(datetime ?? 0);

        datetimeStr = document.querySelector('[data-testid="tweet"][tabindex="-1"] time')?.textContent || '';
        content =
          document
            .querySelector('[data-testid="tweet"][tabindex="-1"] [data-testid="tweetText"]')
            ?.textContent?.trim() || '';

        console.log({
          profileName,
          handle,
          avatar,
          content,
          views,
          likes,
          comments,
          datetime,
          datetimeStr,
          isPremium,
          photos,
        });

        const obj = {
          likes: parseAbbrTwitterNumber(likes),
          views: parseAbbrTwitterNumber(views),
          comments: parseAbbrTwitterNumber(comments),
          handle,
          profileName,
          datetime,
          datetimeStr,
          isPremium,
          content,
          avatar,
          photos,
        } satisfies XpostDexie;
        console.log(obj);

        return obj;
      }
      const dat = getXPostContent();
      return dat;
    },
  });

  const data = scrapedData[0].result;

  return data as XpostDexie;
}
