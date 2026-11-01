import { db } from '@extension/storage';
import { SubCategoryPicker } from '@extension/ui';
import { useLiveQuery } from 'dexie-react-hooks';

type SubCategorySelectorProps = {
  /** Name of the selected main category. May not exist in the DB yet (new category). */
  category: string;
  /** Selected sub category name, '' when none is selected. */
  value: string;
  onChange: (subCategory: string) => void;
  /** Lets the parent hide the rest of the form while the "new sub category" input is open. */
  onCreatingChange: (creating: boolean) => void;
};

/** Optional sub folder picker for the selected main category (looked up by name, it may not exist yet). */
export const SubCategorySelector = ({ category, value, onChange, onCreatingChange }: SubCategorySelectorProps) => {
  const existing =
    useLiveQuery(async () => {
      const parent = await db.categories.where('category').equals(category).first();
      if (!parent?.id) return [];
      const subs = await db.subCategories.where('categoryId').equals(parent.id).toArray();
      return subs.map(s => s.name);
    }, [category]) ?? [];

  return (
    <SubCategoryPicker existing={existing} value={value} onChange={onChange} onCreatingChange={onCreatingChange} />
  );
};
