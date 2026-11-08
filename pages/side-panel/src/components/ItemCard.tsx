import React, { ReactNode } from 'react';
import { TagList } from './TagFilter';
import { cn } from '../utils';
import { DropdownMenuButton } from '../components/DropdownMenuButton';
import { MoreVertical } from 'lucide-react';
import { DexieTab } from '@extension/storage';
import { favoriteCardClass } from '@extension/ui';
import { openTab } from '@extension/shared';

const ItemCard = ({ item, children }: { item: DexieTab; children: ReactNode }) => {
  return (
    <article
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

      <TagList tags={item.tags} />
    </article>
  );
};

export default ItemCard;
