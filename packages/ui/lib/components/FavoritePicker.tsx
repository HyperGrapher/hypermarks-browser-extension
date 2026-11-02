import { cn } from '@/lib/utils';

export type FavoriteColor = 'blue' | 'red' | 'yellow';

/**
 * Favorite colors. They are muted on purpose (low opacity, softer shades) so they blend with the dark theme
 * instead of shouting. Class names are written out in full so Tailwind can find them.
 */
export const FAVORITE_COLORS: {
  value: FavoriteColor;
  label: string;
  /** Color dot in pickers */
  swatch: string;
  /** Background + border of a favorited card */
  card: string;
}[] = [
  { value: 'blue', label: 'Blue', swatch: 'bg-sky-400/70', card: 'bg-sky-400/[0.12] border-sky-300/35' },
  { value: 'red', label: 'Red', swatch: 'bg-rose-400/70', card: 'bg-rose-400/[0.12] border-rose-300/35' },
  { value: 'yellow', label: 'Yellow', swatch: 'bg-amber-300/70', card: 'bg-amber-300/[0.12] border-amber-200/35' },
];

/** Card background/border classes to merge (last, with `cn`) over the regular card look. '' when not a favorite. */
export function favoriteCardClass(favorite: FavoriteColor | undefined): string {
  return FAVORITE_COLORS.find(color => color.value === favorite)?.card ?? '';
}

type FavoritePickerProps = {
  value: FavoriteColor | undefined;
  onChange: (value: FavoriteColor | undefined) => void;
  className?: string;
};

/** "No favorite" plus one dot per favorite color. Clicking the selected color clears it. */
export const FavoritePicker = ({ value, onChange, className }: FavoritePickerProps) => (
  <div className={cn('flex items-center gap-2', className)} role="radiogroup" aria-label="Favorite">
    <span className="text-sm text-zinc-300">Favorite</span>
    <div className="ml-auto flex items-center gap-2">
      <button
        type="button"
        role="radio"
        aria-checked={value === undefined}
        title="Not a favorite"
        onClick={() => onChange(undefined)}
        className={cn(
          'size-5 rounded-full border border-zinc-400/50 text-[10px] leading-none text-zinc-400 transition-shadow',
          value === undefined && 'ring-2 ring-zinc-300/70 ring-offset-1 ring-offset-slate-900',
        )}>
        ✕
      </button>
      {FAVORITE_COLORS.map(color => (
        <button
          key={color.value}
          type="button"
          role="radio"
          aria-checked={value === color.value}
          title={color.label}
          onClick={() => onChange(value === color.value ? undefined : color.value)}
          className={cn(
            'size-5 rounded-full transition-shadow',
            color.swatch,
            value === color.value && 'ring-2 ring-zinc-200/80 ring-offset-1 ring-offset-slate-900',
          )}
        />
      ))}
    </div>
  </div>
);
