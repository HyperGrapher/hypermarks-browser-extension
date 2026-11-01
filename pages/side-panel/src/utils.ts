import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { atom } from 'jotai';
import type { CategorizedTab, SingleTab } from '@extension/shared';
import { DexieTab } from '@extension/storage';

export const searchTagsAtom = atom<string[]>([]);

export const drawerAtom = atom<{ item: SingleTab | null; open: boolean; edit: boolean }>({
  item: null,
  open: false,
  edit: false,
});

export const dexieDrawerAtom = atom<{ item: DexieTab | null; open: boolean; edit: boolean }>({
  item: null,
  open: false,
  edit: false,
});

/** The item whose "Duplicate item to" dialog is open, null when closed */
export const duplicateItemAtom = atom<DexieTab | null>(null);

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
