'use client';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SelectTags } from './SelectTags';

import { Button, cn } from '@extension/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@extension/ui';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@extension/ui';

// chrome.storage.local.get(['tags'], function (result) {
//   setTags(result.tags);
// });

const tailwindColors = [
  { id: '1', name: 'red-500' },
  { id: '2', name: 'blue-500' },
  { id: '3', name: 'green-500' },
  { id: '4', name: 'yellow-500' },
  { id: '5', name: 'purple-500' },
  { id: '6', name: 'pink-500' },
  { id: '7', name: 'indigo-500' },
  { id: '8', name: 'gray-500' },
  { id: '9', name: 'orange-500' },
  { id: '10', name: 'teal-500' },
  { id: '11', name: 'cyan-500' },
  { id: '12', name: 'emerald-500' },
  { id: '13', name: 'violet-500' },
  { id: '14', name: 'fuchsia-500' },
  { id: '15', name: 'rose-500' },
  { id: '16', name: 'amber-500' },
  { id: '17', name: 'lime-500' },
  { id: '18', name: 'sky-500' },
  { id: '19', name: 'slate-500' },
  { id: '20', name: 'zinc-500' },
];

const FormSchema = z.object({
  tags: z.array(z.string()).min(1, 'Please select at least one tag'),
});

type FormSchema = z.infer<typeof FormSchema>;

export const TagsForm = ({ setTags }: { setTags: React.Dispatch<React.SetStateAction<string[] | null>> }) => {
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
                      data={tailwindColors}
                      value={field.value}
                      placeholder="Add tags.."
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
