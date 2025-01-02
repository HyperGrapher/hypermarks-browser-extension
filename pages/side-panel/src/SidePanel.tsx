import '@src/SidePanel.css';
import type { CategorizedTab, ItemAndCategoty, SingleTab } from '@extension/shared';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { useEffect, useState } from 'react';
import { Button, cn, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger, DropdownSelect } from '@extension/ui';
import { YoutubePlaylist, YoutubeVideo, YoutubeChannel } from './YoutubeTab';
import { GenericTab, XPostItem } from './GenericTab';
import { GenericTab as DexieGeneric } from './items/GenericTab';
import { DetailDrawer as DexieDetailDrawer } from './components/DetailDrawer';
import { useAtom } from 'jotai';
import { searchTagsAtom, drawerAtom } from './utils';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@extension/ui';
import { db, autoPrefsStorage, tabsGroupedStorage } from '@extension/storage';
import { useLiveQuery } from 'dexie-react-hooks';
import LoadingScreen from './components/LoadingScreen';
import { TweetCard } from './items/TweetCard';

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

// TODO: This sidepanel needs some width space to show all the content it has
// https://groups.google.com/a/chromium.org/g/chromium-extensions/c/cJmdMLmpbjg
const SidePanel = () => {
  const autoPrefs = useStorage(autoPrefsStorage);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'all' | 'search'>(autoPrefs.lastPanel ?? 'all');
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; category: string }>(autoPrefs.lastCategory); // default comes from userPrefs
  const categories = useLiveQuery(async () => await db.categories?.toArray(), []);

  // Disable right clicking on sidepanel except allowed elements
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      // Allow right-click on elements with given class
      if ((event.target as HTMLElement)?.classList.contains('clickable')) {
        return;
      }
      event.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    autoPrefsStorage.saveLastCategory(selectedCategory);
    console.log('y', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (categories) {
      const noItemLeftInCategory = categories?.filter(x => x.category === selectedCategory.category).length === 0;
      console.log({ wewe: noItemLeftInCategory, len: categories?.length });

      if (categories?.length === 1 || noItemLeftInCategory) {
        // After deletion of an item, if there is only one category or no item left in the selected category
        // assign the first category in the DB
        if (categories.length > 0)
          setSelectedCategory({ id: categories?.[0].id ?? 0, category: categories?.[0].category ?? '' });
      }
    }
  }, [categories]);

  const tabs = useLiveQuery(async () => {
    const query = await db.tabs.where({ categoryId: selectedCategory?.id || categories?.[0].id || 1 }).toArray();
    await new Promise(resolve => setTimeout(resolve, 200));
    return query;
  }, [selectedCategory, categories]);

  if (!tabs) return <div className="bg-slate-900/90 h-screen w-full" />;
  if (tabs && tabs.length === 0) return <EmptyView />;

  return (
    <div className={``}>
      <header className={`h-8 w-full px-2 py-1 hidden`}>Settings</header>
      {isLoaded && (
        <Tabs defaultValue={activeTab ?? 'all'} className="w-full px-2 pl-2 mt-3">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger
              onClick={() => {
                setActiveTab('categories');
                autoPrefsStorage.saveLastPanel('categories');
              }}
              value="categories">
              Categories
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                setActiveTab('all');
                autoPrefsStorage.saveLastPanel('all');
              }}
              value="all">
              All
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                setActiveTab('search');
                autoPrefsStorage.saveLastPanel('search');
              }}
              value="search">
              Search
            </TabsTrigger>
          </TabsList>
          <TabsContent value="categories" className="">
            <div className="py-4">options</div>

            <DropdownSelect
              role="sidepanel"
              items={categories?.map(x => x.category) ?? []}
              value={selectedCategory?.category}
              onItemSelect={val =>
                setSelectedCategory({ category: val, id: categories?.find(x => x.category === val)?.id ?? 0 })
              }
              name="categories"
              placeholder="Select category"
              variant="default"
              valid={true}
            />
            {activeTab === 'categories' && (
              <div className="mt-2 space-y-1 animate-fadeIn">
                {tabs?.map(tab => {
                  if (tab.itemType === 'x-post') {
                    return <TweetCard key={tab.id} item={tab} />;
                  }
                  return <DexieGeneric key={tab.id} item={tab} />;
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value="all">
            <div className="py-4">options</div>

            {activeTab === 'all' && <AllSavedTabs />}
          </TabsContent>
          <TabsContent value="search">
            {activeTab === 'search' && (
              <div className="mt-2 space-y-1  animate-fadeIn">
                <div className="mt-8">
                  {/* <h1 className="text-3xl font-bold text-center">No Tabs Saved Yet!</h1> */}
                  <h1 className="text-3xl font-bold text-center py-4">Search not available</h1>
                  <p className="text-center text-slate-400">Click on the extension icon to save tabs</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
      {!isLoaded && <LoadingScreen onLoaded={() => setIsLoaded(true)} />}
      <DexieDetailDrawer />
    </div>
  );
};

function AllSavedTabs() {
  const tabs = useLiveQuery(async () => {
    const query = await db.tabs.reverse().toArray();
    await new Promise(resolve => setTimeout(resolve, 50));
    return query;
  }, []);

  return (
    <div className="mt-2 space-y-1 animate-fadeIn">
      <div className="space-y-1">
        {tabs?.map(tab => {
          if (tab.itemType === 'x-post') {
            return <TweetCard key={tab.id} item={tab} />;
          }
          return <DexieGeneric key={tab.id} item={tab} />;
        })}
      </div>
    </div>
  );
}

const SidePanelex = () => {
  const tabsWithCategories = useStorage(tabsGroupedStorage);

  return (
    <div className={``}>
      <header className={`App-header`}>
        <div className="hidden h-12 w-full bg-zinc-800">
          {/* <pre>{JSON.stringify(tabsWithCategories, null, 1)}</pre> */}
        </div>
        <div className="px-2 py-4">
          {Object.getOwnPropertyNames(tabsWithCategories).length === 0 ? (
            <EmptyView />
          ) : (
            <TabList groupedTabs={tabsWithCategories} />
          )}
        </div>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);

function EmptyView() {
  return (
    <div className="mt-4">
      <h1 className="text-3xl font-bold text-center">No Tabs Saved Yet!</h1>
      <p className="text-center text-slate-400">Click on the extension icon to save tabs</p>

      <div className="mt-6">
        {/* TODO: google.com uzerinde extension acikken caps alinacak */}
        {/* <img src={chrome.runtime.getURL('side-panel/nop.svg')} alt="" /> */}
      </div>
    </div>
  );
}

function TabList({ groupedTabs }: { groupedTabs: { [category: string]: SingleTab[] } }) {
  const [view, setView] = useState<'categories' | 'chronological' | 'tags'>('categories');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTags, setSearchTags] = useAtom(searchTagsAtom);

  // TODO: Zoom factor

  useEffect(() => {
    console.log(searchTags);
    if (searchTags.length > 0) {
      setView('tags');
      setSelectedTags(searchTags);
    } else setView('categories');
  }, [searchTags]);

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
    <div className="">
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
        <div className="mt-4 flex gap-2 text-xs/3 text-slate-400">
          <input
            type="text"
            placeholder="Enter tags (comma-separated)"
            className="bg-gray-700 p-2 text-white"
            onChange={e => setSelectedTags(e.target.value.split(',').map(tag => tag.trim()))}
          />
          <Button onClick={() => setSearchTags([])}>Clear</Button>
        </div>
      )}

      {/* Render Tabs */}
      {Object.keys(tabsToDisplay).length === 0 ? (
        <EmptyView />
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
              ) : item.itemType === 'yt-shorts' ? (
                <YoutubeVideo key={item.datetime} item={item} />
              ) : item.itemType === 'yt-playlist' ? (
                <YoutubePlaylist key={item.datetime} item={item} />
              ) : item.itemType === 'yt-channel' ? (
                <YoutubeChannel key={item.datetime} item={item} />
              ) : item.itemType === 'x-post' ? (
                <XPostItem key={item.datetime} item={item} />
              ) : (
                <GenericTab key={item.datetime} item={item} />
              ),
            )}
          </div>
        ))
      )}
      <DetailDrawer />
    </div>
  );
}

function DetailDrawer() {
  const [drawer, setDrawer] = useAtom(drawerAtom);
  const [item, setItem] = useState<{ item: SingleTab; category: string } | null>(null);
  tabsGroupedStorage.getByIdWithCategory(drawer.item?.datetime ?? '').then(val => setItem(val));

  return (
    <Drawer open={drawer.open} onOpenChange={val => setDrawer({ item: drawer.item, open: val, edit: false })}>
      <DrawerContent className="bg-grad">
        <DrawerHeader className="text-left">
          <DrawerTitle>{drawer.item?.title}</DrawerTitle>
          <DrawerDescription>{item?.item.description}</DrawerDescription>
        </DrawerHeader>
        {drawer.edit ? <ProfileForm className="px-4" /> : <ItemDisplay data={item} />}
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ItemDisplay({ data }: { data: ItemAndCategoty | null }) {
  return (
    <div className="">
      <pre className="text-xs">{JSON.stringify(data, null, 4)}</pre>
    </div>
  );
}

function ProfileForm({ className }: React.ComponentProps<'form'>) {
  return (
    <form className={cn('grid items-start gap-4', className)}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" defaultValue="shadcn@example.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" defaultValue="@shadcn" />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
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
