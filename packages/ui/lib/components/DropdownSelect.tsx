import React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SelectProps } from '@radix-ui/react-select';

export const tempCategories = [
  'General Programming',
  'Libraries',
  'Web Design and CSS',
  'Youtube',
  'Web',
  'Rust',
  'Javascript',
  'Python',
];

type ItemType = (typeof tempCategories)[number];

interface ItemSelectProps extends Omit<SelectProps, 'onValueChange'> {
  onValueChange?: (value: string) => void;
  onItemSelect?: (item: ItemType) => void;
  name: string;
  placeholder?: string;
  variant?: 'default' | 'small';
  valid?: boolean;
}

const DropdownSelect = React.forwardRef<HTMLButtonElement, ItemSelectProps>(
  (
    {
      value,
      onValueChange,
      onItemSelect,
      name,
      placeholder = 'Select item',
      variant = 'default',
      valid = true,
      ...props
    },
    ref,
  ) => {
    const [selectedItem, setSelectedItem] = React.useState<ItemType | null>(null);

    const uniqueItems = tempCategories;

    const handleValueChange = (newValue: string) => {
      const fullCategoryData = uniqueItems.find(item => item === newValue);
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

    return (
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
        <SelectContent>
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
    );
  },
);

DropdownSelect.displayName = 'DropdownSelect';

export { DropdownSelect };
