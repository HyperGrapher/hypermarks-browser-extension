import { Form, FormControl, FormField, FormItem } from '@extension/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SelectTags } from './SelectTags';
import { db } from '@extension/storage';
import { useLiveQuery } from 'dexie-react-hooks';

function extractTagsWithCount(data: string[] | undefined): { name: string; value: number }[] {
  const tagMap: Record<string, number> = {};

  if (!data) return [];

  data.forEach((tag: string) => {
    // Increment count for the tag
    tagMap[tag] = (tagMap[tag] || 0) + 1;
  });
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
  const tabs = useLiveQuery(async () => (await db.marks.toArray()).map(c => c.tags).flat(), []);

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
