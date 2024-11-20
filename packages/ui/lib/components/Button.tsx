import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../utils';
import { Button as ButtonCn } from './ui/button';

export type ButtonProps = {
  variant?: 'default' | 'destructive' | 'link' | 'secondary' | 'link' | 'outline';
} & ComponentPropsWithoutRef<'button'>;

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <ButtonCn className={cn(className)} {...props}>
      {children}
    </ButtonCn>
  );
}
