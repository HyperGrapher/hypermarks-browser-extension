import '@src/Popup.css';
import { deleteAllTabData, saveCurrentTab, withErrorBoundary, withSuspense } from '@extension/shared';
import { Button, PillsFormDemo } from '@extension/ui';

/*
 #* fikir su:
 #* alt categori olustur . belli basli siteler, ozellikle dedicated data/ui'i olan
 #* 
 */

/*
  eski: https://img.youtube.com/vi/2fSBLH-ISaE/0.jpg
  yeni https://i.ytimg.com/vi/2fSBLH-ISaE/hqdefault.jpg
  
 */

const Popup = () => {
  function sendMessage() {
    chrome.runtime.sendMessage({ action: 'open-side-panel' });
  }

  async function side() {
    await chrome.sidePanel.setOptions({
      path: 'side-panel/index.html',
      enabled: true, // Make sure it's enabled
    });
  }

  return (
    <div className={`App`}>
      <header className={`App-header h-full`}>
        <PillsFormDemo />

        <div className="space-y-2 pb-4">
          <Button
            onClick={saveCurrentTab}
            variant="default"
            className="shadow hover:scale-[1.02] w-full transition-all">
            Save current Tab
          </Button>
          <Button
            variant="destructive"
            className=" hover:scale-[1.02] w-full transition-all"
            onClick={deleteAllTabData}>
            Clear saved pages...
          </Button>
          <Button variant="secondary" className="shadow hover:scale-[1.02] w-full transition-all" onClick={sendMessage}>
            Side open by message
          </Button>
        </div>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
