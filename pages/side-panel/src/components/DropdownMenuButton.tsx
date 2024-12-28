import { Delete, Edit, Eye } from 'lucide-react';
import { OpenAction, openTabByAction } from '@extension/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@extension/ui';
import { useAtom, useSetAtom } from 'jotai';
import { dexieDrawerAtom } from '../utils';
import { DexieTab } from '@extension/storage/lib/dexie/db';
import { db } from '@extension/storage';

export function DropdownMenuButton({ children, item }: { children: React.ReactNode; item: DexieTab }) {
  const setDrawer = useSetAtom(dexieDrawerAtom);

  function onOpenTab(action: OpenAction) {
    openTabByAction(item.url, action);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 -translate-x-3">
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-sm" onClick={() => onOpenTab('current-tab')}>
            <span>Open in current tab</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-sm" onClick={() => onOpenTab('new-tab')}>
            <span>Open in new tab</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-sm" onClick={() => onOpenTab('new-window')}>
            <span>Open in new window</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-sm" onClick={() => onOpenTab('incognito')}>
            <span>Open in incognito window</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              setTimeout(() => {
                setDrawer({ item, open: true, edit: false });
              }, 0);
            }}
            className="bg-green-600/15 rounded-md text-sm">
            <Eye />
            <span>Show details</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-sm"
            onClick={() => {
              setTimeout(() => {
                setDrawer({ item, open: true, edit: true });
              }, 0);
            }}>
            <Edit />
            <span>Edit item</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => await db.deleteItem(item.id, item.categoryId)}
          className="bg-red-600/15 rounded-md text-sm">
          <Delete />
          <span>Delete item</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
