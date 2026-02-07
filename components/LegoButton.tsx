import React from 'react';
import { motion } from 'framer-motion';

interface LegoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'neutral';
  icon?: React.ReactNode;
}

export const LegoButton: React.FC<LegoButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "relative font-bold text-lg px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md border-b-4";
  
  const variants = {
    primary: "bg-[#FFD500] border-[#D4AF37] text-black hover:bg-[#FFE033]",
    secondary: "bg-white border-gray-300 text-gray-800 hover:bg-gray-50",
    danger: "bg-[#E3000B] border-[#B30009] text-white hover:bg-[#FF1A26]",
    neutral: "bg-gray-200 border-gray-400 text-gray-700 hover:bg-gray-300",
  };

  return (
    <motion.button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      whileHover={{ 
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95,
        y: 0,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {icon && (
        <motion.span 
          className="w-5 h-5"
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.span>
      )}
      {children}
    </motion.button>
  );
};