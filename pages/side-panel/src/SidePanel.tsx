import '@src/SidePanel.css';
import { CategorizedTab, SingleTab, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { tabsGroupedStorage } from '@extension/storage';
import { useState } from 'react';
import { Button, cn } from '@extension/ui';
import { YoutubePlaylist, YoutubeVideo, YoutubeChannel } from './YoutubeTab';
import { GenericTab } from './GenericTab';

function getTabsByCategory(groupedTabs: { [category: string]: SingleTab[] }): CategorizedTab[] {
  return Object.entries(groupedTabs).flatMap(([category, items]) => items.map(item => ({ category, item })));
}

function getTabsChronologically(groupedTabs: { [category: string]: SingleTab[] }): CategorizedTab[] {
  return getTabsByCategory(groupedTabs)
    .sort((a, b) => new Date(a.item.datetime).getTime() - new Date(b.item.datetime).getTime())
    .reverse();
}

function getTabsByTags(groupedTabs: { [category: string]: SingleTab[] }, tags: string[]): CategorizedTab[] {
  return getTabsByCategory(groupedTabs).filter(tab => tags.every(tag => tab.item.tags.includes(tag)));
}

const SidePanel = () => {
  const tabsCats = useStorage(tabsGroupedStorage);

  return (
    <div className={`xbg-black/80 xmin-h-screen`}>
      <header className={`App-header`}>
        <div className="bg-zinc-800 w-full h-12 hidden">{/* <pre>{JSON.stringify(tabsCats, null, 1)}</pre> */}</div>
        <div className="App-content py-4 px-2">
          {/* <h3 className="text-lg font-semibold text-zinc-400">Saved Tabs</h3> */}
          <TabList groupedTabs={tabsCats} />
        </div>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);

function TabList({ groupedTabs }: { groupedTabs: { [category: string]: SingleTab[] } }) {
  const [view, setView] = useState<'categories' | 'chronological' | 'tags'>('categories');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Determine the tabs to display based on the selected view
  let tabsToDisplay: { [category: string]: SingleTab[] };

  if (!groupedTabs) {
    return <h2 className="text-red-500">No tebs saved yet!</h2>;
  }

  switch (view) {
    case 'chronological':
      tabsToDisplay = {
        All: getTabsChronologically(groupedTabs).map(tab => ({
          ...tab.item,
          category: tab.category,
        })),
      };
      break;
    case 'tags':
      tabsToDisplay = {
        Filtered: getTabsByTags(groupedTabs, selectedTags).map(tab => ({
          ...tab.item,
          category: tab.category,
        })),
      };
      break;
    default:
      tabsToDisplay = groupedTabs;
  }

  return (
    <div className="App-content">
      {/* View Switcher */}
      <div className="flex gap-4">
        <Button onClick={() => setView('categories')} variant="link">
          By Category
        </Button>
        <Button onClick={() => setView('chronological')} variant="link">
          Chronological
        </Button>
        <Button onClick={() => setView('tags')} variant="link">
          By Tags
        </Button>
      </div>

      {/* Tag Input for Filtering */}
      {view === 'tags' && (
        <div className="mt-4 text-xs/3 text-slate-400">
          <input
            type="text"
            placeholder="Enter tags (comma-separated)"
            className="bg-gray-700 p-2 text-white"
            onChange={e => setSelectedTags(e.target.value.split(',').map(tag => tag.trim()))}
          />
          <pre>{JSON.stringify(groupedTabs, null, 2)}</pre>
        </div>
      )}

      {/* Render Tabs */}
      {Object.keys(tabsToDisplay).length === 0 ? (
        <h3 className="text-red-500">No Saved Tabs</h3>
      ) : (
        Object.entries(tabsToDisplay).map(([category, items]) => (
          <div key={category} className="xmt-4 space-y-1">
            {/* Category Title */}
            <section
              className={cn(
                'mt-3 mb-0.5 px-4 rounded-md shadow-lg',
                'text-blue-200/80 bg-sky-800/30 border border-sky-600/30',
                'selection:bg-sky-600/80 selection:text-sky-300',
              )}>
              <h4 className="font-semibold ">{category}</h4>
            </section>
            {/* Items in the Category */}
            {items.map((item, index) =>
              item.itemType === 'yt-video' ? (
                <YoutubeVideo key={item.datetime} item={item} />
              ) : item.itemType === 'yt-playlist' ? (
                <YoutubePlaylist key={item.datetime} item={item} />
              ) : item.itemType === 'yt-channel' ? (
                <YoutubeChannel key={item.datetime} item={item} />
              ) : (
                <GenericTab key={item.datetime} item={item} />
              ),
            )}
          </div>
        ))
      )}
    </div>
  );
}

function TabList1({ groupedTabs }: { groupedTabs: { [category: string]: SingleTab[] } }) {
  const [view, setView] = useState<'categories' | 'chronological' | 'tags'>('categories');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  let tabsToDisplay: CategorizedTab[];

  switch (view) {
    case 'chronological':
      tabsToDisplay = getTabsChronologically(groupedTabs);
      break;
    case 'tags':
      tabsToDisplay = getTabsByTags(groupedTabs, selectedTags);
      break;
    default:
      tabsToDisplay = getTabsByCategory(groupedTabs);
  }

  return (
    <div className="App-content hidden">
      {/* View Switcher */}
      <div className="flex gap-4">
        <button onClick={() => setView('categories')} className="text-blue-500">
          By Category
        </button>
        <button onClick={() => setView('chronological')} className="text-blue-500">
          Chronological
        </button>
        <button onClick={() => setView('tags')} className="text-blue-500">
          By Tags
        </button>
      </div>

      {view === 'tags' && (
        <div className="mt-4 bg-red-500">
          {/* <input
            type="text"
            placeholder="Enter tags (comma-separated)"
            className="bg-gray-700 p-2 text-white"
            onChange={e => setSelectedTags(e.target.value.split(',').map(tag => tag.trim()))}
          /> */}

          <pre>{JSON.stringify(tabsToDisplay, null, 2)}</pre>
        </div>
      )}

      {tabsToDisplay.length === 0 ? (
        <h3 className="text-red-500">No Saved Tabs</h3>
      ) : (
        tabsToDisplay.map((tab, index) => (
          <div key={index} className="mt-2 border-b border-gray-700 text-xs">
            <div className="flex flex-row gap-2">
              <img src={tab.item.icon ?? ''} alt="icon" className="size-4" />
              <p className="truncate whitespace-nowrap font-semibold">
                {tab.item.title.slice(0, 25)} |<span className="text-red-500">{tab.category}</span>
              </p>
            </div>
            <p className="text-slate-500">{tab.item.description}</p>
          </div>
        ))
      )}
    </div>
  );
}
