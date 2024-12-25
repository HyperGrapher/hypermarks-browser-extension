export interface TagItem {
  name: string;
  value?: number | string;
}

export type ValueOf<T> = T[keyof T];

export namespace YouTube {
  export interface Video {
    title: string;
    channelName: string;
    avatar: string;
    description: string;
    thumbnail: string;
  }

  export interface Short {
    channelName: string;
    avatar: string;
    thumbnail: string;
  }

  export interface Playlist {
    title: string;
    channelName: string;
    avatar: string;
    thumbnail: string;
    description: string;
    viewCount: string;
    videoCount: string;
  }

  export interface Channel {
    channelName: string;
    avatar: string;
    banner: string;
    description: string;
    subcriberCount: string;
    videoCount: string;
    isSubscribed: boolean;
  }
}

export interface Xpost {
  profileName: string;
  handle: string;
  avatar: string;
  isPremium: boolean;
  datetime: string;
  datetimeStr: string;
  content: string;
  views: number;
  likes: number;
  comments: number;
  photos?: string[];
  screenshot?: string;
  hasScreenshot?: boolean;
}

export type ItemType =
  | 'other'
  | 'yt-video'
  | 'yt-shorts'
  | 'yt-channel'
  | 'yt-playlist'
  | 'github-repo'
  | 'x-post'
  | 'x-profile'
  | 'x-channel'
  | 'x-list'
  | 'twitter-tweet'
  | 'twitter-user'
  | 'twitter-list'
  | 'instagram-post'
  | 'instagram-user'
  | 'instagram-story'
  | 'soundcloud-track'
  | 'soundcloud-playlist'
  | 'dev-to-post'
  | 'dev-to-user'
  | 'dribble-shot'
  | 'dribble-team'
  | 'eksi-post'
  | 'eksi-user'
  | 'aliexpress-product'
  | 'aliexpress-user'
  | 'amazon-product'
  | 'amazon-user'
  | 'reddit'
  | 'bilyoner'
  | undefined;

export type SingleTab = {
  title: string;
  description: string;
  origin: string;
  url: string;
  icon: string;
  note: string | undefined;
  tags: string[];
  datetime: string; // ISO string representing the saved time
  itemType: ItemType;
  tempCaps?: string;
  xpost: Xpost | undefined;
  youtubeVideo: YouTube.Video | undefined;
  youtubeShort: YouTube.Short | undefined;
  youtubeChannel: YouTube.Channel | undefined;
  youtubePlaylist: YouTube.Playlist | undefined;
};

export type CategorizedTab = {
  category: string;
  item: SingleTab;
};

export type OpenAction = 'new-window' | 'new-tab' | 'current-tab' | 'incognito';

export interface ItemAndCategoty {
  item: SingleTab;
  category: string;
}

export type SiteMeta = {
  title: string;
  icon: string;
  url: string;
  origin: string;
} | null;
