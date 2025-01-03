import { removeQueryParams } from '@extension/shared';
import { cn } from '@extension/ui';

const TweetPhotos = ({ photos }: { photos: string[] | undefined }) => {
  if (!photos || photos.length === 0) return;

  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((pic, idx) => {
        const fullSizeUrl = removeQueryParams(pic, ['name']); // Remove the 'name' query param
        const isLastOdd = idx === photos.length - 1 && photos.length % 2 === 1;

        return (
          <a
            key={fullSizeUrl}
            href={fullSizeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${isLastOdd ? 'col-span-2' : ''} block`}>
            <img
              className={cn(
                'clickable w-full rounded-lg border-gray-300/20 object-cover object-center transition-opacity hover:opacity-90  animate-fadeIn fade-in-80ch',
                {
                  'h-16 object-center': photos.length > 6,
                  'h-32': photos.length <= 6,
                },
              )}
              src={pic}
              alt=""
            />
          </a>
        );
      })}
    </div>
  );
};

export default TweetPhotos;
