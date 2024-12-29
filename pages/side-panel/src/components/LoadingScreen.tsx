import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onLoaded }: { onLoaded: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Trigger fade-out after a delay
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Remove component after fade-out
      setTimeout(() => {
        onLoaded();
      }, 500); // Match the animation duration
    }, 1500); // Show loading screen for 3 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [onLoaded]);

  return (
    <div
      className={`fixed inset-0 bg-slate-900/90 flex items-center justify-center text-slate-300 ${
        fadeOut ? 'animate-fadeOut' : ''
      }`}>
      <div className="relative -translate-y-10">
        <h1 className="text-slate-400 font-bold text-center py-4 leading-6">Loading...</h1>
        <div className="flex justify-center py-8">
          <div className="spinner">
            <div className="spinnerin"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
