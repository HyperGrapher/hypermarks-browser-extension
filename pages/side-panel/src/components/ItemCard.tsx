import React, { ReactNode } from 'react';
import { cn, searchTagsAtom } from '../utils';
import { DropdownMenuButton } from '../components/DropdownMenuButton';
import { MoreVertical } from 'lucide-react';
import { DexieTab } from '@extension/storage';
import { Badge } from '@extension/ui';
import { useSetAtom } from 'jotai';
import { openTab } from '@extension/shared';

const ItemCard = ({ item, children }: { item: DexieTab; children: ReactNode }) => {
  const setSearchTags = useSetAtom(searchTagsAtom);

  return (
    <article
      className={cn(
        'animate-fadeIn',
        'px-1 pb-1 rounded shadow-lg border border-gray-300/20',
        'bg-slate-700/20 w-full relative max-h-36 flex flex-col card selection:bg-sky-600/80 selection:text-sky-300',
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
          src={item.icon ?? ''}
          alt="icon"
          className="size-4 translate-y-px"
          onError={e => (e.currentTarget.src = chrome.runtime.getURL('side-panel/icon-fallback.png'))}
        />

        <div className="">
          <button
            onClick={async () => await openTab(item.url)}
            title={item.title}
            className="inline text-left font-semibold text-slate-300">
            <span className="wrap-text-anywhere line-clamp-2">{item.title}</span>
          </button>
        </div>
        {/* <TimeAgo datetime={item.datetime} className="text-slate-500" /> */}
      </div>

      {children}

      <section className="flex w-full flex-wrap gap-0.5 pt-1">
        {item.tags.map(pill => (
          <Badge
            onClick={() => setSearchTags(prev => [...new Set([...prev, pill])])}
            key={pill}
            variant="outline"
            className="bg-blue-700/20 py-0 text-[10px] font-light hover:cursor-pointer hover:bg-blue-700/40">
            {pill}
          </Badge>
        ))}
      </section>
    </article>
  );
};

export default ItemCard;
