import { beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { db, findSavedMark } from '@extension/storage';
import type { DexieTab } from '@extension/storage';

async function addMark(url: string, categoryId: number, extra: Partial<DexieTab> = {}) {
  return db.marks.add({
    categoryId,
    title: 'A page',
    description: '',
    origin: new URL(url).origin,
    url,
    icon: '',
    note: '',
    tags: [],
    itemType: 'other',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...extra,
  });
}

beforeEach(async () => {
  await Promise.all(db.tables.map(table => table.clear()));
});

describe('findSavedMark', () => {
  it('finds a saved page even when the address differs by hash, www or trailing slash', async () => {
    const categoryId = await db.categories.add({ category: 'Reading' });
    const id = await addMark('https://example.com/blog/post', categoryId);

    expect((await findSavedMark('https://example.com/blog/post/#comments'))?.id).toBe(id);
  });

  it('returns undefined for pages that are not saved', async () => {
    const categoryId = await db.categories.add({ category: 'Reading' });
    await addMark('https://example.com/blog/post', categoryId);

    expect(await findSavedMark('https://example.com/blog/other')).toBeUndefined();
    expect(await findSavedMark('chrome://extensions')).toBeUndefined();
  });
});

describe('updateItem', () => {
  it('changes category, tags, note and favorite without adding a duplicate', async () => {
    const reading = await db.categories.add({ category: 'Reading' });
    const id = await addMark('https://example.com/a', reading, { tags: ['old'] });
    await addMark('https://example.com/b', reading);

    await db.updateItem(id, { category: 'Work', tags: ['new', 'tags'], note: 'hello', favorite: 'red' });

    const mark = await db.marks.get(id);
    const work = await db.categories.where('category').equals('Work').first();
    expect(await db.marks.count()).toBe(2);
    expect(mark).toMatchObject({ categoryId: work?.id, tags: ['new', 'tags'], note: 'hello', favorite: 'red' });
    // The old category still has another item, so it stays
    expect(await db.categories.get(reading)).toBeDefined();
  });

  it('removes the old category and sub category when the item was the last one in them', async () => {
    const reading = await db.categories.add({ category: 'Reading' });
    const sub = await db.subCategories.add({ categoryId: reading, name: 'Later' });
    const id = await addMark('https://example.com/a', reading, { subCategoryId: sub, favorite: 'blue' });

    await db.updateItem(id, { category: 'Work', subCategory: '', tags: [], note: '' });

    const mark = await db.marks.get(id);
    expect(await db.categories.get(reading)).toBeUndefined();
    expect(await db.subCategories.get(sub)).toBeUndefined();
    expect(mark?.subCategoryId).toBeUndefined();
    expect(mark?.favorite).toBeUndefined();
  });

  it('creates and assigns a new sub category', async () => {
    const reading = await db.categories.add({ category: 'Reading' });
    const id = await addMark('https://example.com/a', reading);

    await db.updateItem(id, { category: 'Reading', subCategory: 'Articles', tags: [], note: '' });

    const sub = await db.subCategories.where({ categoryId: reading, name: 'Articles' }).first();
    expect(sub).toBeDefined();
    expect((await db.marks.get(id))?.subCategoryId).toBe(sub?.id);
  });

  it('throws when the item does not exist', async () => {
    await expect(db.updateItem(999, { category: 'Work', tags: [], note: '' })).rejects.toThrow('Item not found');
  });
});
