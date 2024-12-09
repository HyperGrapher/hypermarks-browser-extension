import { cn } from '@/lib/utils';
import { SelectProps } from '@radix-ui/react-select';
import React from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ItemSelectProps extends Omit<SelectProps, 'onValueChange'> {
  onItemSelect?: (item: string) => void;
  setShowCreateCategory?: () => void;
  name: string;
  placeholder?: string;
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
      items,
      name,
      placeholder = 'Select item',
      variant = 'default',
      valid = true,
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

        <SelectContent id="category-content" className="max-h-[250px] overflow-y-auto xrelative" position="popper">
          <div className="px-2 text-sm w-full py-1">
            <Button onClick={setShowCreateCategory} size={'sm'} className="w-full" variant={'ghost'}>
              Create a new category
            </Button>
          </div>

          <SelectGroup>
            {items.map(item => (
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
