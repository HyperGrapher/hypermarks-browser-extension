import { openTab, useWindowSize } from '@extension/shared';
import { db, DexieTab } from '@extension/storage';
import { Badge, favoriteCardClass } from '@extension/ui';
import { MoreVertical } from 'lucide-react';
import React from 'react';
import { cn, searchTagsAtom } from '../utils';
import { useSetAtom } from 'jotai';
import { DropdownMenuButton } from '../components/DropdownMenuButton';
import { useLiveQuery } from 'dexie-react-hooks';

// TODO:  if no icon/thumbnail, show default ones
// https://www.youtube.com/playlist?list=PLRnI_2_ZWhtCxHQ_3zDfW0-RgiWo8ftyj

function remove_linebreaks(str: string | undefined) {
  if (str === undefined) return '';
  return str.replace(/[\r\n]+/gm, ' ');
}

const YoutubeVideoCard = ({ item }: { item: DexieTab }) => {
  const [showDetail, setShowDetail] = React.useState(false);
  const setSearchTags = useSetAtom(searchTagsAtom);
  const { width = 360, height } = useWindowSize();
  const video = useLiveQuery(async () => await db.yt_videos.where({ mark_id: item.id }).first(), []);

  const maxCharForDesc =
    width >= 360 && width < 399 ? 134 : width >= 400 && width <= 499 ? 145 : width > 500 ? 260 : 111;

  // border-violet-300/20 bg-violet-600/10

  return (
    <div
      className={cn(
        'px-1 pb-1 rounded shadow-lg border border-gray-300/20',
        'bg-slate-700/20 w-full relative max-h-36 flex flex-col card selection:bg-sky-600/80 selection:text-sky-300',
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
        <div className="relative h-[62px] w-[183px] overflow-clip rounded-md">
          <img
            width={336 / 2}
            height={188 / 2}
            className="max-w-28 -translate-y-[11px] rounded-md object-contain"
            alt=""
            src={item.itemType === 'yt-video' ? video?.thumbnail || '' : ''}
            onError={e => (e.currentTarget.src = chrome.runtime.getURL('side-panel/thumbnail.png'))}
          />
        </div>
        <div className="w-full max-w-sm pr-2">
          <p className="wrap-text-anywhere line-clamp-5 text-xs/3 leading-3 text-slate-500">{item.description}</p>
        </div>
      </div>
      <section className="flex w-full overflow-x-clip gap-0.5 pt-1">
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

export default YoutubeVideoCard;

const ThumbnailDisplay = () => {
  return <div>YoutubeVideoCard</div>;
};
