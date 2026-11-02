import { cn, searchTagsAtom } from '../utils';
import { openTab, removeQueryParams } from '@extension/shared';
import { Badge, favoriteCardClass } from '@extension/ui';
// import TimeAgo from 'timeago-react';
import { MoreVertical } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { DropdownMenuButton } from '../components/DropdownMenuButton';
import { db, autoPrefsStorage, tabsGroupedStorage, DexieTab } from '@extension/storage';
import { useLiveQuery } from 'dexie-react-hooks';
import ImageWithPreview from '@src/components/ImageWithPreview';
import { useNearViewport } from '../components/useNearViewport';
// this js-abbreviation-number lib is only good for num to str
// import { unabbreviateNumber } from 'js-abbreviation-number';

// TEST: deleted post image: https://pbs.twimg.com/media/GgCrU99WQAAwQJt?format=png

// TODO:  if no icon/thumbnail, show default ones
// https://www.youtube.com/playlist?list=PLRnI_2_ZWhtCxHQ_3zDfW0-RgiWo8ftyj

// 2 Video and 1 image in quoted tweet
// https://x.com/levelsio/status/1875370327645254043
// 1 vid 1 photo
// https://x.com/BRICSinfo/status/1875222682385698950

// Selectd xpost with images
// https://x.com/kubadesign/status/1872956701756014797
// https://x.com/stevelauda_/status/1873011086456439159
// https://x.com/studiobakers/status/1872216983716135234
// https://x.com/kubadesign/status/1870171540350001431
// https://x.com/studiobakers/status/1786199039513616721
// https://x.com/studiobakers/status/1785957481166078021
//

// Quoted tweet with 8 images in total
// https://x.com/gizakdag/status/1865780951420121405
// https://x.com/gizakdag/status/1866499813384376642
// https://x.com/gizakdag/status/1873085056866189788

// Long text xpost
// https://x.com/SireneOznur/status/1873482351868555641

export const TweetCard = ({ item }: { item: DexieTab }) => {
  const setSearchTags = useSetAtom(searchTagsAtom);

  const xpost = useLiveQuery(async () => await db.x_posts.where({ mark_id: item.id }).first(), []);
  // Screenshots are large base64 images: only read them once the card is close to the viewport
  const [cardRef, nearViewport] = useNearViewport<HTMLDivElement>();
  const screenshot = useLiveQuery(
    async () => (nearViewport ? await db.x_screenshots.where({ mark_id: item.id }).first() : undefined),
    [nearViewport],
  );

  return (
    <div
      ref={cardRef}
      className={cn(
        'px-1 pb-1 rounded shadow-lg border border-gray-300/20',
        'bg-stone-700/20  relative flex flex-col selection:bg-sky-600/80 selection:text-sky-300',
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

      <div className="flex gap-2 px-3 pb-1 pt-2">
        {item.icon ? (
          <img
            src={item.icon}
            alt=""
            className="size-4 min-w-4 translate-y-px"
            onError={e => (e.currentTarget.src = chrome.runtime.getURL('side-panel/icon-fallback.png'))}
          />
        ) : (
          // Solves the title shifting right on tabon load.
          <div className="size-4 w-4 min-w-4 bg-red-800 translate-y-px">
            <span className="opacity-0">x</span>
          </div>
        )}

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

      <div className={'z-20 flex w-full items-center gap-2 pl-2'}>
        <div className="w-full max-w-sm pr-2">
          <div className={cn('flex gap-2', xpost && xpost.photos && xpost?.photos?.length > 0 ? 'mb-1 h-16' : 'h-0')}>
            {xpost?.photos && xpost?.photos?.length > 0
              ? xpost.photos.map(pic => {
                  const fullSizeUrl = removeQueryParams(pic, ['name']); // Remove the 'name' query param

                  return (
                    <a key={fullSizeUrl} href={fullSizeUrl} target="_blank" rel="noopener noreferrer" className="">
                      <img
                        className="clickable size-16 object-cover border-gray-300/20 rounded-lg transition-opacity hover:opacity-90 animate-fadeIn fade-in-40"
                        src={pic}
                        alt=""
                      />
                    </a>
                  );
                })
              : null}
          </div>

          {screenshot?.mark_id && <ImageWithPreview src={screenshot?.data ?? ''} />}
        </div>
      </div>
      <section className="flex w-full flex-wrap gap-0.5 pt-1">
        {item?.tags.map(pill => (
          <Badge
            onClick={() => setSearchTags(prev => [...new Set([...prev, pill])])}
            key={pill}
            variant="outline"
            className="bg-blue-700/20 py-0 text-[10px] font-light hover:cursor-pointer hover:bg-blue-700/40">
            {pill}
          </Badge>
        ))}
      </section>
    </div>
  );
};
