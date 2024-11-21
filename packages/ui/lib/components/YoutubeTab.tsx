import React from 'react';
import { cn } from '../utils';
import { SingleTab } from '@extension/storage';

export const YoutubeTab = ({ item }: { item: SingleTab }) => {
  const [showDetail, setShowDetail] = React.useState(false);

  return (
    <div className={cn('rounded-md shadow-lg border-slate-400', 'bg-zinc-900 relative w-full pr-2')}>
      <button
        className={cn(
          'expand absolute scale-75 insetx-0 right-0 top-[54px] mt-6',
          'size-10 aspect-square z-30 rounded-full bg-blue-500 flex justify-center items-center ',
        )}
        onClick={() => setShowDetail(prev => !prev)}>
        <span className="p-0">{showDetail ? 'Y' : 'N'}</span>
      </button>

      <div className="yt-item flex items-centerx gap-2">
        <img src={item.icon ?? ''} alt="icon" className="size-4 translate-y-[0.4]" />
        {/*<p className="font-semibold whitespace-nowrap truncate">{item.title.slice(0, 25)}</p>*/}
        <div className="">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-break-spaces truncate font-semibold inline">
            {item.title}
          </a>
        </div>
      </div>

      <div className="flex gap-2 h-24 pr-2 z-20 w-full relative">
        <img
          width={480 / 3.12}
          height={360 / 3.12}
          className="aspect-[4/3] thumb"
          src={item.youtube?.yt_video_thumb}
          alt={item.title}
        />
        <div className="mt-2 max-w-sm pr-2 w-full">
          <p className="text-slate-500 truncatex whitespace-break-spaces">
            {item.youtube?.yt_video_desc.slice(0, 100)}
          </p>
        </div>
      </div>

      <section
        className={cn('h-0 w-full bg-red-400 w', {
          'h-0': !setShowDetail,
          'h-44': setShowDetail,
        })}>
        {showDetail && <div>Content</div>}
      </section>
    </div>
  );
};

/*
 
    <section className="absolute bg-blue-700 w-full -translate-y-10 inset-0">
       {showDetail && <div className="bg-zinc-700 w-full h-24 z-10 translate-y-10">

          content
        </div>}
      </section> 

type YoutubeType = {
  yt_channel: string;
  yt_channel_img: string;
  yt_video_desc: string;
  yt_video_thumb: string;
};

export type SingleTab = {
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  datetime: string; // ISO string representing the saved time

  youtube: YoutubeType | undefined;
};

*/
