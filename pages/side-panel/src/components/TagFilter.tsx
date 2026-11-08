import { useAtom } from 'jotai';
import { X } from 'lucide-react';
import { Badge } from '@extension/ui';
import { cn, searchTagsAtom } from '../utils';

/** Tags of a card. Clicking a tag adds it to the active filter, clicking an active tag removes it. */
export function TagList({ tags, className }: { tags: string[] | undefined; className?: string }) {
  const [activeTags, setActiveTags] = useAtom(searchTagsAtom);

  if (!tags?.length) return <section className={cn('flex w-full flex-wrap gap-0.5 pt-1', className)} />;

  const toggle = (tag: string) =>
    setActiveTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));

  return (
    <section className={cn('flex w-full flex-wrap gap-0.5 pt-1', className)}>
      {tags.map(tag => {
        const active = activeTags.includes(tag);
        return (
          <Badge
            key={tag}
            role="button"
            aria-pressed={active}
            title={active ? `Remove "${tag}" from the filter` : `Filter by "${tag}"`}
            onClick={() => toggle(tag)}
            variant="outline"
            className={cn(
              'py-0 text-[10px] font-light hover:cursor-pointer',
              active
                ? 'border-sky-300/60 bg-sky-500/40 text-sky-50 hover:bg-sky-500/30'
                : 'bg-blue-700/20 hover:bg-blue-700/40',
            )}>
            {tag}
          </Badge>
        );
      })}
    </section>
  );
}

/** The active tag filter: removable chips, a clear button and the number of matching items. */
export function TagFilterBar({ matchCount }: { matchCount: number }) {
  const [activeTags, setActiveTags] = useAtom(searchTagsAtom);

  if (activeTags.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs" role="group" aria-label="Active tag filter">
      <span className="text-zinc-400">
        {matchCount} {matchCount === 1 ? 'item' : 'items'} with
      </span>
      {activeTags.map(tag => (
        <button
          key={tag}
          onClick={() => setActiveTags(prev => prev.filter(t => t !== tag))}
          title={`Remove "${tag}" from the filter`}
          className="flex items-center gap-1 rounded-full border border-sky-300/60 bg-sky-500/40 py-0.5 pl-2 pr-1.5 text-sky-50 hover:bg-sky-500/30">
          {tag}
          <X size={10} />
        </button>
      ))}
      <button onClick={() => setActiveTags([])} className="ml-auto text-zinc-400 underline hover:text-zinc-200">
        Clear
      </button>
    </div>
  );
}

export function NoTagMatches() {
  const [, setActiveTags] = useAtom(searchTagsAtom);

  return (
    <div className="mt-8 text-center text-slate-400">
      <p>No items have all of the selected tags.</p>
      <button onClick={() => setActiveTags([])} className="mt-2 underline hover:text-zinc-200">
        Clear filter
      </button>
    </div>
  );
}
