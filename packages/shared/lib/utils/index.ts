export * from './shared-types';
export * from './chrome-utils';
export * from './tab-saver';
export * from './main-controller';

import { atom } from 'jotai';

export const tagsAtom = atom<string[]>([]);

/**
 * Removes www from given URL
 *
 * @param url - The URL string to modify.
 * @returns The modified URL string.
 */
export const remove_www = (url: string | undefined) => {
  if (!url) return '';
  return url.startsWith('www') ? url.slice(4) : url;
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

/**
 * This func made for Soundcloud song artwork
 * Needs to be tested for other usage.
 *
 * @param element
 * @returns URL of image
 */

// Function to extract the URL from a background-image style
function getBackgroundImageUrl(element: HTMLElement): string | null {
  // Get computed style of the element
  const style = window.getComputedStyle(element);

  // Get the background-image value
  const backgroundImage = style.backgroundImage;

  // Extract the URL using a regular expression
  const urlMatch = backgroundImage.match(/url\(["']?(.*?)["']?\)/);

  // Return the extracted URL or null if no match
  return urlMatch ? urlMatch[1] : null;
}
