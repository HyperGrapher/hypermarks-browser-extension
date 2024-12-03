import React from 'react';
import { cn } from './utils';
import { tabsGroupedStorage } from '@extension/storage';
import { SingleTab, useWindowSize } from '@extension/shared';

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

export const GenericTab = ({ item }: { item: SingleTab }) => {
  return (
    <div
      className={cn(
        'px-1 pb-1 rounded shadow-lg border border-gray-700',
        'bg-slate-950 w-full relative max-h-36 flex flex-col',
      )}>
      <button
        className={cn(
          'expand absolute xscale-75 insetx-0 right-1 top-1 xmt-6',
          'size-4 aspect-square z-30 rounded-full bg-slate-700/50 flex justify-center items-center',
        )}
        onClick={() => deleteItem(item.datetime)}>
        <span className="p-0 text-gray-300/70">x</span>
      </button>

      <div className="xyt-item flex items-centerx gap-2 pb-1 pt-2 px-3">
        <img
          src={item.icon}
          alt="icon"
          className="size-4 translate-y-[1px]"
          onError={e => (e.currentTarget.src = chrome.runtime.getURL('side-panel/icon-fallback.png'))}
        />

        <div className="">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-break-spaces truncate font-semibold inline text-slate-300">
            {item.title}
          </a>
        </div>
      </div>

      <div className="flex gap-2 z-20 w-full items-center pl-2">
        <div className="max-w-sm pr-2 w-full">
          <p className="text-slate-500 truncatex whitespace-break-spaces text-xs/3 leading-3">
            {item?.description.slice(0, 325)}
          </p>
        </div>
      </div>
    </div>
  );
};
