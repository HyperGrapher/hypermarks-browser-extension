import {
  Cloud,
  CreditCard,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
  Delete,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@extension/ui';
import { Button } from '@extension/ui';
import { deleteTab } from '@extension/storage';
import { useAtom } from 'jotai';
import { drawerAtom } from './utils';
import type { CategorizedTab, SingleTab } from '@extension/shared';

export function DropdownMenuButton({
  children,
  item,
  //   setIsOpen,
}: {
  children: React.ReactNode;
  item: SingleTab;
  //   setIsOpen: (val: boolean) => void;
}) {
  const [drawer, setDrawer] = useAtom(drawerAtom);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* <Button variant="outline">Open</Button> */}
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 -translate-x-3">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Open in current tab</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Open in new tab</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Open in new window</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              setTimeout(() => {
                setDrawer({ item, open: true, edit: false });
              }, 100);
            }}
            className="bg-green-600/20 rounded-md">
            <Users />
            <span>Show details</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserPlus />
              <span>Invite users</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Mail />
                  <span>Programming and related</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare />
                  <span>Message</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <PlusCircle />
                  <span>More...</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <Plus />
            <span>New Team</span>
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LifeBuoy />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Cloud />
          <span>API</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => deleteTab(item.datetime)} className="bg-red-600/20 rounded-md">
          <Delete />
          <span>Delete item</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
