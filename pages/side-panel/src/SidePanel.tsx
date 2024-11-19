import '@src/SidePanel.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import {
  exampleThemeStorage,
  tabsStorage,
  tabsGroupedStorage,
  type CategorizedTab,
  type SingleTab,
} from '@extension/storage';
import type { ComponentPropsWithoutRef } from 'react';
import { useState, useEffect } from 'react';

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
  const theme = useStorage(exampleThemeStorage);
  const tabs = useStorage(tabsStorage);
  const tabsCats = useStorage(tabsGroupedStorage);

  const isLight = theme === 'light';
  const logo = isLight ? 'side-panel/logo_vertical.svg' : 'side-panel/logo_vertical_dark.svg';
  // const [pageInfoList, setPageInfoList] = useState([]);

  // useEffect(() => {
  //   const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
  //     if (changes.pageInfoList) {
  //       setPageInfoList(changes.pageInfoList.newValue || []);
  //     }
  //   };

  //   chrome.storage.local.onChanged.addListener(handleStorageChange);

  //   chrome.storage.local
  //     .get('pageInfoList')
  //     .then(result => setPageInfoList(result.pageInfoList || []))
  //     .catch(error => console.error('Error getting pageInfoList from storage:', error));

  //   return () => {
  //     chrome.storage.local.onChanged.removeListener(handleStorageChange);
  //   };
  // }, []);

  const goGithubSite = () =>
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  return (
    <div className={`App ${isLight ? 'bg-slate-800' : 'bg-gray-800'}`}>
      <header className={`App-header ${isLight ? 'text-gray-100' : 'text-gray-100'}`}>
        {/* <button onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button> */}

        <ToggleButton className="hidden">Toggle theme</ToggleButton>
        <div className="App-content bg-slate-800">
          {/* display the pageInfoList in the extension's local storage  */}
          <h3 className="text-lg font-semibold">Saved Tabs</h3>

          <TabList groupedTabs={tabsCats} />

          {/* TODO:  if no icon, show default icon */}
          {/* img fallback to default icon if error */}
          {/*<pre className="text-xs text-slate-400 whitespace-break-spaces bg-slate-800">{JSON.stringify(tabs, null, 2)}</pre>*/}
        </div>
      </header>
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorage(exampleThemeStorage);
  return (
    <button
      className={
        props.className +
        ' ' +
        'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
        (theme === 'light' ? 'bg-white text-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);

function TabList({ groupedTabs }: { groupedTabs: { [category: string]: SingleTab[] } }) {
  const [view, setView] = useState<'categories' | 'chronological' | 'tags'>('categories');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Determine the tabs to display based on the selected view
  let tabsToDisplay: { [category: string]: SingleTab[] };

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
    <div className="App-content bg-slate-800">
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

      {/* Tag Input for Filtering */}
      {view === 'tags' && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter tags (comma-separated)"
            className="p-2 bg-gray-700 text-white"
            onChange={e => setSelectedTags(e.target.value.split(',').map(tag => tag.trim()))}
          />
        </div>
      )}

      {/* Render Tabs */}
      {Object.keys(tabsToDisplay).length === 0 ? (
        <h3 className="text-red-500">No Saved Tabs</h3>
      ) : (
        Object.entries(tabsToDisplay).map(([category, items]) => (
          <div key={category} className="mt-4">
            {/* Category Title */}
            <h4 className="text-xl font-semibold text-green-500">{category}</h4>
            {/* Items in the Category */}
            {items.map((item, index) => (
              <div key={index} className="border-b border-gray-700 text-xs mt-2">
                <div className="flex flex-row gap-2">
                  <img src={item.icon ?? ''} alt="icon" className="w-4 h-4" />
                  {/*<p className="font-semibold whitespace-nowrap truncate">{item.title.slice(0, 25)}</p>*/}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold xwhitespace-nowrap truncate">
                    {item.title}
                  </a>
                </div>
                <p className="text-slate-500">{item.description}</p>
              </div>
            ))}
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
    <div className="App-content bg-slate-800">
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
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter tags (comma-separated)"
            className="p-2 bg-gray-700 text-white"
            onChange={e => setSelectedTags(e.target.value.split(',').map(tag => tag.trim()))}
          />
        </div>
      )}

      {tabsToDisplay.length === 0 ? (
        <h3 className="text-red-500">No Saved Tabs</h3>
      ) : (
        tabsToDisplay.map((tab, index) => (
          <div key={index} className="border-b border-gray-700 text-xs mt-2">
            <div className="flex flex-row gap-2">
              <img src={tab.item.icon ?? ''} alt="icon" className="w-4 h-4" />
              <p className="font-semibold whitespace-nowrap truncate">
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
