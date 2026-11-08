import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../packages/storage/lib/dexie/db';
import { importDatabase, previewImport } from '../../packages/storage/lib/dexie/import-export';

const exportFile = {
  categories: [
    { id: 1, category: 'Dev' },
    { id: 2, category: 'Music' },
  ],
  subCategories: [{ id: 10, categoryId: 1, name: 'React' }],
  marks: [
    {
      id: 100,
      categoryId: 1,
      subCategoryId: 10,
      title: 'Hooks',
      description: '',
      origin: 'https://example.com',
      url: 'https://example.com/hooks',
      icon: '',
      tags: ['react'],
      itemType: 'other',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 101,
      categoryId: 2,
      title: 'Song',
      description: '',
      origin: 'https://music.example',
      url: 'https://music.example/song',
      icon: '',
      tags: [],
      itemType: 'other',
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
  ],
};

beforeEach(async () => {
  await Promise.all(db.tables.map(table => table.clear()));
});

describe('previewImport', () => {
  it('lists the categories of the file with their counts', async () => {
    expect(await previewImport(exportFile)).toEqual([
      { name: 'Dev', items: 1, subCategories: 1, existsInDb: false },
      { name: 'Music', items: 1, subCategories: 0, existsInDb: false },
    ]);
  });

  it('marks the categories that already exist', async () => {
    await db.categories.add({ category: 'Dev' });
    const preview = await previewImport(exportFile);
    expect(preview.find(c => c.name === 'Dev')?.existsInDb).toBe(true);
    expect(preview.find(c => c.name === 'Music')?.existsInDb).toBe(false);
  });

  it('rejects files that are not an export', async () => {
    await expect(previewImport({ hello: 'world' })).rejects.toThrow('Not a HyperMarks export file');
    await expect(previewImport(null)).rejects.toThrow('Not a HyperMarks export file');
  });
});

describe('importDatabase', () => {
  it('imports items with fresh ids and re-mapped links', async () => {
    const result = await importDatabase(exportFile, 'merge');
    expect(result).toEqual({ items: 2, skippedDuplicates: 0 });

    const hooks = await db.marks.filter(m => m.url === 'https://example.com/hooks').first();
    const category = await db.categories.get(hooks!.categoryId);
    const sub = await db.subCategories.get(hooks!.subCategoryId!);
    expect(category?.category).toBe('Dev');
    expect(sub?.name).toBe('React');
    expect(hooks!.createdAt).toBeInstanceOf(Date);
  });

  it('skips items whose url is already saved when merging', async () => {
    await importDatabase(exportFile, 'merge');
    const again = await importDatabase(exportFile, 'merge');

    expect(again).toEqual({ items: 0, skippedDuplicates: 2 });
    expect(await db.marks.count()).toBe(2);
    expect(await db.categories.count()).toBe(2);
  });

  it('imports only the selected categories', async () => {
    const result = await importDatabase(exportFile, 'merge', { categories: ['Music'] });

    expect(result.items).toBe(1);
    expect((await db.categories.toArray()).map(c => c.category)).toEqual(['Music']);
    expect(await db.subCategories.count()).toBe(0);
  });

  it('replaces the current data in replace mode', async () => {
    const oldCategory = await db.categories.add({ category: 'Old' });
    await db.marks.add({
      categoryId: oldCategory,
      title: 'Old item',
      description: '',
      origin: 'https://old.example',
      url: 'https://old.example/item',
      icon: '',
      note: undefined,
      tags: [],
      itemType: 'other',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await importDatabase(exportFile, 'replace');

    expect((await db.categories.toArray()).map(c => c.category).sort()).toEqual(['Dev', 'Music']);
    expect(await db.marks.filter(m => m.url === 'https://old.example/item').count()).toBe(0);
    expect(await db.marks.count()).toBe(2);
  });
});
