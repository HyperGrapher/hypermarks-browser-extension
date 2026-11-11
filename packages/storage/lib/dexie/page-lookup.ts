import { db } from './db';
import type { DexieTab } from './dexie-types';

/**
 * A comparable key for a page, so the same page matches even when the address differs in ways that do not change
 * the page: `#hash`, `www.`, a trailing slash, a YouTube video opened with `&t=` / `&list=`, tracking params on X.
 * Returns null for pages that can never be saved (chrome://, about:, ...).
 */
export function pageKey(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const path = url.pathname.replace(/\/+$/, '');

  if (host === 'youtu.be' && path.length > 1) return `youtube.com/watch?v=${path.slice(1)}`;
  if (host === 'youtube.com') {
    const video = url.searchParams.get('v');
    if (path === '/watch' && video) return `youtube.com/watch?v=${video}`;
    const playlist = url.searchParams.get('list');
    if (path === '/playlist' && playlist) return `youtube.com/playlist?list=${playlist}`;
  }
  // The address of a post / profile is its path, the query only carries tracking params (?s=20, ?t=...)
  if (host === 'x.com' || host === 'twitter.com') return `x.com${path}`;

  return `${host}${path}${url.search}`;
}

/** The saved item with the same page address, if any. `origin` is indexed, so only that origin's items are read. */
export async function findSavedMark(rawUrl: string): Promise<DexieTab | undefined> {
  const key = pageKey(rawUrl);
  if (!key) return undefined;
  const origin = new URL(rawUrl).origin;
  return db.marks
    .where('origin')
    .equals(origin)
    .filter(mark => pageKey(mark.url) === key)
    .first();
}
