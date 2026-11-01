import { cn } from '@/lib/utils';
import type { SelectProps } from '@radix-ui/react-select';
import React from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ItemSelectProps extends Omit<SelectProps, 'onValueChange'> {
  onItemSelect?: (item: string) => void;
  setShowCreateCategory?: () => void;
  /** Label of the "create" button shown at the top of the popup variant */
  createLabel?: string;
  name: string;
  placeholder?: string;
  role?: string;
  variant?: 'default' | 'small';
  valid?: boolean;
  items: string[];
}

const DropdownSelect = React.forwardRef<HTMLButtonElement, ItemSelectProps>(
  (
    {
      value,
      onItemSelect,
      setShowCreateCategory,
      createLabel = 'Create a new category',
      items,
      name,
      placeholder = 'Select item',
      variant = 'default',
      valid = true,
      role = 'popup',
      ...props
    },
    ref,
  ) => {
    const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

    const handleValueChange = (newValue: string) => {
      const selection = items?.find(item => item === newValue);
      if (selection) {
        setSelectedItem(selection);
        if (onItemSelect) {
          onItemSelect(selection);
        }
      }
    };

    void selectedItem;

    return valid ? (
      <Select value={value} onValueChange={handleValueChange} {...props} name={name} data-valid={valid}>
        <SelectTrigger
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

        <SelectContent id="category-content" className="xrelative max-h-[250px] overflow-y-auto" position="popper">
          {role === 'popup' && (
            <div className="w-full px-2 py-1 text-sm">
              <Button onClick={setShowCreateCategory} size={'sm'} className="w-full" variant={'ghost'}>
                {createLabel}
              </Button>
            </div>
          )}

          <SelectGroup>
            {items.map(item => (
              <SelectItem key={item} value={item || ''}>
                <div className="flex w-full items-center gap-2">
                  <span className="text-muted-foreground text-left text-sm">{item}</span>
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
