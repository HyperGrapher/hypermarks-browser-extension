import { openTab, useWindowSize } from '@extension/shared';
import { db, DexieTab } from '@extension/storage';
import { Badge } from '@extension/ui';
import { MoreVertical } from 'lucide-react';
import React from 'react';
import { cn, searchTagsAtom } from '../utils';
import { useSetAtom } from 'jotai';
import { DropdownMenuButton } from '../components/DropdownMenuButton';
import { useLiveQuery } from 'dexie-react-hooks';

const YoutubePlaylistCard = ({ item }: { item: DexieTab }) => {
  const setSearchTags = useSetAtom(searchTagsAtom);

  const playlist = useLiveQuery(async () => await db.yt_playlists.where({ mark_id: item.id }).first(), []);

  // border-green-300/20 bg-green-600/10
  return (
    <div
      className={cn(
        'px-1 pb-1 rounded shadow-lg border border-gray-300/20',
        'bg-red-700/20 w-full relative max-h-36 flex flex-col card selection:bg-sky-600/80 selection:text-sky-300',
      )}>
      <DropdownMenuButton item={item}>
        <button
          className={cn(
            'expand absolute xscale-75 insetx-0 right-1 top-1 xmt-6',
            'size-6 aspect-square z-30 rounded-full bg-slate-700/50 flex justify-center items-center',
          )}>
          <MoreVertical size={12} />
        </button>
      </DropdownMenuButton>

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
        <span>{playlist?.videoCount}</span>
        <span>{playlist?.viewCount}</span>
      </section>

      <div className="z-20 flex w-full gap-2">
        <div className="overflow-clip rounded">
          <img
            width={480 / 2}
            height={360 / 2}
            className="max-w-28 object-contain"
            alt=""
            src={playlist?.thumbnail ?? ''}
            // TODO: resize thumbnail image
            onError={e => (e.currentTarget.src = chrome.runtime.getURL('side-panel/thumbnail.png'))}
          />
        </div>
        <div className="w-full max-w-sm pr-2">
          <p className="wrap-text-anywhere line-clamp-5 text-xs/3 leading-3 text-slate-500">{playlist?.description}</p>
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

export default YoutubePlaylistCard;
