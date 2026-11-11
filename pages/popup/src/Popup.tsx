import {
  deleteAllTabData,
  withErrorBoundary,
  withSuspense,
  tagsAtom,
  getActiveTabMeta,
  SiteMeta,
  saveDexieTab,
} from '@extension/shared';
import { Button, cn, DropdownSelect, FavoritePicker, Input } from '@extension/ui';
import type { DexieTab, FavoriteColor } from '@extension/storage';
import { autoPrefsStorage, findSavedMark } from '@extension/storage';
import '@src/Popup.css';
import { useEffect, useState } from 'react';
import { TagsForm } from './components/TagsForm';
import { useAtom } from 'jotai';
import { MetaHeader } from './components/MetaHeader';
import { db } from '@extension/storage';
import { useLiveQuery } from 'dexie-react-hooks';
import ScreenshotCheckbox from './components/ScreenshotCheckbox';
import { SubCategorySelector } from './components/SubCategorySelector';
/*
 #* fikir su:
 #* alt categori olustur . belli basli siteler, ozellikle dedicated data/ui'i olan
 #* 
 */

/*
  eski: https://img.youtube.com/vi/2fSBLH-ISaE/0.jpg
  yeni https://i.ytimg.com/vi/2fSBLH-ISaE/hqdefault.jpg
  shorts https://i.ytimg.com/vi/9ebdVVT4A84/hqdefault.jpg

  Save this:
  https://ultimate-gtk4-crystal-guide.geopjr.dev/assets/en/ui-design-1.webm
  no title, nothing

  popup wave SVG:
  https://svgwave.in/

  https://x.com/ryanflorence/status/1868523934834102330/photo/1

  
 */

