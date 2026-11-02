import '@src/SidePanel.css';
import type { CategorizedTab, ItemAndCategoty, SingleTab } from '@extension/shared';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { useEffect, useState } from 'react';
import { Button, cn, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger, DropdownSelect } from '@extension/ui';
import { YoutubePlaylist, YoutubeVideo, YoutubeChannel } from './YoutubeTab';
import { GenericTab, XPostItem } from './GenericTab';
import { DetailDrawer as DexieDetailDrawer } from './components/DetailDrawer/index';
import { DuplicateDialog } from './components/DuplicateDialog';
import { useAtom } from 'jotai';
import { searchTagsAtom, drawerAtom, sortMarks } from './utils';
import { SortSelect } from './components/SortSelect';
import { DeleteCategoryButton } from './components/DeleteCategoryButton';
import { MarkList } from './components/MarkList';
import type { DexieTab } from '@extension/storage';
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
import ExportImport from './components/export-import/ExportImport';

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
  // null = "All" (no sub category filter)
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const totalMarks = useLiveQuery(async () => await db.marks.count(), []);
  // The remembered selection can be stale (category ids change when data is imported), so it is matched by name
  // against the live categories and falls back to the first one.
  const currentCategory =
    categories?.find(c => c.id === selectedCategory?.id && c.category === selectedCategory?.category) ??
    categories?.find(c => c.category === selectedCategory?.category) ??
    categories?.[0];
  const effectiveCategoryId = currentCategory?.id ?? 1;
  const subCategories = useLiveQuery(
    async () => await db.subCategories.where({ categoryId: effectiveCategoryId }).toArray(),
    [effectiveCategoryId],
  );
  // Derived so a stale selection (other category, or its last item was deleted) falls back to "All"
  const activeSubCategoryId = subCategories?.find(s => s.id === selectedSubCategoryId)?.id ?? null;

  // Disable right clicking on sidepanel except allowed elements
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      // Allow right-click on elements with given class
      if ((event.target as HTMLElement)?.classList.contains('clickable')) {
        return;
      }
      event.preventDefault();
    };
    // TODO: Uncomment
    // document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    autoPrefsStorage.saveLastCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    // Keep the remembered selection in sync with the resolved one: covers a deleted category
    // (falls back to the first) and stale ids after an import.
    if (
      currentCategory?.id &&
      (currentCategory.id !== selectedCategory?.id || currentCategory.category !== selectedCategory?.category)
    ) {
      setSelectedCategory({ id: currentCategory.id, category: currentCategory.category });
    }
  }, [currentCategory?.id, currentCategory?.category]);

  const tabs = useLiveQuery(async () => {
    const inCategory = db.marks.where({ categoryId: effectiveCategoryId });
    const query = await (activeSubCategoryId === null
      ? inCategory.toArray()
      : inCategory.filter(mark => mark.subCategoryId === activeSubCategoryId).toArray());
    await new Promise(resolve => setTimeout(resolve, 200));
    return query;
  }, [effectiveCategoryId, categories, activeSubCategoryId]);

  // Kept here (not inside the All tab) so switching to All doesn't re-query and re-wait; the tab content is
  // unmounted when inactive, but this stays alive.
  const allMarks = useLiveQuery(async () => {
    const query = await db.marks.toArray();
    await new Promise(resolve => setTimeout(resolve, 50));
    return query;
  }, []);

  // Tab content is unmounted while inactive, so a scroll offset from the previous tab would otherwise carry over
  useEffect(() => {
    // The side panel scrolls the body, depending on the CSS it can also be the document element
    document.body.scrollTo({ top: 0 });
    document.scrollingElement?.scrollTo({ top: 0 });
  }, [activeTab]);

  // Defaults keep the order the tabs had before sorting existed (Categories: saved order, All: newest first)
  const categoriesSort = autoPrefs.categoriesSort ?? 'oldest';

  if (!tabs || totalMarks === undefined) return <div className="h-screen w-full" />;
  // Only when nothing is saved at all. An empty selected category must still show the tabs so the user can switch.
  if (totalMarks === 0) return <EmptyView />;

  return (
    <div className={``}>
      <header className={`h-8 w-full px-2 py-1 hidden`}>Settings</header>
      {isLoaded && (
        <Tabs defaultValue={activeTab ?? 'all'} className="w-full px-2 pl-2">
          {/* Stays in view while the list scrolls: the tabs and the options of the active tab */}
          <div className="sticky top-0 z-40 -mx-2 bg-slate-950/80 px-2 pb-2 pt-3 backdrop-blur-md">
            <TabsList className="grid grid-cols-3 bg-slate-800 z-50">
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
            {activeTab === 'categories' && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 grow">
                    <DropdownSelect
                      role="sidepanel"
                      items={categories?.map(x => x.category) ?? []}
                      value={currentCategory?.category ?? selectedCategory?.category}
                      onItemSelect={val =>
                        setSelectedCategory({ category: val, id: categories?.find(x => x.category === val)?.id ?? 0 })
                      }
                      name="categories"
                      placeholder="Select category"
                      variant="default"
                      valid={true}
                    />
                  </div>
                  <DeleteCategoryButton categoryId={currentCategory?.id} categoryName={currentCategory?.category} />
                </div>
                {subCategories && subCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Sub categories">
                    {[{ id: null, name: 'All' }, ...subCategories].map(sub => (
                      <button
                        key={sub.id ?? 'all'}
                        role="tab"
                        aria-selected={activeSubCategoryId === sub.id}
                        onClick={() => setSelectedSubCategoryId(sub.id ?? null)}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs outline outline-1 outline-zinc-300/30 transition-colors',
                          activeSubCategoryId === sub.id
                            ? 'bg-white/80 text-slate-900'
                            : 'bg-slate-900/50 text-zinc-300 hover:bg-slate-800',
                        )}>
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-2">
                  <SortSelect value={categoriesSort} onChange={sort => autoPrefsStorage.saveCategoriesSort(sort)} />
                </div>
              </div>
            )}
            {activeTab === 'all' && (
              <div className="mt-2">
                <SortSelect
                  value={autoPrefs.allSort ?? 'newest'}
                  onChange={sort => autoPrefsStorage.saveAllSort(sort)}
                />
              </div>
            )}
          </div>
          <TabsContent value="categories" className="">
            {activeTab === 'categories' && (
              <div className="mt-2 space-y-1 animate-listFadeIn">
                <MarkList
                  key={`${effectiveCategoryId}-${activeSubCategoryId}-${categoriesSort}`}
                  marks={sortMarks(tabs, categoriesSort)}
                />
              </div>
            )}
          </TabsContent>
          <TabsContent value="all">{activeTab === 'all' && <AllSavedTabs marks={allMarks} />}</TabsContent>
          <TabsContent value="search">
            {activeTab === 'search' && (
              <div className="mt-2 space-y-1 animate-listFadeIn">
                <div className="mt-8">
                  {/* <h1 className="text-3xl font-bold text-center">No Tabs Saved Yet!</h1> */}
                  <h1 className="text-3xl font-bold text-center py-4">Search not available</h1>
                  <p className="text-center text-slate-400">Click on the extension icon to save tabs</p>
                </div>
                <ExportImport />
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
      {!isLoaded && <LoadingScreen onLoaded={() => setIsLoaded(true)} />}
      <DexieDetailDrawer />
      <DuplicateDialog />
    </div>
  );
};

function AllSavedTabs({ marks }: { marks: DexieTab[] | undefined }) {
  const autoPrefs = useStorage(autoPrefsStorage);
  const allSort = autoPrefs.allSort ?? 'newest';

  return (
    <div className="mt-2 space-y-1 animate-listFadeIn">
      <div className="space-y-1">
        <MarkList key={allSort} marks={sortMarks(marks ?? [], allSort)} />
      </div>
    </div>
  );
}

const SidePanelex = () => {
  const tabsWithCategories = useStorage(tabsGroupedStorage);

  return (
    <div className={``}>
      <header className={`App-header`}>
        <div className="hidden h-12 w-full bg-zinc-800"></div>
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
        <ExportImport />
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
