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
import { Calendar, Link as LinkIcon, MapPin, Cake, BadgeCheck, Users } from 'lucide-react';
import ItemNote from '../ItemNote';

export function XPostDetail({ item }: { item: DexieTab }) {
  const xpost = useLiveQuery(async () => await db.x_posts.where({ markId: item?.id ?? 1 }).first(), [item?.id]);

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
      <ItemNote className="mb-4" note={item?.note} />

      <pre className="hidden">{JSON.stringify(xpost, null, 4)}</pre>
    </section>
  );
}

export function XProfileDetail({ item }: { item: DexieTab }) {
  const profile = useLiveQuery(async () => await db.x_profiles.where({ markId: item?.id ?? 1 }).first(), [item?.id]);

  return (
    <div className="w-full rounded-lg xbg-black text-white">
      {/* Header Image */}
      <div className="relative h-32 w-full">
        <img src={profile?.header} alt="Profile header" className="h-full w-full rounded-t-lg object-cover" />
      </div>

      {/* Profile Section */}
      <div className="relative px-4 pb-4">
        {/* Avatar */}
        <div className="absolute -top-12 left-4">
          <img
            src={profile?.avatar}
            alt={profile?.username}
            className="h-24 w-24 rounded-full border-4 border-black object-cover"
          />
        </div>

        {/* Follow Button */}
        <div className="flex justify-end pt-3">
          <button
            className={`rounded-full px-4 py-1.5 font-bold ${
              profile?.isFollowing
                ? 'border border-gray-600 bg-transparent hover:border-red-500 hover:text-red-500'
                : 'bg-white text-black hover:bg-gray-200'
            }`}>
            {profile?.isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Name and Verification */}
        <div className="mt-2 flex items-center gap-1">
          <h1 className="text-xl font-bold">{profile?.username}</h1>
          {profile?.isPremium && <BadgeCheck className="h-5 w-5 text-blue-500" />}
        </div>
        <div className="text-gray-500">@{profile?.handle}</div>

        {/* Bio */}
        <p className="mt-3 whitespace-pre-wrap">{profile?.bio}</p>

        {/* Profile Info */}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
          {profile?.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{profile?.location}</span>
            </div>
          )}

          {profile?.website && (
            <div className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              <a
                href={profile?.website.startsWith('http') ? profile?.website : `https://${profile?.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline">
                {profile?.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {profile?.bday && (
            <div className="flex items-center gap-1">
              <Cake className="h-4 w-4" />
              <span>Born {profile?.bday}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Joined {profile?.joinedDateStr}</span>
          </div>
        </div>

        {/* Followers Info */}
        <div className="mt-3 flex gap-5">
          <div className="flex items-center gap-1">
            <span className="font-bold">{profile?.following.toLocaleString()}</span>
            <span className="text-gray-500">Following</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold">{profile?.followers.toLocaleString()}</span>
            <span className="text-gray-500">Followers</span>
          </div>
        </div>

        {/* Followed By */}
        {profile?.followedBy && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <Users className="h-4 w-4" />
            <span>{profile?.followedBy}</span>
          </div>
        )}
      </div>
    </div>
  );
}
