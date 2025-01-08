import { cn, searchTagsAtom } from '../utils';
import { openTab } from '@extension/shared';
import { Badge } from '@extension/ui';
// import TimeAgo from 'timeago-react';
import { MoreVertical } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { DropdownMenuButton } from '../components/DropdownMenuButton';
import { db, DexieTab } from '@extension/storage';
import ItemCard from '@src/components/ItemCard';
import TweetProfile from '@src/components/DetailDrawer/twitter/TweetProfile';
import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar, Link as LinkIcon, MapPin, Cake, BadgeCheck, Users } from 'lucide-react';

// Company verified profile with pfp to another account
// FIXME: gets affiliated profile's icon as header img
// https://x.com/BRICSinfo

// FIXME: Err: follower/following numbers are 0 / misplaced with followedBy
// https://x.com/AIandDesign

export const XProfileCard = ({ item }: { item: DexieTab }) => {
  const p = useLiveQuery(async () => await db.x_profiles.where({ mark_id: item.id }).first(), []);

  return (
    <ItemCard item={item}>
      <div className="ml-2">
        <TweetProfile
          isPremium={p?.isPremium ?? false}
          avatar={p?.avatar ?? ''}
          handle={p?.handle ?? ''}
          profileName={p?.username ?? ''}
        />
      </div>

      {/* <div className="z-20 flex w-full items-center gap-2 pl-2">
        <div className="w-full max-w-sm pr-2">
          <p className="wrap-text-anywhere line-clamp-5 text-xs/3 leading-3 text-slate-500">{item?.description}</p>
        </div>
      </div> */}
    </ItemCard>
  );
};
