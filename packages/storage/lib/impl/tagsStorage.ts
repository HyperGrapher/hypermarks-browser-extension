import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

// Tag type to store the tag name and its count
type TagType = {
  tag: string;
  count: number;
};

// Tags storage type with methods to manage tags
type TagsStorage = BaseStorage<TagType[]> & {
  addTag: (tag: string) => Promise<void>;
  getTagSuggestions: (query: string) => Promise<TagType[]>;
  renameTag: (oldTag: string, newTag: string) => Promise<void>;
};

const tagsStorageKey = 'tags-storage-key';

// Create the storage with an initial empty array
const storage = createStorage<TagType[]>(tagsStorageKey, [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

// Extend the storage with custom methods
export const tagsStorage: TagsStorage = {
  ...storage,

  // Add a tag or increment its count if it already exists
  addTag: async (tag: string) => {
    await storage.set(prev => {
      const existingTag = prev.find(t => t.tag === tag);

      if (existingTag) {
        // Increment count for an existing tag
        return prev.map(t => (t.tag === tag ? { ...t, count: t.count + 1 } : t));
      } else {
        // Add a new tag
        return [...prev, { tag, count: 1 }];
      }
    });
  },

  // Get suggestions based on a query (case-insensitive)
  getTagSuggestions: async (query: string) => {
    const tags = await storage.get();
    return tags.filter(tag => tag.tag.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.count - a.count); // Suggest by usage frequency
  },

  // Rename a tag and update its name while preserving count
  renameTag: async (oldTag: string, newTag: string) => {
    await storage.set(prev => {
      const existingTag = prev.find(t => t.tag === oldTag);

      if (!existingTag) {
        throw new Error(`Tag "${oldTag}" not found.`);
      }

      // Check if the new tag already exists
      const newTagEntry = prev.find(t => t.tag === newTag);

      if (newTagEntry) {
        // Merge counts if new tag exists
        return prev
          .filter(t => t.tag !== oldTag) // Remove the old tag
          .map(t => (t.tag === newTag ? { ...t, count: t.count + existingTag.count } : t));
      }

      // Update the tag name
      return prev.map(t => (t.tag === oldTag ? { ...t, tag: newTag } : t));
    });
  },
};
