import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const MainTitle: React.FC = () => {
  const [scale, setScale] = useState(1);

  // Heartbeat effect for the icon
  useEffect(() => {
    const interval = setInterval(() => {
      setScale(prev => (prev === 1 ? 1.2 : 1));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center select-none cursor-default">
      <div className="flex flex-col items-center">
        {/* Decorative top element */}
        <div className="mb-4 opacity-0 animate-[fadeInDown_1s_ease-out_1s_forwards]">
          <Heart
            className="text-rose-500 fill-rose-500 drop-shadow-lg transition-transform duration-700 ease-in-out"
            size={48}
            style={{ transform: `scale(${scale})` }}
          />
        </div>

        {/* Names */}
        <h1 className="font-script text-7xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 drop-shadow-sm p-4 animate-shine">
          Burak <span className="text-rose-400 font-serif text-5xl md:text-7xl align-middle mx-2">&</span> Susi
        </h1>

        {/* Subtitle / Quote */}
        <div className="mt-8 opacity-0 animate-[fadeInUp_1s_ease-out_1.5s_forwards]">
          <p className="text-rose-800 text-lg md:text-xl font-light tracking-widest uppercase border-t border-b border-rose-300 py-2 px-8">
            A Love Story
          </p>
        </div>
      </div>

      {/* Inline styles for one-off keyframes if not in global css */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MainTitle;
