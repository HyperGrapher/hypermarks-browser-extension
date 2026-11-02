import { Copy, Delete, Edit, Eye, Star } from 'lucide-react';
import { OpenAction, openTabByAction } from '@extension/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FAVORITE_COLORS,
  cn,
} from '@extension/ui';
import { useAtom, useSetAtom } from 'jotai';
import { dexieDrawerAtom, duplicateItemAtom } from '../utils';
import { DexieTab, FavoriteColor } from '@extension/storage';
import { db } from '@extension/storage';

export function DropdownMenuButton({ children, item }: { children: React.ReactNode; item: DexieTab }) {
  const setDrawer = useSetAtom(dexieDrawerAtom);
  const setDuplicateItem = useSetAtom(duplicateItemAtom);

  function onOpenTab(action: OpenAction) {
    openTabByAction(item.url, action);
  }

  function onFavorite(favorite: FavoriteColor | undefined) {
    // `undefined` removes the property, i.e. the item is no longer a favorite
    if (item.id) db.marks.update(item.id, { favorite });
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

          <DropdownMenuItem
            className="text-sm"
            onClick={() => {
              // Let the menu finish closing first, otherwise it steals focus from the dialog
              setTimeout(() => {
                setDuplicateItem(item);
              }, 0);
            }}>
            <Copy />
            <span>Duplicate item to</span>
          </DropdownMenuItem>

          <div className="flex items-center gap-1 px-2 py-1.5 text-sm" role="group" aria-label="Favorite">
            <Star size={16} className={cn('mr-1 shrink-0', item.favorite && 'fill-current')} />
            <span className="mr-auto">Favorite</span>
            {FAVORITE_COLORS.map(color => (
              <DropdownMenuItem
                key={color.value}
                title={color.label}
                aria-label={color.label}
                aria-checked={item.favorite === color.value}
                // Picking the current color again clears it
                onClick={() => onFavorite(item.favorite === color.value ? undefined : color.value)}
                className="size-6 justify-center rounded-full p-0">
                <span
                  className={cn(
                    'size-4 rounded-full',
                    color.swatch,
                    item.favorite === color.value && 'ring-2 ring-zinc-200/80 ring-offset-1 ring-offset-slate-900',
                  )}
                />
              </DropdownMenuItem>
            ))}
            {item.favorite && (
              <DropdownMenuItem
                title="Remove from favorites"
                aria-label="Remove from favorites"
                onClick={() => onFavorite(undefined)}
                className="size-6 justify-center rounded-full p-0 text-xs text-zinc-400">
                ✕
              </DropdownMenuItem>
            )}
          </div>
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
