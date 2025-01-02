import { cn } from '@/lib/utils';
import type { SelectProps } from '@radix-ui/react-select';
import React from 'react';
import { Button } from './ui/button';

const NoteInput = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'note-input',
          'focus:bg-slate-800/50 bg-slate-900/50 outline outline-zinc-300/30 outline-1 placeholder:text-sm',
          'placeholder:text-zinc-500 border-0 text-sm',
        )}
        placeholder="Type to add a note... (optional)"
        autoCorrect="off"
        spellCheck="false"
        ref={ref}
        {...props}
      />
    );
  },
);

NoteInput.displayName = 'Textarea';

export { NoteInput };

// export function NoteInputEx() {
//   return (
//     <div className="my-2">
//       <textarea
//         className={cn(
//           'note-input',
//           'focus:bg-slate-800/50 bg-slate-900/50 outline outline-zinc-300/30 outline-1 placeholder:text-sm',
//           'placeholder:text-zinc-500 border-0 text-sm',
//         )}
//         placeholder="Type to add a note... (optional)"
//         autoCorrect="off"
//         spellCheck="false"
//       />
//     </div>
//   );
// }
