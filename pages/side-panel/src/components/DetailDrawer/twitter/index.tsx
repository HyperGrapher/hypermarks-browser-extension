import { Avatar, AvatarFallback, AvatarImage } from '@extension/ui';
import { Button, cn, Input, Label, DropdownSelect, NoteInput, ScrollArea } from '@extension/ui';
import { useAtom, useSetAtom } from 'jotai';
import { dexieDrawerAtom } from '../../../utils';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@extension/ui';
import { db, DexieTab } from '@extension/storage';
import { useLiveQuery } from 'dexie-react-hooks';
import { DexieItemAndCategory, removeQueryParams, tagsAtom } from '@extension/shared';
import { useEffect, useState } from 'react';
import { TagsForm } from '../../tags/TagsForm';
import XTextContent from './XTextContent';
import TweetPhotos from './TweetPhotos';
import TweetVideoThumbs from './TweetVideoThumbs';
import TweetProfile from './TweetProfile';
import TweetStats from './TweetStats';

export function XPostDetail({ item }: { item: DexieTab }) {
  const xpost = useLiveQuery(async () => await db.xPosts.where({ tabId: item?.id ?? 1 }).first(), [item?.id]);

  return (
    <section className="px-4">
      <DrawerHeader className="text-left px-0">
        <DrawerTitle className="sr-only hidden">{item.description}</DrawerTitle>
        <TweetProfile
          isPremium={xpost?.isPremium ?? false}
          avatar={xpost?.avatar ?? ''}
          handle={xpost?.handle ?? ''}
          profileName={xpost?.profileName ?? ''}
        />
      </DrawerHeader>

      <XTextContent className="mb-4" description={xpost?.content} />

      <TweetPhotos photos={xpost?.photos} />
      <TweetVideoThumbs videos={xpost?.videos} />
      <TweetStats item={xpost} />

      <pre className="hidden">{JSON.stringify(xpost, null, 4)}</pre>
    </section>
  );
}
