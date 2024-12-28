export * from './shared-types';
export * from './chrome-utils';
export * from './tab-saver';

import { atom } from 'jotai';

export const tagsAtom = atom<string[]>([]);

export const remove_www = (hostname: string | undefined) => {
  if (!hostname) return '';
  return hostname.startsWith('www') ? hostname.slice(4) : hostname;
};
