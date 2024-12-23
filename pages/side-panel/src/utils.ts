import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { atom } from 'jotai';
import type { CategorizedTab, SingleTab } from '@extension/shared';

export const searchTagsAtom = atom<string[]>([]);
export const drawerAtom = atom<{ item: SingleTab | null; open: boolean; edit: boolean }>({
  item: null,
  open: false,
  edit: false,
});

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
