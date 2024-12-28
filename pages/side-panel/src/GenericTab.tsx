import { cn, searchTagsAtom } from './utils';
import type { SingleTab } from '@extension/shared';
import { openTab, useWindowSize } from '@extension/shared';
import { Badge } from '@extension/ui';
import TimeAgo from 'timeago-react';
import { MoreVertical } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { DropdownMenuButton } from './DropdownMenuButton';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

// this js-abbreviation-number lib is only good for num to str
// import { unabbreviateNumber } from 'js-abbreviation-number';

// TODO:  if no icon/thumbnail, show default ones
// https://www.youtube.com/playlist?list=PLRnI_2_ZWhtCxHQ_3zDfW0-RgiWo8ftyj

export const GenericTab = ({ item }: { item: SingleTab }) => {
  const setSearchTags = useSetAtom(searchTagsAtom);

  return (
    <div
      className={cn(
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

      {item.tempCaps ? (
        <div className="w-full">
          <img className="size-12 w-full object-cover object-top rounded-xl" src={item.tempCaps} alt="" />
        </div>
      ) : (
        <div className="z-20 flex w-full items-center gap-2 pl-2">
          <div className="w-full max-w-sm pr-2">
            <p className="wrap-text-anywhere line-clamp-5 text-xs/3 leading-3 text-slate-500">{item?.description}</p>
          </div>
        </div>
      )}

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
    </div>
  );
};

export const XPostItem = ({ item }: { item: SingleTab }) => {
  const setSearchTags = useSetAtom(searchTagsAtom);

  return (
    <div
      className={cn(
        'px-1 pb-1 rounded shadow-lg border border-gray-300/20',
        'bg-stone-700/20 w-full relative xxmax-h-36 flex flex-col card selection:bg-sky-600/80 selection:text-sky-300',
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

      <div className={'z-20 flex w-full items-center gap-2 pl-2'}>
        <div className="w-full max-w-sm pr-2">
          <div className={`flex gap-2  ${item.xpost?.hasScreenshot ? 'mb-1' : ''}`}>
            {item.xpost?.photos && item.xpost?.photos?.length > 0
              ? item.xpost.photos.map(pic => (
                  <a key={pic} href={pic} target="_blank" rel="noopener noreferrer" className="">
                    <img className="size-16 object-cover border-gray-300/20 rounded-lg" src={pic} alt="" />
                  </a>
                ))
              : null}
          </div>

          {item.xpost?.hasScreenshot && <ImageWithPreview src={item.xpost?.screenshot ?? ''} />}
        </div>
      </div>
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
    </div>
  );
};

const ImageWithPreview = ({ src }: { src: string }) => {
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimeout = useRef<number | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ top: number; left: number } | null>(null);

  const handleMouseEnter = (event: React.MouseEvent) => {
    const { top, left, height } = event.currentTarget.getBoundingClientRect();
    const screenHeight = window.innerHeight;

    // Check if the image is near the bottom of the screen
    const isNearBottom = screenHeight - top - height < 150; // 150px as a buffer

    // Set position, and determine if the preview should go upwards or downwards
    setPreviewPosition({
      top: isNearBottom ? top - 150 : top + height, // If near the bottom, show the preview upwards
      left,
    });

    hoverTimeout.current = window.setTimeout(() => setShowPreview(true), 1000); // 1 second delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current !== null) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setShowPreview(false);
    setPreviewPosition(null);
  };

  return (
    <>
      <div className="w-full relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {/* Main Image */}
        <img className="size-12 w-full object-cover object-top rounded-lg border border-gray-300/20" src={src} alt="" />
        {/* Image overlay - HIDDEN */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 via-transparent to-transparent rounded-lg pointer-events-none hidden"></div>
      </div>

      {/* Render Preview via Portal */}
      {showPreview &&
        previewPosition &&
        createPortal(
          <div
            className="fixed z-50 flex items-center justify-center bg-black/80 border border-gray-200 rounded-lg overflow-hidden"
            style={{
              top: previewPosition.top,
              left: previewPosition.left - 14,
              maxWidth: 'calc(100vw - 20px)',
              maxHeight: 'calc(100vh - 20px)',
              width: 'auto',
              height: 'auto',
            }}>
            <img
              className="rounded-lg object-contain"
              src={src}
              alt=""
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          </div>,
          document.body, // Render outside the relative parent
        )}
    </>
  );
};
