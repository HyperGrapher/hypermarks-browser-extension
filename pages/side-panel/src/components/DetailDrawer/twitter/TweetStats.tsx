import React from 'react';
import { Eye, MessageCircle, Heart, Calendar } from 'lucide-react';
import { XpostDexie } from '@extension/storage';

interface TweetPost {
  views: number;
  likes: number;
  comments: number;
  datetime: Date;
  datetimeStr: string;
}

const TweetStats = ({ item }: { item: XpostDexie | undefined }) => {
  if (!item) return null;

  // Format numbers to K/M format (e.g., 1.5K, 2.3M)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const datetime = new Date('2024-01-03T15:30:00');

  return (
    <div className="mt-2 text-sm text-gray-500">
      <div className="flex flex-wrap justify-between items-center gap-6 border-t border-gray-200/20 py-3 ">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>{formatNumber(item.views)}</span>
        </div>

        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>{formatNumber(item.comments)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span>{formatNumber(item.likes)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto" title={datetime.toLocaleString()}>
        <Calendar className="h-4 w-4" />
        <time dateTime={datetime.toISOString()}>{item.datetimeStr}</time>
      </div>
    </div>
  );
};

export default TweetStats;
