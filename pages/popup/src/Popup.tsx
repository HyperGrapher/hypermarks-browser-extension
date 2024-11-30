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
  return (
    <div className={`App`}>
      <header className={`App-header h-full`}>
        <PillsFormDemo />
        <Button onClick={saveCurrentTab} variant="default">
          Save current Tab
        </Button>
        <button
          className="mt-4 rounded bg-red-500 px-4 py-1 font-bold shadow hover:scale-105"
          onClick={deleteAllTabData}>
          Clear saved pages...
        </button>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
