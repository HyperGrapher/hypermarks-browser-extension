import '@src/Popup.css';
import { deleteAllTabData, saveCurrentTab, withErrorBoundary, withSuspense } from '@extension/shared';
import { Button, cn, PillsFormDemo } from '@extension/ui';
import { useEffect, useState } from 'react';

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
  const [message, setMessage] = useState('Save current tab');
  const [tags, setTags] = useState<string[] | null>(null);

  useEffect(() => {
    // console.log(tags);
  }, [tags]);

  function saveTab() {
    saveCurrentTab(tags)
      .then(val => {
        if (val) {
          setMessage('Tab saved!');
        }
      })
      .catch(err => {
        console.log(err);
        setMessage('Error occured');
      })
      .finally(() => setTimeout(() => setMessage('Save current tab'), 2000));
  }

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
        <PillsFormDemo setTags={setTags} />

        <div className="space-y-2 pb-4">
          <Button
            onClick={saveTab}
            variant="default"
            className={cn(
              'shadow hover:scale-[1.02] w-full transition-all',
              message === 'Tab saved!' ? 'bg-green-500 hover:bg-green-600' : '',
              message === 'Error occured' ? 'bg-red-500 hover:bg-red-600' : '',
            )}>
            {message}
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
