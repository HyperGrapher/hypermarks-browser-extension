import { deleteAllTabData, saveCurrentTab, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { tabsGroupedStorage } from '@extension/storage';
import { Button, cn, DropdownSelect, Input } from '@extension/ui';
import '@src/Popup.css';
import { useState } from 'react';
import { TagsForm } from './components/TagsForm';

/*
 #* fikir su:
 #* alt categori olustur . belli basli siteler, ozellikle dedicated data/ui'i olan
 #* 
 */

/*
  eski: https://img.youtube.com/vi/2fSBLH-ISaE/0.jpg
  yeni https://i.ytimg.com/vi/2fSBLH-ISaE/hqdefault.jpg

  Save this:
  https://ultimate-gtk4-crystal-guide.geopjr.dev/assets/en/ui-design-1.webm
  no title, nothing

  popup wave SVG:
  https://svgwave.in/
  
 */

const Popup = () => {
  const [message, setMessage] = useState('Save current tab');
  const [tags, setTags] = useState<string[] | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const groupedTabs = useStorage(tabsGroupedStorage);
  const [categories, setCategories] = useState<string[]>(
    Object.entries(groupedTabs).flatMap(([category, _items]) => category) ?? [],
  );

  function saveTab() {
    saveCurrentTab(tags, selectedCategory)
      .then(val => {
        if (val) {
          setMessage('Tab saved!');
          setSelectedCategory('');
          setTags(null);
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

  function onCreateNewCategory() {
    setCategories([...categories, selectedCategory]);
    setSelectedCategory(selectedCategory);
    setShowCreateCategory(false);
  }

  async function side() {
    await chrome.sidePanel.setOptions({
      path: 'side-panel/index.html',
      enabled: true, // Make sure it's enabled
    });
  }

  function onCancelNewCategory() {
    setShowCreateCategory(false);
  }

  return (
    <div className={`px-4 pt-4`}>
      <header className={`h-80 relative z-10`}>
        <div className="space-y-2">
          <DropdownSelect
            items={categories}
            value={selectedCategory}
            onItemSelect={val => setSelectedCategory(val)}
            setShowCreateCategory={() => setShowCreateCategory(true)}
            name="categories"
            placeholder="Select category"
            variant="default"
            valid={!showCreateCategory}
          />
          {showCreateCategory && (
            <section>
              <Input
                type="text"
                autoFocus
                className="w-full xshadow-xl bg-slate-900/50 outline outline-zinc-300/30 outline-1 placeholder:text-sm placeholder:text-zinc-500"
                value={selectedCategory}
                placeholder="Type category name"
                onChange={e => setSelectedCategory(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={() => onCancelNewCategory()} size="sm" className="shrink" variant={'destructive'}>
                  Cancel
                </Button>
                <Button onClick={() => onCreateNewCategory()} size="sm" className="w-full grow" variant={'default'}>
                  Create Category
                </Button>
              </div>
            </section>
          )}

          <TagsForm setTags={setTags} />
        </div>

        <div className="space-y-2">
          <Button
            onClick={saveTab}
            variant="default"
            className={cn(
              'shadow hover:scale-[1.02] w-full transition-all bg-white/70',
              message === 'Tab saved!' ? 'bg-blue-500 hover:bg-blue-600' : '',
              message === 'Error occured' ? 'bg-red-500 hover:bg-red-600' : '',
            )}>
            {message}
          </Button>
          <Button variant="outline" className=" hover:scale-[1.02] w-full transition-all" onClick={deleteAllTabData}>
            Clear saved pages...
          </Button>
          <Button
            variant="secondary"
            className="shadow hover:scale-[1.02] w-full transition-all hidden"
            onClick={sendMessage}>
            Side open by message
          </Button>
        </div>
      </header>

      <div className="absolute bottom-0 right-0 left-0 w-full opacity-10 z-0">
        <svg
          width="100%"
          height="100%"
          id="svg"
          viewBox="0 0 1440 590"
          xmlns="http://www.w3.org/2000/svg"
          className="transition duration-300 ease-in-out delay-150 grayscale">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="5%" stopColor="#F78DA7"></stop>
              <stop offset="95%" stopColor="#8ED1FC"></stop>
            </linearGradient>
          </defs>
          <path
            d="M 0,600 L 0,150 C 109.44497607655504,111.11961722488039 218.88995215311007,72.23923444976077 298,103 C 377.1100478468899,133.76076555023923 425.88516746411483,234.16267942583727 534,267 C 642.1148325358852,299.83732057416273 809.5693779904306,265.11004784689 910,269 C 1010.4306220095694,272.88995215311 1043.8373205741627,315.39712918660285 1121,352 C 1198.1626794258373,388.60287081339715 1319.0813397129186,419.3014354066986 1440,450 L 1440,600 L 0,600 Z"
            stroke="none"
            strokeWidth="0"
            fill="url(#gradient)"
            fillOpacity="0.53"
            className="transition-all duration-300 ease-in-out delay-150 path-0"></path>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="5%" stopColor="#F78DA7"></stop>
              <stop offset="95%" stopColor="#8ED1FC"></stop>
            </linearGradient>
          </defs>
          <path
            d="M 0,600 L 0,350 C 84.70813397129186,334.20095693779905 169.41626794258372,318.4019138755981 270,325 C 370.5837320574163,331.5980861244019 487.0430622009569,360.59330143540666 587,402 C 686.9569377990431,443.40669856459334 770.4114832535884,497.22488038277504 867,512 C 963.5885167464116,526.775119617225 1073.3110047846892,502.5071770334928 1171,519 C 1268.6889952153108,535.4928229665072 1354.3444976076553,592.7464114832536 1440,650 L 1440,600 L 0,600 Z"
            stroke="none"
            strokeWidth="0"
            fill="url(#gradient)"
            fillOpacity="1"
            className="transition-all duration-300 ease-in-out delay-150 path-1"></path>
        </svg>
      </div>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div> Loading ... </div>),
  <div className="text-red-500 min-h-16"> Error Occured </div>,
);
