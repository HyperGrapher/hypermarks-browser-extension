export * from './shared-types';
export * from './chrome-utils';
export * from './tab-saver';

import { atom } from 'jotai';

export const tagsAtom = atom<string[]>([]);

export const remove_www = (hostname: string | undefined) => {
  if (!hostname) return '';
  return hostname.startsWith('www') ? hostname.slice(4) : hostname;
};

/**
 * Removes specified query parameters from a URL.
 * If no query parameters are provided, removes all query parameters.
 *
 * @param url - The URL string to modify.
 * @param paramsToRemove - An optional array of query parameter names to remove.
 * @returns The modified URL string.
 */
export const removeQueryParams = (url: string, paramsToRemove?: string[]): string => {
  const urlObj = new URL(url);

  if (paramsToRemove && paramsToRemove.length > 0) {
    // Remove only the specified query parameters
    paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
  } else {
    // Remove all query parameters
    urlObj.search = '';
  }

  return urlObj.toString();
};
