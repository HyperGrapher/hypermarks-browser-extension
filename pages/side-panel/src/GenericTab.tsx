import { cn, searchTagsAtom } from './utils';
import { deleteTab } from '@extension/storage';
import { openTab, SingleTab, useWindowSize } from '@extension/shared';
import { Badge } from '@extension/ui';
import TimeAgo from 'timeago-react';
import { X } from 'lucide-react';
import { Info } from 'lucide-react';
import { useAtom } from 'jotai';

// TODO:  if no icon/thumbnail, show default ones
// https://www.youtube.com/playlist?list=PLRnI_2_ZWhtCxHQ_3zDfW0-RgiWo8ftyj

export const GenericTab = ({ item }: { item: SingleTab }) => {
  const [searchTags, setSearchTags] = useAtom(searchTagsAtom);

  return (
    <div
      className={cn(
        'px-1 pb-1 rounded shadow-lg border border-gray-300/20',
        'bg-slate-700/20 w-full relative max-h-36 flex flex-col card selection:bg-sky-600/80 selection:text-sky-300',
      )}>
      <button
        className={cn(
          'expand absolute xscale-75 insetx-0 right-1 top-1 xmt-6',
          'size-4 aspect-square z-30 rounded-full bg-slate-700/50 flex justify-center items-center',
        )}
        onClick={() => deleteTab(item.datetime)}>
        <X size={12} />
      </button>

      <div className="xyt-item flex items-centerx gap-2 pb-1 pt-2 px-3">
        <img
          src={item.icon ?? ''}
          alt="icon"
          className="size-4 translate-y-[1px]"
          onError={e => (e.currentTarget.src = chrome.runtime.getURL('side-panel/icon-fallback.png'))}
        />

        <div className="">
          <button
            onClick={async () => await openTab(item.url)}
            title={item.title}
            className="text-left font-semibold inline text-slate-300">
            <span className="wrap-text-anywhere line-clamp-2">{item.title}</span>
          </button>
        </div>
        {/* <TimeAgo datetime={item.datetime} className="text-slate-500" /> */}
      </div>

      <div className="flex gap-2 z-20 w-full items-center pl-2">
        <div className="max-w-sm pr-2 w-full">
          <p className="text-slate-500 text-xs/3 leading-3 wrap-text-anywhere line-clamp-5">{item?.description}</p>
        </div>
      </div>
      <section className="pt-1 flex flex-wrap gap-0.5 w-full">
        {item.tags.map(pill => (
          <Badge
            onClick={() => setSearchTags(prev => [...new Set([...prev, pill])])}
            key={pill}
            variant="outline"
            className="hover:cursor-pointer font-light py-0 text-[10px] bg-blue-700/20 hover:bg-blue-700/40">
            {pill}
          </Badge>
        ))}
      </section>
    </div>
  );
};

/*
 <section className={cn('expand absolute right-1 top-1')}>
        <button
          className={cn('size-4 aspect-square z-30 rounded-full bg-slate-600/20 flex justify-center items-center')}
          onClick={() => deleteItem(item.datetime)}>
          <X size={12} />
        </button>

        <span className={cn(
          'translate-y-1 text-slate-400',
          'size-4 aspect-square z-30 rounded-full bg-slate-600/20 flex justify-center items-center'
        )}>
          <Info size={14} />
        </span>
      </section>

*/
