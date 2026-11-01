import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { atom } from 'jotai';
import type { CategorizedTab, SingleTab } from '@extension/shared';
import type { DexieTab, SortOption } from '@extension/storage';

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

export const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  updated: 'Recently updated',
  'title-asc': 'Title A-Z',
  'title-desc': 'Title Z-A',
};

const time = (date: Date | string | number | undefined) => (date ? new Date(date).getTime() : 0);

/** Returns a sorted copy. Ties fall back to the id, so the order is always stable. */
export function sortMarks(marks: DexieTab[], sort: SortOption): DexieTab[] {
  const byId = (a: DexieTab, b: DexieTab) => (a.id ?? 0) - (b.id ?? 0);
  const byTitle = (a: DexieTab, b: DexieTab) =>
    (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base', numeric: true });

  return [...marks].sort((a, b) => {
    switch (sort) {
      case 'oldest':
        return time(a.createdAt) - time(b.createdAt) || byId(a, b);
      case 'updated':
        return time(b.updatedAt) - time(a.updatedAt) || byId(b, a);
      case 'title-asc':
        return byTitle(a, b) || byId(a, b);
      case 'title-desc':
        return byTitle(b, a) || byId(a, b);
      case 'newest':
      default:
        return time(b.createdAt) - time(a.createdAt) || byId(b, a);
    }
  });
}

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
