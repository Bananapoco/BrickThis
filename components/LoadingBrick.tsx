import React from 'react';
import { motion } from 'framer-motion';

export const LoadingBrick: React.FC<{ message?: string }> = ({ message = "Processing..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="relative w-24 h-24">
        {/* Animated 2x2 Brick */}
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-10 h-10 rounded-full bg-[#E3000B] shadow-inner"
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: [0.8, 1.1, 0.8], 
                opacity: [0.5, 1, 0.5] 
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 border-4 border-[#B30009] rounded-xl -z-10 bg-[#E3000B] opacity-20 transform scale-125"></div>
      </div>
      
      <motion.p 
        className="text-2xl font-bold text-gray-700"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
};