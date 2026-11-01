import { useState } from 'react';
import { useAtom } from 'jotai';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@extension/ui';
import { db } from '@extension/storage';
import type { DexieTab } from '@extension/storage';
import { duplicateItemAtom } from '../utils';

/**
 * "Duplicate item to" dialog. The sidebar is too narrow for nested menus, so the target is picked here instead:
 * a list of categories, and under the chosen category its sub folders (or "No sub folder").
 * Open it by setting `duplicateItemAtom` to the item.
 */
export function DuplicateDialog() {
  const [item, setItem] = useAtom(duplicateItemAtom);

  return (
    <Dialog open={!!item} onOpenChange={open => !open && setItem(null)}>
      {item && <DuplicateForm item={item} onDone={() => setItem(null)} />}
    </Dialog>
  );
}

function DuplicateForm({ item, onDone }: { item: DexieTab; onDone: () => void }) {
  const categories = useLiveQuery(() => db.categories.toArray(), []);
  const subCategories = useLiveQuery(() => db.subCategories.toArray(), []);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  // undefined = no sub folder
  const [subCategoryId, setSubCategoryId] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const isCurrentLocation = (catId: number, subId?: number) =>
    item.categoryId === catId && item.subCategoryId === subId;

  const subsOf = (catId: number) =>
    (subCategories ?? []).filter(sub => sub.categoryId === catId).sort((a, b) => a.name.localeCompare(b.name));

  const alreadyThere = categoryId !== undefined && isCurrentLocation(categoryId, subCategoryId);
  const canDuplicate = categoryId !== undefined && !alreadyThere && !saving;

  const selectCategory = (id: number) => {
    if (id === categoryId) return;
    setCategoryId(id);
    setSubCategoryId(undefined);
    setError(undefined);
  };

  const duplicate = async () => {
    if (item.id === undefined || categoryId === undefined) return;
    setSaving(true);
    setError(undefined);
    try {
      await db.duplicateItem(item.id, { categoryId, subCategoryId });
      onDone();
    } catch (e) {
      console.error('Error duplicating item:', e);
      setError('Failed to duplicate the item. Please try again.');
      setSaving(false);
    }
  };

  return (
    <DialogContent className="flex max-h-[85vh] w-[calc(100%-1.5rem)] max-w-sm flex-col gap-3 p-4">
      <DialogHeader className="pr-6 text-left">
        <DialogTitle className="text-base">Duplicate item to</DialogTitle>
        <DialogDescription className="truncate" title={item.title}>
          {item.title}
        </DialogDescription>
      </DialogHeader>

      <div className="-mx-1 min-h-0 grow overflow-y-auto px-1">
        {categories === undefined && <p className="p-2 text-sm text-zinc-400">Loading...</p>}
        {categories?.length === 0 && <p className="p-2 text-sm text-zinc-400">No categories yet.</p>}
        {categories?.map(category => {
          if (category.id === undefined) return null;
          const id = category.id;
          const selected = id === categoryId;
          const subs = subsOf(id);

          return (
            <div key={id} className="mb-1.5">
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm',
                  selected ? 'border-blue-500/60 bg-blue-500/10' : 'border-zinc-300/20 hover:bg-zinc-100/5',
                )}>
                <input type="radio" name="duplicate-category" checked={selected} onChange={() => selectCategory(id)} />
                <span className="min-w-0 grow truncate font-medium" title={category.category}>
                  {category.category}
                </span>
                {id === item.categoryId && <span className="shrink-0 text-xs text-zinc-400">current</span>}
              </label>

              {selected && subs.length > 0 && (
                <div className="ml-4 mt-1 border-l border-zinc-300/20 pl-2">
                  <SubOption
                    checked={subCategoryId === undefined}
                    onSelect={() => setSubCategoryId(undefined)}
                    label="No sub folder"
                    muted
                    current={isCurrentLocation(id, undefined)}
                  />
                  {subs.map(sub => (
                    <SubOption
                      key={sub.id}
                      checked={subCategoryId === sub.id}
                      onSelect={() => setSubCategoryId(sub.id)}
                      label={sub.name}
                      current={isCurrentLocation(id, sub.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {alreadyThere && <p className="text-xs text-amber-400">The item is already in this location.</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}

      <DialogFooter className="flex-row gap-2 space-x-0">
        <Button size="sm" variant="outline" className="shrink" disabled={saving} onClick={onDone}>
          Cancel
        </Button>
        <Button size="sm" className="w-full grow" disabled={!canDuplicate} onClick={duplicate}>
          {saving ? 'Duplicating...' : 'Duplicate'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function SubOption({
  checked,
  onSelect,
  label,
  muted,
  current,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  muted?: boolean;
  current?: boolean;
}) {
  return (
    <label
      className={cn(
        'mb-1 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm',
        checked ? 'bg-blue-500/10' : 'hover:bg-zinc-100/5',
      )}>
      <input type="radio" name="duplicate-sub-category" checked={checked} onChange={onSelect} />
      <span className={cn('min-w-0 grow truncate', muted && 'italic text-zinc-400')} title={label}>
        {label}
      </span>
      {current && <span className="shrink-0 text-xs text-zinc-400">current</span>}
    </label>
  );
}
