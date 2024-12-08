import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SelectProps } from '@radix-ui/react-select';
import { Input } from './ui/input';
import { Button } from './ui/button';

type ItemType = string | null | undefined; // (typeof tempCategories)[number];
export const tempCategories = [
  // 'General Programming',
  // 'Libraries',
  // 'Web Design and CSS',
  // 'Youtube',
  // 'Web',
  // 'Rust',
  // 'Javascript',
  // 'Python',
] as ItemType[];

interface ItemSelectProps extends Omit<SelectProps, 'onValueChange'> {
  onValueChange?: (value: string) => void;
  onItemSelect?: (item: ItemType) => void;
  setNewCategory?: () => void;
  newItem?: string;
  name: string;
  placeholder?: string;
  variant?: 'default' | 'small';
  valid?: boolean;
  isNewCategory?: boolean;
}

const DropdownSelect = React.forwardRef<HTMLButtonElement, ItemSelectProps>(
  (
    {
      value,
      onValueChange,
      onItemSelect,
      setNewCategory,
      name,
      newItem,
      placeholder = 'Select item',
      variant = 'default',
      valid = true,
      isNewCategory,
      ...props
    },
    ref,
  ) => {
    const [selectedItem, setSelectedItem] = React.useState<ItemType | null>(null);
    const [items, setItems] = React.useState<ItemType[] | null>(null);
    const [searchItem, setSearchItem] = React.useState<string>('');
    // const ref = React.useRef<HTMLDivElement>(null);

    let uniqueItems = tempCategories;

    useEffect(() => {
      if (ref) {
      }

      if (!isNewCategory) {
        // console.log('not valid');
      } else {
        // console.log('valid');
        // btn && btn.click()
      }
    }, [isNewCategory]);

    const handleValueChange = (newValue: string) => {
      const fullCategoryData = uniqueItems?.find(item => item === newValue);
      if (fullCategoryData) {
        setSelectedItem(fullCategoryData);
        if (onValueChange) {
          onValueChange(newValue);
        }
        if (onItemSelect) {
          onItemSelect(fullCategoryData);
        }
      }
    };

    void selectedItem;

    return valid ? (
      <Select value={value} onValueChange={handleValueChange} {...props} name={name} data-valid={valid}>
        <SelectTrigger
          id="dropdown-selecti"
          className={cn(
            'w-full bg-slate-900/50 outline outline-zinc-300/30 outline-1',
            variant === 'small' && 'w-fit gap-2',
          )}
          data-valid={valid}
          ref={ref}>
          {value && variant === 'small' ? (
            <SelectValue placeholder={placeholder}>
              <span>{value}</span>
            </SelectValue>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>

        <SelectContent /* ref={contentRef} */>
          <SelectGroup>
            {uniqueItems.map(item => (
              <SelectItem key={item} value={item || ''}>
                <div className="flex items-center w-full gap-2">
                  <span className="text-sm text-muted-foreground text-left">{item}</span>
                </div>
              </SelectItem>
            ))}

            <div className="py-1 px-2 text-sm w-full">
              <Button onClick={setNewCategory} className="w-full" variant={'ghost'}>
                Add new category {valid ? 'valid' : '(not)'}
              </Button>
            </div>
            {/* {uniqueItems?.length === 0 && (
            )}  */}
          </SelectGroup>
        </SelectContent>
      </Select>
    ) : null;
  },
);

DropdownSelect.displayName = 'DropdownSelect';

export { DropdownSelect };

/*

<div className="w-full py-2">
              <Input
                type="text"
                autoFocus
                className="w-full h-6 shadow-xl bg-slate-900/50 outline outline-zinc-300/30 outline-1 placeholder:text-sm placeholder:text-zinc-500 border-0 text-sm"
                value={searchItem}
                placeholder='Search or create new category'
                // onClick={() => setIsOpen(true)}
                onChange={(e) => setSearchItem(e.target.value)}
                // onKeyDown={handleKeyDown}
                // placeholder={placeholder} 
                />
            </div>

*/
