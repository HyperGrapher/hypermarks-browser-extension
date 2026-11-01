import { useEffect, useRef, useState } from 'react';

/**
 * Becomes true (and stays true) once the element is within `rootMargin` of the viewport.
 * Used to defer heavy per-card work, like loading screenshots, until a card is about to be seen.
 */
export function useNearViewport<T extends Element>(rootMargin = '400px 0px') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (near || !element) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [near, rootMargin]);

  return [ref, near] as const;
}
