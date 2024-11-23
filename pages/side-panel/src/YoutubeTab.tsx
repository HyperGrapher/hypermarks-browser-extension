import React from 'react';
import { cn } from './utils';
import { SingleTab } from '@extension/storage';
import { useWindowSize } from '@extension/shared';

// TODO:  if no icon/thumbnail, show default ones

export const YoutubeTab = ({ item }: { item: SingleTab }) => {
  const [showDetail, setShowDetail] = React.useState(false);
  const { width = 360, height } = useWindowSize();

  const maxCharForDesc =
    width >= 360 && width < 399 ? 100 : width >= 400 && width <= 499 ? 160 : width > 500 ? 260 : 111;

  return (
    <div className={cn('rounded-md shadow-lg border-slate-400', 'bg-zinc-900 relative w-full pr-2 min-h-36')}>
      <button
        className={cn(
          'expand absolute scale-75 insetx-0 right-0 top-[86px] mt-6',
          'size-8 aspect-square z-30 rounded-full bg-slate-600 flex justify-center items-center',
        )}
        onClick={() => setShowDetail(prev => !prev)}>
        <span className="p-0">{showDetail ? 'Y' : 'N'}</span>
      </button>

      <div className="yt-item flex items-centerx gap-2">
        <img src={item.icon ?? ''} alt="icon" className="size-4 translate-y-[0.4]" />

        <div className="">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-break-spaces truncate font-semibold inline">
            {/* {item.title} */}
            {width?.toString()} -{maxCharForDesc?.toString()}
          </a>
        </div>
      </div>

      <div className="flex gap-2 xh-24 pr-2 z-20 w-full relative">
        <img
          width={480 / 3.12}
          height={360 / 3.12}
          className="aspect-[4/3] thumb"
          src={item.youtube?.yt_video_thumb}
          alt={item.title}
        />
        <div className="mt-2 max-w-sm pr-2 w-full">
          <p className="text-slate-500 truncatex whitespace-break-spaces">
            {item.youtube?.yt_video_desc.slice(0, maxCharForDesc)}
          </p>
        </div>
      </div>

      <section
        className={cn('bg-zinc-900 w-full rounded-b-md', {
          'h-0': !showDetail,
          'h-12': showDetail,
        })}></section>
    </div>
  );
};
