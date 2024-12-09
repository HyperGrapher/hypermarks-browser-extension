import { TagItem } from '@extension/shared';
import { Badge, cn, Input, Popover, PopoverAnchor, PopoverContent } from '@extension/ui';
import { X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface SelectPillsProps {
  data: TagItem[];
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (selectedValues: string[]) => void;
  placeholder?: string;
}

export const SelectTags: React.FC<SelectPillsProps> = ({
  data,
  defaultValue = [],
  value,
  onValueChange,
  placeholder = 'Type to search...',
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [valueError, setValueError] = useState<string | null>(null);
  const [selectedPills, setSelectedPills] = useState<string[]>(value || defaultValue);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const radioGroupRef = useRef<HTMLDivElement>(null);

  let filteredItems = data.filter(
    item => item.name.toLowerCase().startsWith(inputValue.toLowerCase()) && !selectedPills.includes(item.name),
  );
  const isEqualValue = filteredItems.some(item => item.name === inputValue);
  inputValue && !isEqualValue && filteredItems.push({ name: inputValue, value: undefined });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    if (newValue.length >= 15) {
      setIsOpen(false);
      setValueError('Tag name is too long');
      return;
    }
    setValueError(null);
    setInputValue(newValue);
    setHighlightedIndex(-1);
    setIsOpen(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (isOpen && filteredItems.length > 0) {
          // Move focus to first radio button
          const firstRadio = radioGroupRef.current?.querySelector('input[type="radio"]') as HTMLElement;
          firstRadio?.focus();
          setHighlightedIndex(0);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleRadioKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (index < filteredItems.length - 1) {
          setHighlightedIndex(index + 1);
          const nextItem = radioGroupRef.current?.querySelector(`div:nth-child(${index + 2})`) as HTMLElement;
          if (nextItem) {
            nextItem.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          setHighlightedIndex(index - 1);
          const prevItem = radioGroupRef.current?.querySelector(`div:nth-child(${index})`) as HTMLElement;
          if (prevItem) {
            prevItem.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        } else {
          inputRef.current?.focus();
          setHighlightedIndex(-1);
        }
        break;
      case 'Enter':
        e.preventDefault();
        handleItemSelect(filteredItems[index]);
        inputRef.current?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.focus();
        break;
    }
  };

  const handleItemSelect = (item: TagItem) => {
    if (!/^\w+$/.test(item.name)) {
      setIsOpen(false);
      setValueError('Only letters, numbers and underscores');
      console.log('Only letters, numbers and underscores');
      return;
    }

    const newSelectedPills = [...selectedPills, item.name];
    setSelectedPills(newSelectedPills);
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onValueChange) {
      onValueChange(newSelectedPills);
    }
  };

  const handlePillRemove = (pillToRemove: string) => {
    const newSelectedPills = selectedPills.filter(pill => pill !== pillToRemove);
    setSelectedPills(newSelectedPills);
    if (onValueChange) {
      onValueChange(newSelectedPills);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // Only allow external close events (like clicking outside)
    if (!open) {
      setIsOpen(false);
    }
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <div className="flex flex-wrap gap-2 min-h-12 w-full">
        <PopoverAnchor asChild>
          <Input
            ref={inputRef}
            type="text"
            className="w-full shadow-xl bg-slate-900/50 outline outline-zinc-300/30 outline-1 placeholder:text-sm placeholder:text-zinc-500 border-0 text-sm"
            value={inputValue}
            onClick={() => setIsOpen(true)}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
        </PopoverAnchor>

        {valueError && <p className="text-red-500 text-xs pt-1">{valueError}</p>}

        <section className="pb-4 flex flex-wrap gap-2 min-h-12 w-full">
          {(value || selectedPills).map(pill => (
            <Badge
              key={pill}
              variant="secondary"
              onClick={() => handlePillRemove(pill)}
              className="hover:cursor-pointer gap-1 group">
              {pill}
              <button
                onClick={() => handlePillRemove(pill)}
                className="appearance-none text-muted-foreground group-hover:text-foreground transition-colors">
                <X size={12} />
              </button>
            </Badge>
          ))}
        </section>
      </div>

      <PopoverContent
        className="border-zinc-700/70 text-zinc-200 shadow-lg rounded max-h-[200px] overflow-y-auto"
        onFocusOutside={e => {
          // Prevent closing if focus is in the input
          if (e.target === inputRef.current) {
            e.preventDefault();
          }
        }}
        onInteractOutside={e => {
          // Prevent closing if interaction is with the input
          if (e.target === inputRef.current) {
            e.preventDefault();
          }
        }}>
        <div
          ref={radioGroupRef}
          role="radiogroup"
          aria-label="Pill options"
          onKeyDown={e => handleRadioKeyDown(e, highlightedIndex)}>
          {filteredItems.map((item, index) => (
            <div
              key={item.name}
              className={cn(
                'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent/70 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
                highlightedIndex === index && 'bg-accent',
              )}>
              <input
                type="radio"
                id={`pill-${item.name}`}
                name="pill-selection"
                value={item.name}
                className="sr-only"
                checked={highlightedIndex === index}
                onChange={() => handleItemSelect(item)}
              />
              <label htmlFor={`pill-${item.name}`} className="flex justify-between items-center w-full cursor-pointer">
                <span className="font-medium text-sm text-muted-foreground text-left"> {item.name}</span>
                <span className="text-zinc-500 text-sm/3 pr-2"> {item.value ?? 'New tag'}</span>
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
