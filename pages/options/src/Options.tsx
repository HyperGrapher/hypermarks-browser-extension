import '@src/Options.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { Button } from '@extension/ui';

const Options = () => {
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
//  const goGithubSite = () => chrome.tabs.create({ url: 'https://' });
