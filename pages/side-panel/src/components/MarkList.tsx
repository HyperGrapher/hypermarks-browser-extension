import { useEffect, useRef, useState } from 'react';
import type { DexieTab } from '@extension/storage';
import { TweetCard } from '../items/TweetCard';
import { XProfileCard } from '../items/XProfileCard';
import YoutubeVideoCard from '../items/YoutubeVideoCard';
import YoutubePlaylistCard from '../items/YoutubePlaylistCard';
import { GenericTab as DexieGeneric } from '../items/GenericTab';

// Cards mounted up front. Mounting every saved item at once blocks the main thread (each card runs its own
// queries), which delayed the tab switch and made the fade-in look uneven.
const INITIAL_COUNT = 20;
const PAGE_SIZE = 20;

function MarkCard({ tab }: { tab: DexieTab }) {
  switch (tab.itemType) {
    case 'x-post':
      return <TweetCard item={tab} />;
    case 'x-profile':
      return <XProfileCard item={tab} />;
    case 'yt-video':
      return <YoutubeVideoCard item={tab} />;
    case 'yt-playlist':
      return <YoutubePlaylistCard item={tab} />;
    default:
      return <DexieGeneric item={tab} />;
  }
}

/** Renders marks progressively: the first page right away, the rest as the user scrolls near the end. */
export function MarkList({ marks }: { marks: DexieTab[] }) {
  const [limit, setLimit] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = limit < marks.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!hasMore || !sentinel) return;
    // A fresh observer reports the current intersection, so pages keep loading until the sentinel is off screen
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) setLimit(prev => prev + PAGE_SIZE);
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, limit]);

  return (
    <>
      {marks.slice(0, limit).map(tab => (
        <MarkCard key={tab.id} tab={tab} />
      ))}
      {hasMore && <div ref={sentinelRef} className="h-px" aria-hidden />}
    </>
  );
}