const Popup = () => {
  // const {}

  const [message, setMessage] = useState('Save current tab');
  const [tags, setTags] = useAtom(tagsAtom); // Jotai
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [creatingSubCategory, setCreatingSubCategory] = useState(false);
  const [note, setNote] = useState<string>('');
  const [favorite, setFavorite] = useState<FavoriteColor | undefined>();
  const [aiREsponse, setAiResponse] = useState<any>({});
  const [sitemeta, setSitemeta] = useState<SiteMeta>();
  const [categories, setCategories] = useState<string[]>([]);
  /** The saved item of the open page. Saving then edits it instead of adding a duplicate. */
  const [existingMark, setExistingMark] = useState<DexieTab>();
  // Get DB categories and set categories as string array.
  useLiveQuery(async () => setCategories((await db.categories.toArray()).map(c => c.category)), []);

  useEffect(() => {
    async function init() {
      const meta = await getActiveTabMeta();
      setSitemeta(meta);

      const saved = meta?.url ? await findSavedMark(meta.url) : undefined;
      if (saved?.id !== undefined) {
        // Already saved: show what was saved so it can be reviewed or changed
        const category = await db.categories.get(saved.categoryId);
        const subCategory = saved.subCategoryId ? await db.subCategories.get(saved.subCategoryId) : undefined;
        setExistingMark(saved);
        setSelectedCategory(category?.category ?? '');
        setSelectedSubCategory(subCategory?.name ?? '');
        setTags(saved.tags);
        setNote(saved.note ?? '');
        setFavorite(saved.favorite);
        setMessage('Update bookmark');
        return;
      }

      // New page: start with the category used for the last save, if it still exists
      const { lastSavedCategory } = await autoPrefsStorage.get();
      if (lastSavedCategory && (await db.categories.where('category').equals(lastSavedCategory).first())) {
        setSelectedCategory(current => current || lastSavedCategory);
      }
    }

    init().catch(error => console.error('Popup init failed', error));
  }, []);

  function handleAiSuccess() {
    setAiSuccess(true);
    setTimeout(() => setAiSuccess(false), 740);
  }

  function getAiResponse() {
    // getAiResponseForTab()
    //   .then(val => {
    //     if (!val.category || !Array.isArray(val.tags)) {
    //       setMessage('Invalid AI response');
    //       return;
    //     }
    //     if (val) {
    //       console.log(val.category, 'val.category');
    //       setSelectedCategory(val.category); // Update the selected category
    //       setTags(prevTags => Array.from(new Set([...prevTags, ...val.tags])));
    //       setAiResponse(val);
    //       onCreateNewCategory(val.category);
    //       handleAiSuccess();
    //     }
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     setMessage('Error occured');
    //   });
  }

  async function saveTab() {
    const data = {
      tags,
      category: selectedCategory || 'Uncategorized',
      // Sub categories only apply to an explicitly chosen category
      subCategory: selectedCategory ? selectedSubCategory : '',
      sitemeta,
      note,
      favorite,
    };

    try {
      if (existingMark?.id !== undefined) {
        await db.updateItem(existingMark.id, {
          category: data.category,
          subCategory: data.subCategory,
          tags: data.tags,
          note: data.note,
          favorite: data.favorite,
        });
      } else {
        const { success } = await saveDexieTab(data);
        console.log('saveTab', success);
      }
      await autoPrefsStorage.saveLastSavedCategory(data.category);
      setMessage('Tab saved!');
      setSelectedCategory('');
      setSelectedSubCategory('');
      setTags([]);
      setAiSuccess(true); // todo iki adet var. biri bu, digeri getAiResponse'da
      setTimeout(() => window.close(), 750);
    } catch (error) {
      setMessage('Error occured');
    }
  }

  async function saveTabEX() {
    if (sitemeta?.origin.includes('//x.com') || sitemeta?.origin.includes('bilyoner.com')) {
      try {
        const data = {} as any; // await captureTweetScreenshotAndSaveTab(tags, selectedCategory || 'Uncategorized');
        console.log('saveTab', data.title);
        setMessage('Tab saved!');
        setSelectedCategory('');
        setTags([]);
        setAiSuccess(true); // todo iki adet var. biri bu, digeri getAiResponse'da
        // setTimeout(() => window.close(), 750);
      } catch (error) {
        setMessage('Error occured');
      }
    } else {
      // saveCurrentTab(tags, selectedCategory || 'Uncategorized')
      //   .then(val => {
      //     if (val) {
      //       setMessage('Tab saved!');
      //       setSelectedCategory('');
      //       setTags([]);
      //       setAiSuccess(true); // todo iki adet var. biri bu, digeri getAiResponse'da
      //       setTimeout(() => window.close(), 750);
      //     }
      //   })
      //   .catch(err => {
      //     console.log(err);
      //     setMessage('Error occured');
      //   });
    }
  }

  function onCreateNewCategory(categoryName: string) {
    const trimmedCategory = categoryName.trim();
    if (trimmedCategory === '') {
      setCategoryError('Please enter a category name');
      console.log('Please enter a category name');
      return;
    }
    if (trimmedCategory.length >= 30) {
      setCategoryError('Category name is too long');
      console.log('Category name is too long');
      return;
    }

    const categoryExists = categories.some(category => category.toLowerCase() === trimmedCategory.toLowerCase());
    if (categoryExists) {
      setCategoryError('Category name already exists');
      console.log('Category name already exists');
      return;
    }

    const updatedCategories = [...categories, trimmedCategory];
    setCategories(updatedCategories);
    setSelectedCategory(trimmedCategory); // Keep the new category selected
    setCategoryError(null);
    setShowCreateCategory(false);
  }

  async function openSidePanel() {
    // await chrome.sidePanel.setOptions({
    //   path: 'side-panel/index.html',
    //   enabled: true, // Make sure it's enabled
    // });
    // WARN opens sidepanel in its own window
    // chrome.tabs.create({ url: chrome.runtime.getURL('side-panel/index.html') });
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.sidePanel.open({ windowId: activeTab?.windowId ?? 0 });
    // close popup window
    setTimeout(() => window.close(), 300);
  }

  function onCancelNewCategory() {
    setCategoryError(null);
    setSelectedCategory('');
    setShowCreateCategory(false);
  }

  return (
    <div
      className={cn(`px-4 pb-4 pt-4 duration-700`, {
        'after:animate-pulse after:absolute after:inset-0 after:w-full after:h-screen after:bg-blue-500/5 after:z-50 after:border-2 after:border-green-500/50':
          aiSuccess,
      })}>
      <header className={`relative z-10`}>
        <MetaHeader meta={sitemeta} />

        {existingMark && (
          <p className="mb-2 text-xs text-emerald-400">Already saved. Saving again updates this bookmark.</p>
        )}

        <div className="space-y-2">
          <DropdownSelect
            items={categories}
            value={selectedCategory}
            onItemSelect={val => {
              setSelectedCategory(val);
              // Sub categories belong to one main category
              setSelectedSubCategory('');
              setCreatingSubCategory(false);
            }}
            setShowCreateCategory={() => {
              setSelectedCategory('');
              setSelectedSubCategory('');
              setCreatingSubCategory(false);
              setShowCreateCategory(true);
            }}
            name="categories"
            placeholder="Select category"
            variant="default"
            valid={!showCreateCategory}
          />
          {showCreateCategory && (
            <section>
              <Input
                type="text"
                className="xshadow-xl  w-full bg-slate-900/50 text-sm outline outline-1 outline-zinc-300/30 placeholder:text-sm placeholder:text-zinc-500"
                value={selectedCategory}
                placeholder="Type category name"
                onChange={e => setSelectedCategory(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <Button onClick={() => onCancelNewCategory()} size="sm" className="shrink" variant={'destructive'}>
                  Cancel
                </Button>
                <Button
                  onClick={() => onCreateNewCategory(selectedCategory)}
                  size="sm"
                  className="w-full grow"
                  variant={'default'}>
                  Create Category
                </Button>
              </div>
              {categoryError && <p className="pt-1 text-xs text-red-500">{categoryError}</p>}
            </section>
          )}

          {!showCreateCategory && selectedCategory && (
            <SubCategorySelector
              key={selectedCategory}
              category={selectedCategory}
              value={selectedSubCategory}
              onChange={setSelectedSubCategory}
              onCreatingChange={setCreatingSubCategory}
            />
          )}

          {!showCreateCategory && !creatingSubCategory && (
            <>
              <div className="my-2">
                <textarea
                  className={cn(
                    'txt focus:bg-slate-800/50 bg-slate-900/50 outline outline-zinc-300/30 outline-1 placeholder:text-sm',
                    'placeholder:text-zinc-500 border-0 text-sm',
                  )}
                  placeholder="Type to add a note... (optional)"
                  autoCorrect="off"
                  spellCheck="false"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              <TagsForm />
              <FavoritePicker value={favorite} onChange={setFavorite} />
            </>
          )}
        </div>

        {!showCreateCategory && !creatingSubCategory && (
          <div className="space-y-2">
            {!existingMark && <ScreenshotCheckbox url={sitemeta?.url ?? ''} />}
            <Button
              onClick={async () => await saveTab()}
              variant="default"
              className={cn(
                'shadow hover:scale-[1.02] w-full transition-all bg-white/70 hidden',
                message === 'Tab saved!' ? 'bg-blue-500 hover:bg-blue-600' : '',
                message === 'Error occured' ? 'bg-red-500 hover:bg-red-600' : '',
              )}>
              {message}
            </Button>

            <button
              id="save-tab"
              onClick={saveTab}
              className={cn(
                'ai-button w-full',
                message === 'Tab saved!' ? 'bg-blue-500 hover:bg-blue-600' : '',
                message === 'Error occured' ? 'bg-red-500 hover:bg-red-600' : '',
              )}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.25rem"
                height="1.25rem"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2">
                <path d="M12 19v-7m0 0V5m0 7H5m7 0h7"></path>
              </svg>
              {message}
            </button>

            <Button variant="secondary" size="sm" className="w-full" onClick={openSidePanel}>
              Open side panel
            </Button>

            {/* <Button variant="outline" className=" w-full transition-all hover:scale-[1.02]" onClick={getAiResponse}>
              Get Ai Response
            </Button> */}

            {/* <Button
              variant="secondary"
              className="w-full shadow transition-all hover:scale-[1.02]"
              onClick={openSidePanel}>
              open sidepanel
            </Button>

            <Button
              variant="destructive"
              className=" hover:scale-[1.02] w-full transition-all"
              onClick={deleteAllTabData}>
              Clear saved pages...
            </Button>` */}
          </div>
        )}
        {/* <pre>{JSON.stringify(aiREsponse, null, 2)}</pre> */}
      </header>

      <div className="absolute inset-x-0 bottom-0 z-0 w-full opacity-10 w-full">
        <svg
          width="100%"
          height="100%"
          id="svg"
          viewBox="0 0 1440 590"
          xmlns="http://www.w3.org/2000/svg"
          className="grayscale transition delay-150 duration-300 ease-in-out">
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
            className="path-0 transition-all delay-150 duration-300 ease-in-out"></path>
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
            className="path-1 transition-all delay-150 duration-300 ease-in-out"></path>
        </svg>
      </div>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div> Loading ... </div>),
  <div className="min-h-16 text-red-500"> Error Occured </div>,
);
