import { db } from '@extension/storage';
import { Button, DropdownSelect, Input } from '@extension/ui';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';

type SubCategorySelectorProps = {
  /** Name of the selected main category. May not exist in the DB yet (new category). */
  category: string;
  /** Selected sub category name, '' when none is selected. */
  value: string;
  onChange: (subCategory: string) => void;
  /** Lets the parent hide the rest of the form while the "new sub category" input is open. */
  onCreatingChange: (creating: boolean) => void;
};

/**
 * Optional sub folder picker for the selected main category.
 * Sub categories are only written to the DB when the tab is saved.
 */
export const SubCategorySelector = ({ category, value, onChange, onCreatingChange }: SubCategorySelectorProps) => {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const existing =
    useLiveQuery(async () => {
      const parent = await db.categories.where('category').equals(category).first();
      if (!parent?.id) return [];
      const subs = await db.subCategories.where('categoryId').equals(parent.id).toArray();
      return subs.map(s => s.name);
    }, [category]) ?? [];

  // A freshly typed sub category isn't in the DB yet, keep it selectable
  const items = value && !existing.includes(value) ? [...existing, value] : existing;

  function setCreatingState(next: boolean) {
    setCreating(next);
    onCreatingChange(next);
  }

  function onCreate() {
    const name = draft.trim();
    if (name === '') return setError('Please enter a sub category name');
    if (name.length >= 30) return setError('Sub category name is too long');
    if (items.some(item => item.toLowerCase() === name.toLowerCase())) {
      return setError('Sub category name already exists');
    }

    onChange(name);
    setDraft('');
    setError(null);
    setCreatingState(false);
  }

  function onCancel() {
    setDraft('');
    setError(null);
    setCreatingState(false);
  }

  if (creating) {
    return (
      <section>
        <Input
          type="text"
          className="w-full bg-slate-900/50 text-sm outline outline-1 outline-zinc-300/30 placeholder:text-sm placeholder:text-zinc-500"
          value={draft}
          placeholder="Type sub category name"
          onChange={e => setDraft(e.target.value)}
        />
        <div className="mt-2 flex gap-2">
          <Button onClick={onCancel} size="sm" className="shrink" variant={'destructive'}>
            Cancel
          </Button>
          <Button onClick={onCreate} size="sm" className="w-full grow" variant={'default'}>
            Create Sub Category
          </Button>
        </div>
        {error && <p className="pt-1 text-xs text-red-500">{error}</p>}
      </section>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <DropdownSelect
          items={items}
          value={value}
          onItemSelect={onChange}
          setShowCreateCategory={() => setCreatingState(true)}
          createLabel="Create a new sub category"
          name="sub-categories"
          placeholder="Sub category (optional)"
          variant="default"
          valid={true}
        />
      </div>
      {value && (
        <Button onClick={() => onChange('')} size="sm" variant={'ghost'} title="Clear sub category">
          ✕
        </Button>
      )}
    </div>
  );
};
