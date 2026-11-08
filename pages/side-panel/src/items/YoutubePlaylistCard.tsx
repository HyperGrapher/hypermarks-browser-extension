import { openTab, useWindowSize } from '@extension/shared';
import { TagList } from '../components/TagFilter';
import { db, DexieTab } from '@extension/storage';
import { MoreVertical } from 'lucide-react';
import React from 'react';
import { cn } from '../utils';
import { favoriteCardClass } from '@extension/ui';
import { DropdownMenuButton } from '../components/DropdownMenuButton';
import { useLiveQuery } from 'dexie-react-hooks';

const YoutubePlaylistCard = ({ item }: { item: DexieTab }) => {
  const playlist = useLiveQuery(async () => await db.yt_playlists.where({ mark_id: item.id }).first(), []);

  // border-green-300/20 bg-green-600/10
  return (
    <div
      className={cn(
        'px-1 pb-1 rounded shadow-lg border border-gray-300/20',
        'bg-red-700/20 w-full relative max-h-36 flex flex-col card selection:bg-sky-600/80 selection:text-sky-300',
        favoriteCardClass(item.favorite),
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

      <TagList tags={item.tags} />
    </div>
  );
};

export default YoutubePlaylistCard;
