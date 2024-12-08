import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SelectProps } from '@radix-ui/react-select';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverAnchor } from './ui/popover';

type ItemType = string;

interface ItemSelectProps extends Omit<SelectProps, 'onValueChange'> {
  onValueChange?: (value: string) => void;
  onItemSelect?: (item: ItemType) => void;
  setNewCategory?: () => void;
  newItem?: string;
  name: string;
  placeholder?: string;
  variant?: 'default' | 'small';
  valid?: boolean;
  items: {
    [category: string]: any[];
  };
}

const DropdownSelect = React.forwardRef<HTMLButtonElement, ItemSelectProps>(
  (
    {
      value,
      onValueChange,
      onItemSelect,
      setNewCategory,
      items,
      name,
      newItem,
      placeholder = 'Select item',
      variant = 'default',
      valid = true,
      ...props
    },
    ref,
  ) => {
    const [selectedItem, setSelectedItem] = React.useState<ItemType | null>(null);

    let uniqueItems = Object.entries(items).flatMap(([category, allitems]) => category);

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

        <SelectContent id="category-content" className="max-h-[250px] overflow-y-auto xrelative" position="popper">
          <div className="px-2 text-sm w-full pb-1">
            <Button onClick={setNewCategory} size={'sm'} className="w-full" variant={'ghost'}>
              Add new category
            </Button>
          </div>

          <SelectGroup>
            {uniqueItems.map(item => (
              <SelectItem key={item} value={item || ''}>
                <div className="flex items-center w-full gap-2">
                  <span className="text-sm text-muted-foreground text-left">{item}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    ) : null;
  },
);

DropdownSelect.displayName = 'DropdownSelect';

export { DropdownSelect };
