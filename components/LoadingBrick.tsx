import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MEMES = [
  '1l9j9munv7bb1.webp',
  '53608201400_4d090790f4_h.jpg',
  '55235be55fb18.jpeg',
  '8hc4jr.jpg',
  'aRBROAB_460s.jpg',
  'f311ad1e-9b87-45c9-bcd1-565bb6b1a99b-original-0x0.webp',
  'funny-meme-about-being-a-bad-boy-by-using-illegal-lego-moves.jpeg',
  'hqdefault.jpg',
  'images (1).jpeg',
  'images (2).jpeg',
  'images.jpeg',
  'lego-lego-meme.png'
];

export const LoadingBrick: React.FC<{ message?: string }> = ({ message = "Processing..." }) => {
  const [memeIndex, setMemeIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle memes every 5 seconds
    const memeInterval = setInterval(() => {
      setMemeIndex((prev) => (prev + 1) % MEMES.length);
    }, 5000);

    // Simulate progress bar (since we don't have real progress from the API)
    // It will slow down as it reaches 90%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const increment = Math.max(0.1, (100 - prev) / 50);
        return Math.min(95, prev + increment);
      });
    }, 100);

    return () => {
      clearInterval(memeInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-8 p-6">
      {/* Meme Display */}
      <div className="relative w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
        <AnimatePresence mode="wait">
          <motion.img
            key={MEMES[memeIndex]}
            src={`/memes/${MEMES[memeIndex]}`}
            alt="LEGO Meme"
            className="w-full h-full object-contain bg-gray-100"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
      </div>

      <div className="w-full space-y-4">
        {/* Progress Bar Container */}
        <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300 shadow-inner relative">
          {/* Progress Fill */}
          <motion.div 
            className="h-full bg-[#E3000B]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          />
          
          {/* LEGO Studs Pattern on Progress Bar */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-around px-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-white" />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center px-1">
          <motion.p 
            className="text-xl font-black text-gray-800 uppercase tracking-tight"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message}
          </motion.p>
          <span className="text-lg font-black text-[#E3000B]">
            {Math.floor(progress)}%
          </span>
        </div>
      </div>

      {/* Animated 2x2 Brick (Smaller version) */}
      <div className="grid grid-cols-2 gap-1.5 opacity-40">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded-full bg-[#E3000B]"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
};
