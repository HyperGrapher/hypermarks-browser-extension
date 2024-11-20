import '@src/NewTab.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { Button } from '@extension/ui';
import { t } from '@extension/i18n';

const NewTab = () => {
  return (
    <div className={`App`}>
      <header className={``}>
        <p>
          Edit <code>pages/new-tab/src/NewTab.tsx</code>
        </p>
        <Button className="mt-4" variant="secondary">
          ShadCN Button
        </Button>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div>{t('loading')}</div>), <div> Error Occur </div>);
