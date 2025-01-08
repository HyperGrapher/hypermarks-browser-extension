export namespace YouTube {
  export interface Video {
    mark_id?: number;
    thumbnail: string;
    avatar: string;
    title: string;
    description: string;
    channelName: string;
    views?: string;
    datetime?: Date;
    datetimeStr?: string;
  }

  export interface Short {
    mark_id: number;
    channelName: string;
    avatar: string;
    thumbnail: string;
  }

  export interface Playlist {
    mark_id: number;
    title: string;
    channelName: string;
    avatar: string;
    thumbnail: string;
    description: string;
    viewCount: string;
    videoCount: string;
  }

  export interface Channel {
    mark_id: number;
    channelName: string;
    avatar: string;
    banner: string;
    description: string;
    subcriberCount: string;
    videoCount: string;
    isSubscribed: boolean;
  }
}

export interface XpostDexie {
  mark_id: number;
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
  itemType: DexieItemType;
  createdAt: Date;
  updatedAt: Date;
};

export type XPostScreenshot = {
  mark_id: number;
  data: string;
};

export type XProfile = {
  mark_id: number;
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
  joinedDate: Date;
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
