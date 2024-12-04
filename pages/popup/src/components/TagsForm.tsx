'use client';
import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SelectTags } from './SelectTags';

import { Button, cn } from '@extension/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@extension/ui';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@extension/ui';
import { tabsGroupedStorage } from '@extension/storage';
import { CategorizedTab, SingleTab, TagItem, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';

// chrome.storage.local.get(['tags'], function (result) {
//   setTags(result.tags);
// });

const tailwindColors = [
  { count: '1', name: 'red-500' },
  { count: '2', name: 'blue-500' },
  { count: '3', name: 'green-500' },
  { count: '4', name: 'yellow-500' },
  { count: '5', name: 'purple-500' },
  { count: '6', name: 'pink-500' },
  { count: '7', name: 'indigo-500' },
  { count: '8', name: 'gray-500' },
  { count: '9', name: 'orange-500' },
  { count: '10', name: 'teal-500' },
  { count: '11', name: 'cyan-500' },
  { count: '12', name: 'emerald-500' },
  { count: '13', name: 'violet-500' },
  { count: '14', name: 'fuchsia-500' },
  { count: '15', name: 'rose-500' },
  { count: '16', name: 'amber-500' },
  { count: '17', name: 'lime-500' },
  { count: '18', name: 'sky-500' },
  { count: '19', name: 'slate-500' },
  { count: '20', name: 'zinc-500' },
];

function extractTagsWithCount(data: Record<string, any[]>): { name: string; value: number }[] {
  const tagMap: Record<string, number> = {};

  // Iterate over each category in the object
  for (const category in data) {
    data[category].forEach(item => {
      // Iterate over tags in the current item
      item.tags.forEach((tag: string) => {
        // Increment count for the tag
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    });
  }

  // Convert the tagMap to an array of objects with "tag" and "count"
  return Object.entries(tagMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Optional: Sort by count in descending order
}

const FormSchema = z.object({
  tags: z.array(z.string()).min(1, 'Please select at least one tag'),
});

type FormSchema = z.infer<typeof FormSchema>;

export const TagsForm = ({ setTags }: { setTags: React.Dispatch<React.SetStateAction<string[] | null>> }) => {
  const [tagsFromDb, setTagsFromDb] = useState<TagItem[]>([]);
  const tabsCats = useStorage(tabsGroupedStorage);

  useEffect(() => {
    (async () => {
      // const data = await tabsGroupedStorage.get();
      setTagsFromDb(extractTagsWithCount(tabsCats));
    })();
  }, []);

  useEffect(() => {
    console.log(tagsFromDb);
  }, [tagsFromDb]);

  const form = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tags: [],
    },
  });

  return (
    <>
      <div className="w-full">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SelectTags
                      data={tagsFromDb}
                      value={field.value}
                      // placeholder="Add tags.."
                      onValueChange={selectedValues => {
                        setTags(selectedValues);
                        field.onChange(selectedValues);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </>
  );
};
