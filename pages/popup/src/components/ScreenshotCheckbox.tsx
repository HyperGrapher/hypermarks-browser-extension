import { useStorage } from '@extension/shared';
import { db, screenshotPrefStorage } from '@extension/storage';
import { Checkbox } from '@extension/ui';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';

function ScreenshotCheckbox({ url }: { url: string }) {
  const LIMIT = 30;
  //   const [value, setValue] = useState(false);
  const prefs = useStorage(screenshotPrefStorage);
  const count = useLiveQuery(async () => await db.x_screenshots.count(), [url]);
  const left = (count ?? 0) <= LIMIT ? LIMIT - (count ?? 0) : 0;
  //   if (!url.includes('//x.com')) return null;
  useEffect(() => {
    if (count && count >= LIMIT) {
      screenshotPrefStorage.set({ pref: false });
    }
  }, [count]);
  if (!/^https?:\/\/x\.com\/.*\/status\//.test(url ?? '')) return null;

  return (
    <div className="items-top flex space-x-2">
      <Checkbox
        id="scrshot"
        disabled={(count ?? 0) >= LIMIT}
        checked={prefs.pref}
        onCheckedChange={e => {
          screenshotPrefStorage.set({ pref: !!e });
        }}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="scrshot"
          className="text-[14px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Also take a screenshot of the tweet?
        </label>
        <small className="text-xs text-muted-foreground">You're on free plan. You have {left} screenshots left.</small>
      </div>
    </div>
  );
}

export default ScreenshotCheckbox;
