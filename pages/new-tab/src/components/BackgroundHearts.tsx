import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface HeartStyle {
  id: number;
  left: string;
  animationDuration: string;
  animationDelay: string;
  scale: number;
  opacity: number;
  color: string;
}

const BackgroundHearts: React.FC = () => {
  const [hearts, setHearts] = useState<HeartStyle[]>([]);

  useEffect(() => {
    // Generate static random hearts for the background to avoid re-rendering loop issues
    const heartCount = 20;
    const newHearts: HeartStyle[] = [];
    const colors = ['text-pink-300', 'text-rose-300', 'text-red-200', 'text-pink-200'];

    for (let i = 0; i < heartCount; i++) {
      newHearts.push({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${10 + Math.random() * 15}s`, // Slow, dreamy movement
        animationDelay: `${Math.random() * 10}s`,
        scale: 0.5 + Math.random() * 1, // Random size
        opacity: 0.3 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setHearts(newHearts);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className={`absolute bottom-0 animate-float ${heart.color}`}
          style={{
            left: heart.left,
            animationDuration: heart.animationDuration,
            animationDelay: heart.animationDelay,
            opacity: heart.opacity,
          }}>
          <Heart
            fill="currentColor"
            style={{
              width: `${heart.scale * 40}px`,
              height: `${heart.scale * 40}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default BackgroundHearts;
