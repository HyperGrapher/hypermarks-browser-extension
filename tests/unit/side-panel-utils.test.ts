import { describe, expect, it } from 'vitest';
import type { DexieTab } from '@extension/storage';
import { filterByTags, sortMarks } from '../../pages/side-panel/src/utils';

const mark = (id: number, title: string, createdAt: string, updatedAt = createdAt, tags: string[] = []): DexieTab => ({
  id,
  categoryId: 1,
  title,
  description: '',
  origin: 'https://example.com',
  url: `https://example.com/${id}`,
  icon: '',
  note: undefined,
  tags,
  itemType: 'other',
  createdAt: new Date(createdAt),
  updatedAt: new Date(updatedAt),
});

const marks = [
  mark(1, 'banana', '2024-01-01', '2024-03-01'),
  mark(2, 'Apple', '2024-02-01', '2024-01-15'),
  mark(3, 'cherry 10', '2024-03-01', '2024-02-01'),
  mark(4, 'cherry 2', '2024-03-01', '2024-02-01'),
];

const ids = (list: DexieTab[]) => list.map(m => m.id);

describe('sortMarks', () => {
  it('sorts newest first, ties by id (newer id first)', () => {
    expect(ids(sortMarks(marks, 'newest'))).toEqual([4, 3, 2, 1]);
  });

  it('sorts oldest first, ties by id', () => {
    expect(ids(sortMarks(marks, 'oldest'))).toEqual([1, 2, 3, 4]);
  });

  it('sorts by last update', () => {
    expect(ids(sortMarks(marks, 'updated'))).toEqual([1, 4, 3, 2]);
  });

  it('sorts by title ignoring case and comparing numbers naturally', () => {
    expect(ids(sortMarks(marks, 'title-asc'))).toEqual([2, 1, 4, 3]);
    expect(ids(sortMarks(marks, 'title-desc'))).toEqual([3, 4, 1, 2]);
  });

  it('does not change the original array', () => {
    const copy = [...marks];
    sortMarks(marks, 'title-asc');
    expect(marks).toEqual(copy);
  });
});

describe('filterByTags', () => {
  const tagged = [
    mark(1, 'a', '2024-01-01', '2024-01-01', ['react', 'ts']),
    mark(2, 'b', '2024-01-01', '2024-01-01', ['react']),
    mark(3, 'c', '2024-01-01', '2024-01-01', ['ts']),
    mark(4, 'd', '2024-01-01', '2024-01-01', []),
  ];

  it('returns everything when no tag is selected', () => {
    expect(filterByTags(tagged, [])).toBe(tagged);
  });

  it('keeps the items that have the tag', () => {
    expect(ids(filterByTags(tagged, ['react']))).toEqual([1, 2]);
  });

  it('requires all the selected tags', () => {
    expect(ids(filterByTags(tagged, ['react', 'ts']))).toEqual([1]);
  });

  it('returns nothing when no item matches', () => {
    expect(filterByTags(tagged, ['unknown'])).toEqual([]);
  });
});
