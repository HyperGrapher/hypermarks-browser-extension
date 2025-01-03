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

export interface XpostDexie {
  profileName: string;
  handle: string;
  avatar: string;
  isPremium: boolean;
  datetime: Date;
  datetimeStr: string;
  content: string;
  views: number;
  likes: number;
  comments: number;
  photos?: string[];
  videos?: string[];
  screenshotId?: number;
  tabId?: number;
  id?: number;
}

export type DexieTab = {
  id?: number;
  categoryId: number;
  title: string;
  description: string;
  origin: string;
  url: string;
  icon: string;
  note: string | undefined;
  tags: string[];
  datetime: string; // ISO string representing the saved time
  itemType: DexieItemType;
  createdAt: Date;
  updatedAt: Date;
  youtubeChannelId?: number;
  youtubeVideoId?: number;
  youtubePlaylistId?: number;
  youtubeShortId?: number;
  xpostId?: number;
};

export type XProfile = {
  username: string;
  handle: string;
  avatar: string;
  header: string;
  bio: string;
  isPremium: boolean;
  isFollowing: boolean;
  followers: number;
  following: number;
  followedBy: string;
  bday: string | undefined;
  uniqueId: string;
  website: string | undefined;
  location: string | undefined;
  joinedDateStr: string;
  joinedDate: string;
};

export type DexieItemType =
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
