import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { Camera, Upload, Image as ImageIcon, X } from 'lucide-react';
import { LegoButton } from './LegoButton';

interface PhotoInputProps {
  onImageSelected: (imageUrl: string) => void;
}

export const PhotoInput: React.FC<PhotoInputProps> = ({ onImageSelected }) => {
  const [mode, setMode] = useState<'selection' | 'webcam'>('selection');
  const webcamRef = useRef<Webcam>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImageSelected(url);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onImageSelected(imageSrc);
    }
  }, [webcamRef, onImageSelected]);

  if (mode === 'webcam') {
    return (
      <motion.div 
        className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border-8 border-gray-800 shadow-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ facingMode: "environment" }}
          />
          <motion.button 
            onClick={() => setMode('selection')}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur p-2 rounded-full text-white hover:bg-white/40"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <X size={24} />
          </motion.button>
        </motion.div>
        <motion.div 
          className="flex gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LegoButton onClick={capture} variant="danger" icon={<Camera />}>
            Snap Photo
          </LegoButton>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div 
        className="border-4 border-dashed border-gray-300 rounded-3xl p-8 md:p-12 text-center bg-white shadow-sm hover:border-[#FFD500] transition-colors group"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="mb-6 flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <motion.div 
            className="w-20 h-20 bg-[#f0f4f8] rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.15, rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
             <motion.div
               animate={{ y: [0, -5, 0] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             >
               <ImageIcon className="text-gray-400 w-10 h-10 group-hover:text-[#FFD500]" />
             </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.h3 
          className="text-2xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Add a Photo
        </motion.h3>
        <motion.p 
          className="text-gray-500 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Upload a picture or use your camera to start building.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, staggerChildren: 0.1 }}
        >
          <motion.label 
            className="cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <motion.div 
              className="bg-[#FFD500] border-b-4 border-[#D4AF37] text-black font-bold text-lg px-6 py-3 rounded-xl hover:bg-[#FFE033] flex items-center gap-2 justify-center"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Upload size={20} />
              </motion.div>
              Upload File
            </motion.div>
          </motion.label>
          
          <motion.span 
            className="flex items-center justify-center text-gray-400 font-bold"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            OR
          </motion.span>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LegoButton 
              onClick={() => setMode('webcam')} 
              variant="secondary"
              icon={<Camera size={20} />}
            >
              Use Camera
            </LegoButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};