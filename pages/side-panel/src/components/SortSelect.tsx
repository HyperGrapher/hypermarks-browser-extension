import { ArrowUpDown } from 'lucide-react';
import type { SortOption } from '@extension/storage';
import { SORT_LABELS } from '../utils';

/** Compact "sort by" control. A native select keeps the dropdown inside the narrow sidebar. */
export function SortSelect({ value, onChange }: { value: SortOption; onChange: (sort: SortOption) => void }) {
  return (
    <label className="flex items-center justify-end gap-1.5 text-xs text-zinc-400">
      <ArrowUpDown className="size-3.5" aria-hidden />
      <span className="sr-only">Sort by</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as SortOption)}
        className="cursor-pointer rounded-md border border-zinc-300/20 bg-slate-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-blue-500/60">
        {(Object.keys(SORT_LABELS) as SortOption[]).map(option => (
          <option key={option} value={option}>
            {SORT_LABELS[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
