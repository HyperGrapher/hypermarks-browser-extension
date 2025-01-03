import { Avatar, AvatarFallback, AvatarImage } from '@extension/ui';
import { CheckCircle2Icon } from 'lucide-react';

const TweetProfile = ({
  avatar,
  handle,
  profileName,
  isPremium,
}: {
  avatar: string;
  handle: string;
  profileName: string;
  isPremium: boolean;
}) => {
  return (
    <div className="flex gap-2">
      <Avatar>
        <AvatarImage src={avatar} alt="@shadcn" />
        <AvatarFallback>X</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1">
        <div className="flex gap-1 items-center">
          <a href={`https://x.com/${handle}`} target="_blank" rel="noopener noreferrer" className="font-bold">
            {profileName}
          </a>
          {isPremium && (
            <div className="text-blue-500">
              <CheckCircle2Icon size={18} />
            </div>
          )}
        </div>

        <a href={`https://x.com/${handle}`} target="_blank" rel="noopener noreferrer" className="text-gray-300">
          @{handle}
        </a>
      </div>
    </div>
  );
};

export default TweetProfile;
