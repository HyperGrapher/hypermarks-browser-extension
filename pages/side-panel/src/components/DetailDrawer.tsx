import { Button, cn, Input, Label, DropdownSelect, NoteInput } from '@extension/ui';
import { useAtom, useSetAtom } from 'jotai';
import { dexieDrawerAtom } from '../utils';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@extension/ui';
import { db } from '@extension/storage';
import { useLiveQuery } from 'dexie-react-hooks';
import { DexieTab } from '@extension/storage/lib/dexie/db';
import { DexieItemAndCategory, tagsAtom } from '@extension/shared';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { TagsForm } from './tags/TagsForm';

export function DetailDrawer() {
  const [drawer, setDrawer] = useAtom(dexieDrawerAtom);

  const tab = useLiveQuery(async () => await db.tabs.where({ id: drawer.item?.id ?? 1 }).first(), [drawer.item?.id]);
  const cat = useLiveQuery(
    async () => await db.categories.where({ id: drawer.item?.categoryId ?? 1 }).first(),
    [drawer.item?.categoryId],
  );

  if (!tab) return null;

  return (
    <Drawer open={drawer.open} onOpenChange={val => setDrawer({ item: drawer.item, open: val, edit: false })}>
      <DrawerContent className="bg-grad">
        <DrawerHeader className="text-left">
          <DrawerTitle>{tab.title}</DrawerTitle>
          <DrawerDescription>{tab.description}</DrawerDescription>
        </DrawerHeader>
        {drawer.edit ? <EditForm data={tab} category={cat} /> : <ItemDisplay data={tab} category={cat} />}
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ItemDisplay({ data, category }: { data: DexieTab | undefined; category: DexieItemAndCategory | undefined }) {
  return (
    <div className="">
      <pre className="text-xs">{JSON.stringify({ data, category }, null, 4)}</pre>
    </div>
  );
}

function EditForm({ data, category }: { data: DexieTab | undefined; category: DexieItemAndCategory | undefined }) {
  const [selectedCategory, setSelectedCategory] = useState<DexieItemAndCategory>();
  const categories = useLiveQuery(async () => await db.categories?.toArray(), []);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const setDrawer = useSetAtom(dexieDrawerAtom);
  const [selectedPills, setSelectedPills] = useAtom(tagsAtom);

  useEffect(() => {
    if (data?.note) setNote(data.note);
    if (data?.tags && data.tags.length > 0) setSelectedPills(data.tags);
    const filtered: DexieItemAndCategory = categories?.find(x => x.id === data?.categoryId);
    if (filtered && filtered.id) setSelectedCategory(filtered);

    // clean up function
    return () => {
      setSelectedCategory(undefined);
      setNote('');
      setSelectedPills([]);
    };
  }, [categories, data]);

  async function onEdit() {
    setLoading(true);
    if (!data || !data.id) return;
    await db.tabs.update(data.id, { categoryId: selectedCategory?.id ?? data.categoryId, note, tags: selectedPills });
    const itemsInCategory = await db.tabs.where({ categoryId: data.categoryId }).count();
    if (itemsInCategory === 0) {
      // No items left in category, delete category.
      await db.categories.delete(data.categoryId);
    }
    setNote('');
    setTimeout(() => {
      setLoading(false);
      setDrawer({ item: null, open: false, edit: false });
    }, 1000);
  }

  return (
    <section className={cn('grid items-start gap-4 px-4')}>
      <div className="">
        <DropdownSelect
          role="sidepanel"
          items={categories?.map(x => x.category) ?? []}
          value={selectedCategory?.category}
          onItemSelect={val =>
            setSelectedCategory({ category: val, id: categories?.find(x => x.category === val)?.id ?? 0 })
          }
          name="categories"
          placeholder="Select category"
          variant="default"
          valid={true}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Note</Label>
        <NoteInput id="note" value={note} onChange={event => setNote(event.target.value)} />
      </div>

      <TagsForm />

      <Button disabled={loading} onClick={onEdit}>
        {loading && <Loader2 className="animate-spin" />}
        Save changes
      </Button>
    </section>
  );
}
