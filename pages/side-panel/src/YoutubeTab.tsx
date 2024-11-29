import React from 'react';
import { cn } from './utils';
import { SingleTab, tabsGroupedStorage } from '@extension/storage';
import { useWindowSize } from '@extension/shared';

// TODO:  if no icon/thumbnail, show default ones
// https://www.youtube.com/playlist?list=PLRnI_2_ZWhtCxHQ_3zDfW0-RgiWo8ftyj

async function deleteItem(datetime: string) {
  console.log(datetime);
  try {
    await tabsGroupedStorage.delete(datetime);
    console.log(`Tab with datetime ${datetime} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting tab:', error);
  }
}

function remove_linebreaks(str: string | undefined) {
  if (str === undefined) return '';
  return str.replace(/[\r\n]+/gm, ' ');
}

export const YoutubeVideo = ({ item }: { item: SingleTab }) => {
  const [showDetail, setShowDetail] = React.useState(false);
  const { width = 360, height } = useWindowSize();

  const maxCharForDesc =
    width >= 360 && width < 399 ? 135 : width >= 400 && width <= 499 ? 145 : width > 500 ? 260 : 111;

  return (
    <div className={cn('px-1 pb-1 rounded shadow-lg border border-zinc-700', 'bg-zinc-900 w-full relative max-h-36 ')}>
      <button
        className={cn(
          'expand absolute xscale-75 insetx-0 right-1 top-1 xmt-6',
          'size-4 aspect-square z-30 rounded-full bg-slate-700/50 flex justify-center items-center',
        )}
        onClick={() => deleteItem(item.datetime)}>
        <span className="p-0 text-gray-300/70">x</span>
      </button>

      <div className="xyt-item flex items-centerx gap-2 pb-1 pt-2 px-3">
        <img src={item.icon ?? ''} alt="icon" className="size-4 translate-y-[1px]" />

        <div className="">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-break-spaces truncate font-semibold inline leading-[0.1rem] ">
            {item.title}
            {/* {maxCharForDesc?.toString()} */}
            {/* {width?.toString()} -{maxCharForDesc?.toString()} */}
          </a>
        </div>
      </div>

      <div className="flex gap-2 xh-24 pr-2 z-20 w-full relative">
        <div className="rounded overflow-clip relative -xtranslate-y-2  bgx-red-500/20 w-[183px] h-[62px]">
          <img
            width={336 / 2}
            height={188 / 2}
            className="max-w-28 -translate-y-[11px] object-contain"
            src={item.youtube_video?.thumb}
            alt={item.title}
          />
        </div>
        <div className="max-w-sm pr-2 w-full">
          <p className="text-slate-500 truncatex whitespace-break-spaces text-xs/3 leading-3`">
            {item.youtube_video?.desc.slice(0, maxCharForDesc)}
            {/* {remove_linebreaks(item.youtube?.yt_video_desc).slice(0, maxCharForDesc)} */}
          </p>
        </div>
      </div>

      <section
        className={cn('bg-zinc-900 w-full hidden rounded-b-md', {
          'h-0': !showDetail,
          'h-12': showDetail,
        })}></section>
    </div>
  );
};

export const YoutubeChannel = ({ item }: { item: SingleTab }) => {
  return (
    <div
      className={cn(
        'px-1 pb-1 rounded shadow-lg border border-gray-700',
        'bg-slate-950 w-full relative max-h-36 flex flex-col',
      )}>
      <button
        className={cn(
          'expand absolute xscale-75 insetx-0 right-1 top-1 xmt-6',
          'size-4 aspect-square z-30 rounded-full bg-slate-700/50 flex justify-center items-center',
        )}
        onClick={() => deleteItem(item.datetime)}>
        <span className="p-0 text-gray-300/70">x</span>
      </button>

      <div className="xyt-item flex items-centerx gap-2 pb-1 pt-2 px-3">
        <img src={item.icon ?? ''} alt="icon" className="size-4 translate-y-[1px]" />

        <div className="">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-break-spaces truncate font-semibold inline text-slate-300">
            {item.title}
            {/* {width?.toString()} -{maxCharForDesc?.toString()} */}
          </a>
        </div>
      </div>
      <section className="bg-gray-800 hidden xflex items-center gap-2 px-2 py-1 text-xs/3 text-slate-400">
        <span>{item.youtube_channel?.videos}</span>
        <span>{item.youtube_channel?.subs}</span>
      </section>

      <div className="flex gap-2 z-20 w-full items-center pl-2">
        <div className="">
          <img
            width={360 / 2}
            height={360 / 2}
            className="size-8 object-cover xaspect-square rounded-full"
            src={item.youtube_channel?.avatar}
            alt={item.title}
          />
        </div>
        <div className="max-w-sm pr-2 w-full">
          <p className="text-slate-500 truncatex whitespace-break-spaces text-xs/3 leading-3">
            {item.youtube_channel?.desc.slice(0, 325)}
            {/* {remove_linebreaks(item.youtube?.yt_video_desc).slice(0, maxCharForDesc)} */}
          </p>
        </div>
      </div>
    </div>
  );
};

export const YoutubePlaylist = ({ item }: { item: SingleTab }) => {
  return (
    <div className={cn('px-1 pb-1 rounded shadow-lg border border-gray-700', 'bg-gray-900 w-full relative max-h-36')}>
      <button
        className={cn(
          'expand absolute xscale-75 insetx-0 right-1 top-1 xmt-6',
          'size-4 aspect-square z-30 rounded-full bg-slate-700/50 flex justify-center items-center',
        )}
        onClick={() => deleteItem(item.datetime)}>
        <span className="p-0 text-gray-300/70">x</span>
      </button>

      <div className="xyt-item flex items-centerx gap-2 pb-1 pt-2 px-3">
        <img src={item.icon ?? ''} alt="icon" className="size-4 translate-y-[1px]" />

        <div className="">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-break-spaces truncate font-semibold inline">
            {item.title}
            {/* {width?.toString()} -{maxCharForDesc?.toString()} */}
          </a>
        </div>
      </div>
      <section className="bg-gray-800 hidden xflex items-center gap-2 px-2 py-1 text-xs/3 text-slate-400">
        <span>{item.youtube_list?.videos}</span>
        <span>{item.youtube_list?.views}</span>
      </section>

      <div className="flex gap-2 z-20 w-full">
        <div className="rounded overflow-clip">
          <img
            width={480 / 2}
            height={360 / 2}
            className="max-w-28 object-contain"
            src={item.youtube_list?.thumb}
            alt={item.title}
          />
        </div>
        <div className="max-w-sm pr-2 w-full">
          <p className="text-slate-500 truncatex whitespace-break-spaces text-xs/3 leading-3`">
            {item.youtube_list?.desc.slice(0, 325)}
            {/* {remove_linebreaks(item.youtube?.yt_video_desc).slice(0, maxCharForDesc)} */}
          </p>
        </div>
      </div>
    </div>
  );
};
