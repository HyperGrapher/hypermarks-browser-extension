import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@extension/ui';
import { db } from '@extension/storage';

/** Icon button that deletes a category together with all its items and sub folders, after a confirmation. */
export function DeleteCategoryButton({ categoryId, categoryName }: { categoryId?: number; categoryName?: string }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const itemCount = useLiveQuery(
    async () => (open && categoryId !== undefined ? await db.marks.where({ categoryId }).count() : undefined),
    [open, categoryId],
  );

  const onOpenChange = (next: boolean) => {
    if (deleting) return;
    setOpen(next);
    setError(undefined);
  };

  const confirmDelete = async () => {
    if (categoryId === undefined) return;
    setDeleting(true);
    setError(undefined);
    try {
      await db.deleteCategoryAndItems(categoryId);
      setOpen(false);
    } catch (e) {
      console.error('Error deleting category:', e);
      setError('Failed to delete the category. Nothing was deleted.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="size-9 shrink-0 text-red-400 hover:bg-red-600/15 hover:text-red-300"
        disabled={categoryId === undefined}
        title="Delete this category with all its items"
        aria-label="Delete this category with all its items"
        onClick={() => setOpen(true)}>
        <Trash2 className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-sm gap-3 p-4">
          <DialogHeader className="pr-6 text-left">
            <DialogTitle className="text-base">Delete category?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-zinc-200 break-words">{categoryName}</span> and{' '}
              {itemCount === undefined ? 'all' : itemCount === 1 ? 'its 1 item' : `all ${itemCount} items`} in it
              (including sub folders) will be permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <DialogFooter className="flex-row gap-2 space-x-0">
            <Button
              size="sm"
              variant="outline"
              className="shrink"
              disabled={deleting}
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="w-full grow"
              disabled={deleting || itemCount === undefined}
              onClick={confirmDelete}>
              {deleting ? 'Deleting...' : 'Delete category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
