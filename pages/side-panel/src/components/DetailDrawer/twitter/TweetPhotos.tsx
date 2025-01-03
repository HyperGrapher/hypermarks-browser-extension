import { removeQueryParams } from '@extension/shared';
import { cn } from '@extension/ui';

const TweetPhotos = ({ photos }: { photos: string[] | undefined }) => {
  if (!photos || photos.length === 0) return;

  return (
    <div className={cn('flex gap-2 mb-1 h-16', photos?.length > 0 ? '' : '')}>
      {photos.map(pic => {
        const fullSizeUrl = removeQueryParams(pic, ['name']); // Remove the 'name' query param

        return (
          <a key={fullSizeUrl} href={fullSizeUrl} target="_blank" rel="noopener noreferrer" className="">
            <img
              className="clickable size-16 object-cover border-gray-300/20 rounded-lg animate-fadeIn fade-in-40"
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
