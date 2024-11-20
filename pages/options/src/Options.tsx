import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { Button } from '@extension/ui';

// const GEMINI_API_KEY = "hellalalal";// process.env.GEMINI_API_KEY;

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = isLight ? 'options/logo_horizontal.svg' : 'options/logo_horizontal_dark.svg';
  const goGithubSite = () =>
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  return (
    <div className={`App dark`}>
      <p>
        Edit <code>pages/options/src/Options.tsx</code>
      </p>
      <Button variant="default">ShadCN Button</Button>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <div> Loading ... </div>), <div> Error Occur </div>);

// <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
