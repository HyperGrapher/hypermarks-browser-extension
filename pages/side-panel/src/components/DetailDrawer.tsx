import { Button, cn, Input, Label } from '@extension/ui';
import { useAtom } from 'jotai';
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
import { DexieItemAndCategory } from '@extension/shared';

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
        {drawer.edit ? <ProfileForm className="px-4" /> : <ItemDisplay data={tab} category={cat} />}
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

function ProfileForm({ className }: React.ComponentProps<'form'>) {
  return (
    <form className={cn('grid items-start gap-4', className)}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" defaultValue="shadcn@example.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" defaultValue="@shadcn" />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );
}
