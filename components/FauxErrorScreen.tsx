import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RefreshCw } from 'lucide-react';
import { LegoButton } from './LegoButton';

interface FauxErrorScreenProps {
  onRetry: () => void;
}

const FauxErrorScreen: React.FC<FauxErrorScreenProps> = ({ onRetry }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/EverythingIsAwesome.wav');
    audio.loop = false;
    audio.volume = 0.5;
    audioRef.current = audio;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Audio play failed (user interaction needed?):", error);
      });
    }

    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 21, spread: 360, ticks: 78, zIndex: 1000 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 325);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleRetry = () => {
    if (audioRef.current) audioRef.current.pause();
    onRetry();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden font-sans bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0 z-0 animate-rainbow-flash-pastel opacity-40" />
      
      <motion.div 
        className="relative z-10 bg-white p-10 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 text-center"
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <img 
          src="/errorImage.png" 
          alt="Everything is NOT awesome" 
          className="w-full h-96 object-cover rounded-xl mb-8"
        />
        
        <p className="text-2xl font-bold text-red-700 mb-10">
          TOO MUCH AWESOMENESS DETECTED
        </p>

        <LegoButton 
          onClick={handleRetry} 
          className="w-full justify-center text-xl py-4"
          icon={<RefreshCw className="animate-spin" />}
        >
          TRY AGAIN!
        </LegoButton>
      </motion.div>

      <style jsx>{`
        @keyframes rainbow-flash-pastel {
          0% { background-color: #ff9999; }
          14% { background-color: #ffcc99; }
          28% { background-color: #ffff99; }
          42% { background-color: #99ff99; }
          57% { background-color: #9999ff; }
          71% { background-color: #cc99ff; }
          85% { background-color: #ff99ff; }
          100% { background-color: #ff9999; }
        }
        .animate-rainbow-flash-pastel {
          animation: rainbow-flash-pastel 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FauxErrorScreen;
export { FauxErrorScreen };
