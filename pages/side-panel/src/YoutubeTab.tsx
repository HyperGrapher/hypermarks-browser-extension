import type { SingleTab } from '@extension/shared';
import { openTab, useWindowSize } from '@extension/shared';
import { tabsGroupedStorage } from '@extension/storage';
import { Badge } from '@extension/ui';
import { X } from 'lucide-react';
import React from 'react';
import truncate from 'voca/truncate';
import { cn, searchTagsAtom } from './utils';
import { useAtom } from 'jotai';

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
  const [searchTags, setSearchTags] = useAtom(searchTagsAtom);
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

      <div className="xyt-item items-centerx flex gap-2 px-3 pb-1 pt-2">
        <img
          className="size-4 translate-y-px"
          src={item.icon ?? ''}
          alt=""
          onError={e => (e.currentTarget.src = chrome.runtime.getURL('side-panel/icon-fallback.png'))}
        />

        <div className="">
          <button
            onClick={async () => await openTab(item.url)}
            title={item.title}
            className="inline text-left font-semibold">
            <span className="wrap-text-anywhere line-clamp-2">{item.title}</span>
          </button>
        </div>
      </div>

      <div className="z-20 flex w-full items-center gap-2 pl-2">
        <div className="relative h-[62px] w-[183px] text-clip rounded-md">
          <img
            width={336 / 2}
            height={188 / 2}
            className="max-w-28 -translate-y-[11px] rounded-md object-contain"
            alt=""
            src={item.itemType === 'yt-video' ? item.youtubeVideo?.thumbnail || '' : item.youtubeShort?.thumbnail || ''}
            onError={e => (e.currentTarget.src = chrome.runtime.getURL('side-panel/thumbnail.png'))}
          />
        </div>
        <div className="w-full max-w-sm pr-2">
          <p className="wrap-text-anywhere line-clamp-5 text-xs/3 leading-3 text-slate-500">{item.description}</p>
        </div>
      </div>
      <section className="flex w-full flex-wrap gap-0.5 pt-1">
        {item.tags.map(pill => (
          <Badge
            onClick={() => setSearchTags(prev => [...new Set([...prev, pill])])}
            key={pill}
            variant="outline"
            className=" bg-blue-700/20 py-0 text-[10px] font-light hover:cursor-pointer hover:bg-blue-700/40">
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
  const [searchTags, setSearchTags] = useAtom(searchTagsAtom);

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

      <div className="xyt-item items-centerx flex gap-2 px-3 pb-1 pt-2">
        <img src={item.icon ?? ''} alt="icon" className="size-4 translate-y-px" />

        <div className="">
          <button
            onClick={async () => await openTab(item.url)}
            title={item.title}
            className="inline text-left font-semibold">
            <span className="wrap-text-anywhere line-clamp-2">{item.title}</span>
          </button>
        </div>
      </div>
      <section className="xflex hidden items-center gap-2 bg-gray-800 px-2 py-1 text-xs/3 text-slate-400">
        <span>{item.youtubeChannel?.videoCount}</span>
        <span>{item.youtubeChannel?.subcriberCount}</span>
      </section>

      <div className="z-20 flex w-full items-center gap-2 pl-2">
        <div className="aspect-square size-8 object-cover ">
          <img width={360 / 2} height={360 / 2} className="rounded-md" src={item.youtubeChannel?.avatar} alt="" />
        </div>
        <div className="w-full max-w-sm pr-2">
          <p className="wrap-text-anywhere line-clamp-5 text-xs/3 leading-3 text-slate-500">
            {item.youtubeChannel?.description}
          </p>
        </div>
      </div>
      <section className="flex w-full flex-wrap gap-0.5 pt-1">
        {item.tags.map(pill => (
          <Badge
            onClick={() => setSearchTags(prev => [...new Set([...prev, pill])])}
            key={pill}
            variant="outline"
            className=" bg-blue-700/20 py-0 text-[10px] font-light hover:cursor-pointer hover:bg-blue-700/40">
            {pill}
          </Badge>
        ))}
      </section>
    </div>
  );
};

export const YoutubePlaylist = ({ item }: { item: SingleTab }) => {
  const [searchTags, setSearchTags] = useAtom(searchTagsAtom);

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

      <div className="xyt-item items-centerx flex gap-2 px-3 pb-1 pt-2">
        <img src={item.icon ?? ''} alt="icon" className="size-4 translate-y-px" />

        <div className="">
          <button
            onClick={async () => await openTab(item.url)}
            title={item.title}
            className="inline text-left font-semibold">
            <span className="wrap-text-anywhere line-clamp-2">{item.title}</span>
          </button>
        </div>
      </div>
      <section className="xflex hidden items-center gap-2 bg-gray-800 px-2 py-1 text-xs/3 text-slate-400">
        <span>{item.youtubePlaylist?.videoCount}</span>
        <span>{item.youtubePlaylist?.viewCount}</span>
      </section>

      <div className="z-20 flex w-full gap-2">
        <div className="text-clip rounded">
          <img
            width={480 / 2}
            height={360 / 2}
            className="max-w-28 object-contain"
            alt=""
            src={item.youtubePlaylist?.thumbnail ?? ''}
            // TODO: resize thumbnail image
            onError={e => (e.currentTarget.src = chrome.runtime.getURL('side-panel/thumbnail.png'))}
          />
        </div>
        <div className="w-full max-w-sm pr-2">
          <p className="wrap-text-anywhere line-clamp-5 text-xs/3 leading-3 text-slate-500">
            {item.youtubePlaylist?.description}
          </p>
        </div>
      </div>

      <section className="flex w-full flex-wrap gap-0.5 pt-1">
        {item.tags.map(pill => (
          <Badge
            onClick={() => setSearchTags(prev => [...new Set([...prev, pill])])}
            key={pill}
            variant="outline"
            className=" bg-blue-700/20 py-0 text-[10px] font-light hover:cursor-pointer hover:bg-blue-700/40">
            {pill}
          </Badge>
        ))}
      </section>
    </div>
  );
};
