import { DexieTab, XpostDexie, XProfile } from '@extension/storage';
import { getActiveTabIcon } from '../chrome-utils';

export async function twitterController(url: string): Promise<[Partial<DexieTab>, XpostDexie | XProfile]> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) throw new Error('No active tab found');
  if (url.includes('/status/')) {
    const tab: Partial<DexieTab> = {
      itemType: 'x-post',
    };
    console.log('before GetXPost in get-twitter.ts/twitterController');

    const xpost = await getXPost(activeTab.id);

    xpost.datetime = new Date(xpost.datetime);

    if (!xpost) throw new Error('Cannot get xpost data!');
    console.log('ok we get xpost in twitterController');

    return [tab, xpost];
  } else {
    const tab: Partial<DexieTab> = {
      itemType: 'x-profile',
    };
    console.log('before GetXProfile in get-twitter.ts/twitterController');

    const profile = await getXProfile(activeTab.id);

    if (!profile) throw new Error('Cannot get xpost data!');
    console.log('ok we get xprofile in twitterController');
    throw new Error('Cannot get xpost data!');

    return [tab, profile];
  }
}

async function getXProfile(tabId: number) {
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
          throw new Error('Invalid number format');
        }

        const [, numberPart, , suffix] = match;
        const number = parseFloat(numberPart);
        const multiplier = multipliers[suffix];

        return number * multiplier;
      };

      const d = {} as XProfile;

      // name, handle, bio
      d.bio = document.querySelector('[data-testid="UserDescription"]')?.textContent ?? '';
      d.location = document.querySelector('[data-testid="UserLocation"]')?.textContent ?? '';
      d.joinedDateStr = document.querySelector('[data-testid="UserJoinDate"]')?.textContent ?? '';
      d.bday = document.querySelector('[data-testid="UserBirthdate"]')?.textContent ?? '';

      const nameElems = document.querySelectorAll('[data-testid="UserName"] span');
      d.username = nameElems[0].textContent?.trim() || '';
      for (let i = 0; i < nameElems.length; i++) {
        const n = nameElems[i].textContent?.trim();
        console.log(i, { n });
        if (n && n.startsWith('@')) {
          d.handle = n;
          break;
        }
      }

      // avatar
      // data-testid="UserAvatar-Container-more_meat_loaf"
      // d.avatar = document.querySelector<HTMLImageElement>(`[data-testid="UserAvatar-Container-${d.handle}"] img`)?.src || '';
      d.avatar =
        document.querySelector<HTMLImageElement>(`img[alt="Opens profile photo"]`)?.src ||
        '' ||
        document.querySelector<HTMLImageElement>(`img[alt="Square profile picture and Opens profile photo"]`)?.src ||
        '';
      d.header = document.querySelector<HTMLImageElement>(`[data-testid="primaryColumn"] img`)?.src || '';
      d.website = document.querySelector<HTMLAnchorElement>(`a[data-testid="UserUrl"]`)?.href || '';
      d.isPremium = document.querySelector(`[data-testid="UserName"] [data-testid="icon-verified"]`) ? true : false;

      const userNameEl = document.querySelector('[data-testid="UserName"]');
      const statsContainer = userNameEl?.nextElementSibling?.nextElementSibling?.nextElementSibling;

      const following = statsContainer?.querySelector(`a[href*="/following"] span span`)?.textContent;
      const followers = statsContainer?.querySelector(`a[href*="/verified_followers"] span span`)?.textContent;
      d.followers = parseAbbrTwitterNumber(followers || '0');
      d.following = parseAbbrTwitterNumber(following || '0');

      // console.log('Following:', following); // 4,503
      // console.log('Followers:', followers); // 13.8K

      d.followedBy = statsContainer?.nextElementSibling?.textContent || '';

      // const isFollowing = (ariaLabel: string | null | undefined): boolean => {
      //   if (!ariaLabel) return false;
      //   return ariaLabel.startsWith('Following @');
      // };

      const getFollowButton = (username: string): HTMLButtonElement | null => {
        // Try both possible aria-labels
        const followBtn = document.querySelector<HTMLButtonElement>(`button[aria-label="Follow ${username}"]`);
        const unfollowBtn =
          document.querySelector<HTMLButtonElement>(`button[aria-label="Unfollow ${username}"]`) ||
          document.querySelector<HTMLButtonElement>(`button[aria-label="Following ${username}"]`);

        return followBtn || unfollowBtn;
      };

      // To check if following
      const isFollowing = (button: HTMLButtonElement | null) => {
        if (!button) return false;
        if (!button.getAttribute('aria-label')) return false;
        const label = button.getAttribute('aria-label');
        console.log({ label });

        return label?.startsWith('Unfollow @') || label?.startsWith('Following') || false;
      };

      // Extract ID from testid
      const extractId = (testId: string | null | undefined): string => {
        if (!testId) return '';
        return testId.split('-')[0];
      };

      const followBtn = getFollowButton(d.handle);

      // const btn = document.querySelector<HTMLButtonElement>('[data-testid="placementTracking"] button');
      d.isFollowing = isFollowing(followBtn); // true
      d.uniqueId = extractId(followBtn?.dataset?.testid); // 945736391811465216

      // TODO: Eksik data'dan dolayi follower,followig alanlari alinamiyor -> https://x.com/Mens_Corner__
      // TODO: bday ve avatar empty ->  https://x.com/Reuters
      // TODO: many empty ->  https://x.com/elonmusk
      // TODO: many empty ->  https://x.com/JulianRoepcke
      /*
        followedBy: "836 Following182.3K Followers" 
        followers: 0
        following: 0
        handle:"@JulianRoepcke"
        header:"https://abs-0.twimg.com/emoji/v2/svg/1f1fa-1f1e6.svg" // <--| Ukraine Flag
      */

      console.log(d);
    },
  });

  return {} as XProfile;
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
        let profileName = '';
        let handle = '';
        let avatar = '';
        let content = '';
        let views: string | number = '0';
        let likes: string | number = '0';
        let comments: string | number = '0';
        let datetime = '';
        let datetimeStr = '';
        let isPremium = false;

        let photoElems = document.querySelectorAll<HTMLImageElement>(
          '[data-testid="tweet"][tabindex="-1"] [data-testid="tweetPhoto"] img',
        );

        let videoElems = document.querySelectorAll<HTMLVideoElement>(
          '[data-testid="tweet"][tabindex="-1"] [data-testid="videoComponent"] video',
        );

        let videos: string[] = [];
        let photos: string[] = [];
        for (let i = 0; i < photoElems.length; i++) {
          photos.push(photoElems[i].src);
        }
        for (let i = 0; i < videoElems.length; i++) {
          videos.push(videoElems[i].poster);
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

        datetime = document
          .querySelector('[data-testid="tweet"][tabindex="-1"] time')
          ?.getAttribute('datetime') as string;

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
          videos,
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
          videos,
        } as XpostDexie & { datetime: string };
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
