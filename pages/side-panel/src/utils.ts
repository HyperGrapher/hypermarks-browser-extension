import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { atom } from 'jotai';

export const searchTagsAtom = atom<string[]>([]);

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
