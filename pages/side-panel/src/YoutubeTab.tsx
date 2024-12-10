import { SingleTab, useWindowSize } from '@extension/shared';
import { tabsGroupedStorage } from '@extension/storage';
import { Badge } from '@extension/ui';
import { X } from 'lucide-react';
import React from 'react';
import truncate from 'voca/truncate';
import { cn } from './utils';

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
    width >= 360 && width < 399 ? 134 : width >= 400 && width <= 499 ? 145 : width > 500 ? 260 : 111;

  return (
    <div
      className={cn(
        'px-1 pb-1 rounded shadow-lg border border-violet-300/20',
        'bg-violet-600/10 w-full relative max-h-36 ',
      )}>
      <button
        className={cn(
          'expand absolute xscale-75 insetx-0 right-1 top-1 xmt-6',
          'size-4 aspect-square z-30 rounded-full bg-slate-600/30 flex justify-center items-center',
        )}
        onClick={() => deleteItem(item.datetime)}>
        <X size={12} />
      </button>

      <div className="xyt-item flex items-centerx gap-2 pb-1 pt-2 px-3">
        <img className="size-4 translate-y-[1px]" src={item.icon} alt="icon" />

        <div className="">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={item.title}
            className="whitespace-break-spaces truncate font-semibold inline leading-[0.1rem] ">
            {truncate(item.title, 80)}
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
            src={item.youtubeVideo?.thumbnail}
            onError={e => (e.currentTarget.src = chrome.runtime.getURL('side-panel/thumbnail.png'))}
            alt={item.title}
          />
        </div>
        <div className="max-w-sm pr-2 w-full">
          <p className="text-slate-500 truncatex whitespace-break-spaces text-xs/3 leading-3`">
            {/* {item.youtubeVideo?.description.slice(0, maxCharForDesc)} */}
            {truncate(item.description, maxCharForDesc)}
            {/* {remove_linebreaks(item.youtube?.yt_video_desc).slice(0, maxCharForDesc)} */}
          </p>
        </div>
      </div>
      <section className="pt-1 flex flex-wrap gap-2 w-full">
        {item.tags.map(pill => (
          <Badge
            key={pill}
            variant="outline"
            className="hover:cursor-pointer gap-1 font-light py-0 text-xs group bg-blue-700/20 hover:bg-blue-700/40">
            {pill}
          </Badge>
        ))}
      </section>

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
        'px-1 pb-1 rounded shadow-lg border border-gray-300/20',
        'bg-slate-600/10 w-full relative max-h-36 flex flex-col',
      )}>
      <button
        className={cn(
          'expand absolute xscale-75 insetx-0 right-1 top-1 xmt-6',
          'size-4 aspect-square z-30 rounded-full bg-slate-600/20 flex justify-center items-center',
        )}
        onClick={() => deleteItem(item.datetime)}>
        <X size={12} />
      </button>

      <div className="xyt-item flex items-centerx gap-2 pb-1 pt-2 px-3">
        <img src={item.icon ?? ''} alt="icon" className="size-4 translate-y-[1px]" />

        <div className="">
          <a
            href={item.url}
            target="_blank"
            title={item.title}
            rel="noopener noreferrer"
            className="whitespace-break-spaces truncate font-semibold inline text-slate-300">
            {truncate(item.title, 80)}
            {/* {width?.toString()} -{maxCharForDesc?.toString()} */}
          </a>
        </div>
      </div>
      <section className="bg-gray-800 hidden xflex items-center gap-2 px-2 py-1 text-xs/3 text-slate-400">
        <span>{item.youtubeChannel?.videoCount}</span>
        <span>{item.youtubeChannel?.subcriberCount}</span>
      </section>

      <div className="flex gap-2 z-20 w-full items-center pl-2">
        <div className="">
          <img
            width={360 / 2}
            height={360 / 2}
            className="size-8 object-cover xaspect-square rounded-full"
            src={item.youtubeChannel?.avatar}
          />
        </div>
        <div className="max-w-sm pr-2 w-full">
          <p className="text-slate-500 truncatex whitespace-break-spaces text-xs/3 leading-3">
            {truncate(item.youtubeChannel?.description, 325)}
            {/* {item.youtubeChannel?.description.slice(0, 325)} */}
            {/* {remove_linebreaks(item.youtube?.yt_video_desc).slice(0, maxCharForDesc)} */}
          </p>
        </div>
      </div>
      <section className="pt-1 flex flex-wrap gap-2 w-full">
        {item.tags.map(pill => (
          <Badge
            key={pill}
            variant="outline"
            className="hover:cursor-pointer gap-1 font-light py-0 text-xs group bg-blue-700/20 hover:bg-blue-700/40">
            {pill}
          </Badge>
        ))}
      </section>
    </div>
  );
};

export const YoutubePlaylist = ({ item }: { item: SingleTab }) => {
  return (
    <div
      className={cn(
        'px-1 pb-1 rounded shadow-lg border border-green-300/20',
        'bg-green-600/10 w-full relative max-h-36',
      )}>
      <button
        className={cn(
          'expand absolute xscale-75 insetx-0 right-1 top-1 xmt-6',
          'size-4 aspect-square z-30 rounded-full bg-slate-600/20 flex justify-center items-center',
        )}
        onClick={() => deleteItem(item.datetime)}>
        <X size={12} />
      </button>

      <div className="xyt-item flex items-centerx gap-2 pb-1 pt-2 px-3">
        <img src={item.icon ?? ''} alt="icon" className="size-4 translate-y-[1px]" />

        <div className="">
          <a
            href={item.url}
            target="_blank"
            title={item.title}
            rel="noopener noreferrer"
            className="whitespace-break-spaces truncate font-semibold inline">
            {truncate(item.title, 80)}
            {/* {width?.toString()} -{maxCharForDesc?.toString()} */}
          </a>
        </div>
      </div>
      <section className="bg-gray-800 hidden xflex items-center gap-2 px-2 py-1 text-xs/3 text-slate-400">
        <span>{item.youtubePlaylist?.videoCount}</span>
        <span>{item.youtubePlaylist?.viewCount}</span>
      </section>

      <div className="flex gap-2 z-20 w-full">
        <div className="rounded overflow-clip">
          <img
            width={480 / 2}
            height={360 / 2}
            className="max-w-28 object-contain"
            src={item.youtubePlaylist?.thumbnail}
            alt={item.title}
            // TODO: resize thumbnail image
            onError={e => (e.currentTarget.src = chrome.runtime.getURL('side-panel/thumbnail.png'))}
          />
        </div>
        <div className="max-w-sm pr-2 w-full">
          <p className="text-slate-500 truncatex whitespace-break-spaces text-xs/3 leading-3`">
            {}
            {item.youtubePlaylist?.description.slice(0, 325)}
            {/* {remove_linebreaks(item.youtube?.yt_video_desc).slice(0, maxCharForDesc)} */}
          </p>
        </div>
      </div>

      <section className="pt-1 flex flex-wrap gap-2 w-full">
        {item.tags.map(pill => (
          <Badge
            key={pill}
            variant="outline"
            className="hover:cursor-pointer gap-1 font-light py-0 text-xs group bg-blue-700/20 hover:bg-blue-700/40">
            {pill}
          </Badge>
        ))}
      </section>
    </div>
  );
};
