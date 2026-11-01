import type { YouTube } from '@extension/storage';

/**
 * Adds a "Save to HyperMarx" entry to the three-dots menu of YouTube video cards
 * (e.g. the recommended videos next to the player).
 *
 * Flow: remember which `yt-lockup-view-model` card the three-dots button belongs to, wait for
 * YouTube to open its popup menu, inject our item, and on click scrape the card and hand the
 * data to the background worker (the Dexie DB lives in the extension origin, not on youtube.com).
 */

const LOCKUP_TAG = 'yt-lockup-view-model';
const MENU_BUTTON_SELECTOR = `yt-lockup-metadata-view-model button-view-model`;
const MENU_ITEM_ATTR = 'data-hypermarks-menu-item';
const MENU_LIST_SELECTOR = 'yt-list-view-model, tp-yt-paper-listbox#items';
const OBSERVE_MENU_MS = 2000;

let activeLockup: Element | null = null;
let stopObservingMenu: (() => void) | null = null;

export function initYoutubeMenu() {
  if (!location.hostname.endsWith('youtube.com')) return;
  document.addEventListener('click', onDocumentClick, true);
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest(`[${MENU_ITEM_ATTR}]`)) return;

  const menuButton = target.closest(MENU_BUTTON_SELECTOR);
  const lockup = menuButton?.closest(LOCKUP_TAG);
  if (!lockup) return;

  activeLockup = lockup;
  watchForMenu();
}

/**
 * YouTube builds the popup asynchronously (and may re-render its items), so keep
 * (re-)injecting for a short window after the click instead of injecting once.
 */
function watchForMenu() {
  stopObservingMenu?.();
  removeInjectedItems();

  const root = document.querySelector('ytd-popup-container') ?? document.body;
  const observer = new MutationObserver(ensureMenuItem);
  observer.observe(root, { childList: true, subtree: true, attributes: true });

  const timeout = window.setTimeout(stop, OBSERVE_MENU_MS);
  function stop() {
    observer.disconnect();
    window.clearTimeout(timeout);
    if (stopObservingMenu === stop) stopObservingMenu = null;
  }
  stopObservingMenu = stop;

  ensureMenuItem();
}

function ensureMenuItem() {
  const list = findOpenMenuList();
  if (!list || list.querySelector(`[${MENU_ITEM_ATTR}]`)) return;
  list.prepend(createMenuItem());
}

function findOpenMenuList(): Element | null {
  const dropdowns = document.querySelectorAll('ytd-popup-container tp-yt-iron-dropdown');
  for (const dropdown of Array.from(dropdowns)) {
    // Closed dropdowns stay in the DOM but are hidden
    if (dropdown.getClientRects().length === 0) continue;
    const list = dropdown.querySelector(MENU_LIST_SELECTOR);
    if (list && list.childElementCount > 0) return list;
  }
  return null;
}

function removeInjectedItems() {
  document.querySelectorAll(`[${MENU_ITEM_ATTR}]`).forEach(el => el.remove());
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function createMenuItem(): HTMLElement {
  // Built with DOM APIs (no innerHTML) because YouTube enforces Trusted Types.
  const item = document.createElement('div');
  item.setAttribute(MENU_ITEM_ATTR, '');
  item.setAttribute('role', 'menuitem');
  item.tabIndex = 0;
  Object.assign(item.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxSizing: 'border-box',
    minHeight: '36px',
    padding: '8px 16px',
    cursor: 'pointer',
    font: '400 14px/20px Roboto, Arial, sans-serif',
    color: 'var(--yt-spec-text-primary, #0f0f0f)',
  });

  const hoverBg = 'var(--yt-spec-10-percent-layer, rgba(0, 0, 0, 0.1))';
  item.addEventListener('mouseenter', () => (item.style.background = hoverBg));
  item.addEventListener('mouseleave', () => (item.style.background = ''));

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('fill', 'currentColor');
  svg.style.flexShrink = '0';
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z');
  svg.appendChild(path);

  const label = document.createElement('span');
  label.textContent = 'Save to HyperMarx';

  item.append(svg, label);

  const onActivate = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    void saveActiveLockup();
  };
  item.addEventListener('click', onActivate);
  item.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') onActivate(event);
  });

  return item;
}

type LockupVideo = { videoId: string; video: YouTube.Video };

function extractVideo(lockup: Element): LockupVideo | null {
  const anchor = lockup.querySelector<HTMLAnchorElement>('a[href*="/watch?v="]');
  const href = anchor?.getAttribute('href');
  if (!href) return null;

  const url = new URL(href, location.origin);
  const videoId = url.searchParams.get('v');
  // Playlist / Mix cards are a different kind of item, don't save them as a single video
  if (!videoId || url.searchParams.has('list')) return null;

  const titleEl = lockup.querySelector('yt-lockup-metadata-view-model h3');
  const title = (titleEl?.getAttribute('title') || titleEl?.textContent || '').trim();

  // First metadata row is the channel name, the second is "views • date"
  const channelRow = lockup.querySelector('[class*="etadataRow"], [class*="metadata-row"]');
  const channelLink = lockup.querySelector('a[href^="/@"], a[href^="/channel/"]');
  const channelName = (channelRow?.textContent || channelLink?.textContent || '').trim();

  const avatar =
    lockup.querySelector<HTMLImageElement>('yt-avatar-shape img, yt-decorated-avatar-view-model img')?.src ?? '';

  return {
    videoId,
    video: {
      title,
      channelName,
      avatar,
      description: '',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    },
  };
}

async function saveActiveLockup() {
  const lockup = activeLockup;
  closeMenu();

  const data = lockup ? extractVideo(lockup) : null;
  if (!data) {
    showToast('Could not read this video', true);
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({ action: 'saveYoutubeVideo', ...data });
    if (!response?.success) throw new Error(response?.error || 'Unknown error');
    showToast('Saved to HyperMarx');
  } catch (error) {
    console.error('Save to HyperMarx failed:', error);
    const reason = error instanceof Error ? error.message : String(error);
    showToast(`Could not save to HyperMarx: ${reason}`, true);
  }
}

function closeMenu() {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
}

function showToast(message: string, isError = false) {
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    left: '24px',
    bottom: '24px',
    zIndex: '2147483647',
    padding: '12px 16px',
    borderRadius: '8px',
    font: '400 14px/20px Roboto, Arial, sans-serif',
    color: '#fff',
    background: isError ? '#c62828' : '#323232',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  });
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2500);
}
