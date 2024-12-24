import { Delete, Edit, Eye } from 'lucide-react';
import { OpenAction, openTabByAction, type SingleTab } from '@extension/shared';
import { deleteTab } from '@extension/storage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@extension/ui';
import { useAtom } from 'jotai';
import { drawerAtom } from './utils';

export function DropdownMenuButton({ children, item }: { children: React.ReactNode; item: SingleTab }) {
  const [, setDrawer] = useAtom(drawerAtom);

  function onOpenTab(action: OpenAction) {
    openTabByAction(item?.url ?? '', action);
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
        <DropdownMenuItem onClick={() => deleteTab(item.datetime)} className="bg-red-600/15 rounded-md text-sm">
          <Delete />
          <span>Delete item</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
