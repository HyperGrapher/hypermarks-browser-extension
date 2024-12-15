export * from './shared-types';
export * from './chrome-utils';
export * from './tab-saver';

import { atom } from 'jotai';

export const tagsAtom = atom<string[]>([]);
