import { TagItem, useStorage } from '@extension/shared';
import { tabsGroupedStorage } from '@extension/storage';
import { Form, FormControl, FormField, FormItem } from '@extension/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SelectTags } from './SelectTags';

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

type FormSchemaType = z.infer<typeof FormSchema>;

export const TagsForm = () => {
  const tabs = useStorage(tabsGroupedStorage);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tags: [],
    },
  });

  return (
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
                    data={extractTagsWithCount(tabs)}
                    placeholder="Type to search in tags.."
                    onValueChange={selectedValues => {
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
  );
};
