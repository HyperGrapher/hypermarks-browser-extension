import React, { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';

interface BurstHeart {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
  scale: number;
}

const InteractiveLayer: React.FC = () => {
  const [bursts, setBursts] = useState<BurstHeart[]>([]);

  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const newBursts: BurstHeart[] = [];
    const count = 12; // Particles per click
    const colors = ['text-red-500', 'text-rose-400', 'text-pink-500', 'text-white'];

    for (let i = 0; i < count; i++) {
      newBursts.push({
        id: Date.now() + i,
        x: clientX,
        y: clientY,
        angle: Math.random() * 360,
        speed: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.5 + Math.random(),
      });
    }

    setBursts(prev => [...prev, ...newBursts]);

    // Cleanup after animation
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id < Date.now())); // Ideally filter by ID relative to current batch, simple timeout works for visual effect
    }, 1000);
  }, []);

  return (
    <div
      className="absolute inset-0 z-20 cursor-pointer outline-none"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}>
      {bursts.map(heart => (
        <BurstingHeart key={heart.id} data={heart} />
      ))}
    </div>
  );
};

// Sub-component for individual bursting heart to handle its own animation frame state if needed,
// or just use CSS variables for simplicity.
const BurstingHeart: React.FC<{ data: BurstHeart }> = ({ data }) => {
  // Calculate end position based on angle and distance
  const distance = 100;
  const rad = (data.angle * Math.PI) / 180;
  const tx = Math.cos(rad) * distance * data.speed;
  const ty = Math.sin(rad) * distance * data.speed;

  return (
    <div
      className={`absolute pointer-events-none transition-all duration-1000 ease-out ${data.color}`}
      style={{
        left: data.x,
        top: data.y,
        transform: `translate(-50%, -50%) translate(${0}px, ${0}px)`, // Initial
        // We use a small timeout hack in real CSS/JS animations usually, but here we can use keyframes or just mounting state.
        // Since this is a simple render, let's use a CSS animation class with dynamic vars.
      }}>
      <style>{`
                @keyframes burst-${data.id} {
                    0% { transform: translate(-50%, -50%) translate(0, 0) scale(0); opacity: 1; }
                    100% { transform: translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${data.scale}); opacity: 0; }
                }
            `}</style>
      <div style={{ animation: `burst-${data.id} 1s ease-out forwards` }}>
        <Heart fill="currentColor" size={24} />
      </div>
    </div>
  );
};

export default InteractiveLayer;
