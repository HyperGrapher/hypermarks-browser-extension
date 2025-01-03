import { ScrollArea } from '@extension/ui';

const XTextContent = ({ description, className }: { description: string | undefined; className: string }) => {
  if (!description) return null;

  return (
    <div className={className}>
      {description.length > 400 ? (
        <ScrollArea className="clickable h-[200px] w-full rounded-md border p-2 text-base select-text">
          {description}
        </ScrollArea>
      ) : (
        <p className="clickable text-base select-text">{description}</p>
      )}
    </div>
  );
};

export default XTextContent;
