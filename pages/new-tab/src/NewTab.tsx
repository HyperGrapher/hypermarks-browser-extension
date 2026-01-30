import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import BackgroundHearts from './components/BackgroundHearts';
import MainTitle from './components/MainTitle';
import InteractiveLayer from './components/InteractiveLayer';

export default function NewTab() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200">
      {/* Background Ambient Animation */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.8),transparent_70%)]"></div>

      {/* Floating Hearts Layer */}
      <BackgroundHearts />

      {/* Main Content */}
      <div
        className={`relative z-10 w-full h-full flex flex-col items-center justify-center transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <MainTitle />
      </div>

      {/* Interactive Click Layer */}
      <InteractiveLayer />

      {/* Footer / Credit (Optional subtle touch) */}
      <div className="absolute bottom-4 text-rose-400 text-xs font-light tracking-widest opacity-60">
        FOREVER & ALWAYS
      </div>
    </div>
  );
}
/* 
import '@src/NewTab.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { Button } from '@extension/ui';

const NewTab = () => {
  return (
    <div className={`App`}>
      <header>
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

export default withErrorBoundary(withSuspense(NewTab, <div>loading</div>), <div> Error Occur </div>);
 */
