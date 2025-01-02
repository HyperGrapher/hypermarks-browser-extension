import { Button, cn, Input, Label, DropdownSelect, NoteInput, ScrollArea } from '@extension/ui';
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
import { db, DexieTab } from '@extension/storage';
import { useLiveQuery } from 'dexie-react-hooks';
import { DexieItemAndCategory, removeQueryParams, tagsAtom } from '@extension/shared';
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2Icon } from 'lucide-react';
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
        <DrawerHeader className="text-left hidden">
          <div className="flexx justify-between -translate-y-4 text-xs hidden">
            <div className="bg-slate-800 text-slate-300 rounded-md px-2 py-0.5">{cat?.category.slice(0, 120)}</div>
            <div className="bg-slate-800 text-slate-300 rounded-md px-2 py-0.5">{tab?.origin.slice(0, 120)}</div>
          </div>
          {/* <DrawerTitle className="wrap-text-anywhere line-clamp-2">{tab.title} </DrawerTitle> */}
        </DrawerHeader>
        {drawer.edit ? <EditForm data={tab} category={cat} /> : <XpostDisplay data={tab} category={cat} />}
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from '@extension/ui';

function XpostDisplay({ data, category }: { data: DexieTab | undefined; category: DexieItemAndCategory | undefined }) {
  const xpost = useLiveQuery(async () => await db.xPosts.where({ tabId: data?.id ?? 1 }).first(), [data?.id]);

  return (
    <section className="px-4">
      <DrawerHeader className="text-left px-0">
        <div className="flex gap-2">
          <Avatar>
            <AvatarImage src={xpost?.avatar} alt="@shadcn" />
            <AvatarFallback>X</AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1">
            <div className="flex gap-1 items-center">
              <a
                href={`https://x.com/${xpost?.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold">
                {xpost?.profileName}
              </a>
              <div className="text-blue-500">
                <CheckCircle2Icon size={18} />
              </div>
            </div>

            <a
              href={`https://x.com/${xpost?.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300">
              @{xpost?.handle}
            </a>
          </div>
        </div>
      </DrawerHeader>

      <div className="mb-4">
        {data && data?.description.length > 400 ? (
          <ScrollArea className="clickable h-[200px] w-full rounded-md border p-2 text-base select-text">
            {data?.description}
          </ScrollArea>
        ) : (
          <p className="clickable text-base select-text">{data?.description}</p>
        )}
      </div>

      <div className={cn('flex gap-2', xpost && xpost.photos && xpost?.photos?.length > 0 ? 'mb-1 h-16' : 'h-0')}>
        {xpost?.photos && xpost?.photos?.length > 0
          ? xpost.photos.map(pic => {
              const fullSizeUrl = removeQueryParams(pic, ['name']); // Remove the 'name' query param

              return (
                <a key={pic} href={pic} target="_blank" rel="noopener noreferrer" className="">
                  <img
                    className="clickable size-16 object-cover border-gray-300/20 rounded-lg animate-fadeIn fade-in-40"
                    src={pic}
                    alt=""
                  />
                </a>
              );
            })
          : null}
      </div>

      <div className={cn('flex gap-2', xpost && xpost.videos && xpost?.videos?.length > 0 ? 'mb-1 h-16' : 'h-0')}>
        {xpost?.videos && xpost?.videos?.length > 0
          ? xpost.videos.map(pic => {
              return (
                <a key={pic} href={pic} target="_blank" rel="noopener noreferrer" className="">
                  <img
                    className="clickable size-16 object-cover border-gray-300/20 rounded-lg animate-fadeIn fade-in-40"
                    src={pic}
                    alt=""
                  />
                </a>
              );
            })
          : null}
      </div>

      <pre className="hidden">{JSON.stringify(xpost, null, 4)}</pre>
    </section>
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
