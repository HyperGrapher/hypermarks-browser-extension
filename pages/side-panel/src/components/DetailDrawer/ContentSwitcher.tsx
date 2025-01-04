import { DexieItemType, DexieTab } from '@extension/storage';
import React from 'react';
import { XPostDetail, XProfileDetail } from './twitter';

// Type for all possible item types

const GithubRepoDetail = ({ item }: { item: DexieTab }) => {
  return <div>GithubRepoDetail</div>;
};

const SoundcloudTrackDetail = ({ item }: { item: DexieTab }) => {
  return <div>SoundcloudTrackDetail</div>;
};

const DefaultComponent = ({ item }: { item: DexieTab }) => {
  return <div>ContentSwitcher</div>;
};

type DetailComponent = React.ComponentType<{ item: DexieTab }>;

// Create component dictionary type that enforces all DexieItemTypes must be handled
type ComponentDictionary = {
  [K in Exclude<DexieItemType, undefined>]: DetailComponent;
};

// Component implementations.
const components: Partial<ComponentDictionary> = {
  'x-post': XPostDetail,
  'x-profile': XProfileDetail,
  'github-repo': GithubRepoDetail,
  'soundcloud-track': SoundcloudTrackDetail,
  // Add other components as they're implemented...
};

interface ContentSwitcherProps {
  item: DexieTab;
}

const ContentSwitcher: React.FC<ContentSwitcherProps> = ({ item }) => {
  if (!item.itemType) {
    return <div className="h-32 text-red-500">No item type provided</div>;
  }

  const Component = components[item.itemType];

  if (!Component) {
    // You can customize this fallback behavior
    return <DefaultComponent item={item} />;
  }

  return <Component item={item} />;
};

export { ContentSwitcher, type ComponentDictionary };
