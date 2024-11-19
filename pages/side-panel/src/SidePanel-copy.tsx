import '@src/SidePanel.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import type { ComponentPropsWithoutRef } from 'react';
import { useState, useEffect } from 'react';

const SidePanel = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = isLight ? 'side-panel/logo_vertical.svg' : 'side-panel/logo_vertical_dark.svg';
  const [pageInfoList, setPageInfoList] = useState([]);

  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.pageInfoList) {
        setPageInfoList(changes.pageInfoList.newValue || []);
      }
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);

    chrome.storage.local
      .get('pageInfoList')
      .then(result => setPageInfoList(result.pageInfoList || []))
      .catch(error => console.error('Error getting pageInfoList from storage:', error));

    return () => {
      chrome.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const goGithubSite = () =>
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  return (
    <div className={`App ${isLight ? 'bg-slate-800' : 'bg-gray-800'}`}>
      <header className={`App-header ${isLight ? 'text-gray-100' : 'text-gray-100'}`}>
        {/* <button onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button> */}

        <ToggleButton className="hidden">Toggle theme</ToggleButton>
        <div className="App-content">
          {/* display the pageInfoList in the extension's local storage  */}
          <h3 className="text-lg font-semibold">Saved Tabs</h3>
          {/* TODO:  if no icon, show default icon */}
          {/* img fallback to default icon if error */}

          {pageInfoList.map((pageInfo: any, index: number) => (
            <div key={index} className="border-b border-gray-700 text-xs mt-2">
              <div className="flex flex-row gap-2  xspace-y-2">
                <img src={pageInfo.icon ?? ''} alt="icon" className="w-4 h-4" />
                <p className="font-semibold whitespace-nowrap truncate">{pageInfo.title} </p>
              </div>
              <p className="text-slate-500"> {pageInfo.description} </p>
              {/* <p>{pageInfo.icon}</p> */}
            </div>
          ))}

          {/* <pre className="text-xs text-slate-400 whitespace-break-spaces">{JSON.stringify(pageInfoList, null, 2)}</pre> */}
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
