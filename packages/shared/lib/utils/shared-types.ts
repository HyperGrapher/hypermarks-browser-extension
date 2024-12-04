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

export type ItemType =
  | 'other'
  | 'yt-video'
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
  youtubeVideo: YouTube.Video | undefined;
  youtubeChannel: YouTube.Channel | undefined;
  youtubePlaylist: YouTube.Playlist | undefined;
};

export type CategorizedTab = {
  category: string;
  item: SingleTab;
};
