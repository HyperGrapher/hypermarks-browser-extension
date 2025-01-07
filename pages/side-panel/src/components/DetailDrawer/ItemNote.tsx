import { cn, ScrollArea } from '@extension/ui';

const ItemNote = ({ note, className }: { note: string | undefined; className: string }) => {
  if (!note?.trim()) return null;

  return (
    <div className={cn('mt-4 border border-zinc-500/50 rounded-lg text-slate-400 bg-black/20 ', className)}>
      <label className="pl-2 text-slate-500 font-medium" htmlFor="">
        Note:
      </label>

      {note.length > 400 ? (
        <ScrollArea className="clickable h-[200px] w-full rounded-md border p-2 text-sm select-text">{note}</ScrollArea>
      ) : (
        <div className="p-2 rounded-lg">
          <p className="clickable text-sm select-text">{note}</p>
        </div>
      )}
    </div>
  );
};

export default ItemNote;
