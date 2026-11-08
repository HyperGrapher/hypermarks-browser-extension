import { describe, expect, it } from 'vitest';
import { FAVORITE_COLORS, favoriteCardClass } from '../../packages/ui/lib/components/FavoritePicker';

describe('favoriteCardClass', () => {
  it('returns no classes when the item is not a favorite', () => {
    expect(favoriteCardClass(undefined)).toBe('');
  });

  it('returns the card classes of each color', () => {
    for (const color of FAVORITE_COLORS) {
      expect(favoriteCardClass(color.value)).toBe(color.card);
      expect(color.card).not.toBe('');
    }
  });

  it('offers blue, red and yellow', () => {
    expect(FAVORITE_COLORS.map(color => color.value)).toEqual(['blue', 'red', 'yellow']);
  });
});
