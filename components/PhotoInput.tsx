import React, { useCallback, useRef, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Image as ImageIcon, X } from 'lucide-react';
import { LegoButton } from './LegoButton';

// Lazy-load the heavy webcam library — only when user clicks "Use Camera"
const Webcam = lazy(() => import('react-webcam'));

interface PhotoInputProps {
  onImageSelected: (imageUrl: string) => void;
}

const PhotoInput: React.FC<PhotoInputProps> = ({ onImageSelected }) => {
  const [mode, setMode] = useState<'selection' | 'webcam'>('selection');
  const webcamRef = useRef<any>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImageSelected(url);
    }
  }, [onImageSelected]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onImageSelected(imageSrc);
    }
  }, [onImageSelected]);

  if (mode === 'webcam') {
    return (
      <motion.div 
        className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border-8 border-gray-800 shadow-xl">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
              Loading camera...
            </div>
          }>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: "environment" }}
            />
          </Suspense>
          <button 
            onClick={() => setMode('selection')}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur p-2 rounded-full text-white hover:bg-white/40 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex gap-4">
          <LegoButton onClick={capture} variant="danger" icon={<Camera />}>
            Snap Photo
          </LegoButton>
        </div>
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
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-[#f0f4f8] rounded-full flex items-center justify-center">
            <ImageIcon className="text-gray-400 w-10 h-10 group-hover:text-[#FFD500] transition-colors" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Add a Photo</h3>
        <p className="text-gray-500 mb-8">
          Upload a picture or use your camera to start building.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <label className="cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <div className="bg-[#FFD500] border-b-4 border-[#D4AF37] text-black font-bold text-lg px-6 py-3 rounded-xl hover:bg-[#FFE033] flex items-center gap-2 justify-center transition-colors">
              <Upload size={20} />
              Upload File
            </div>
          </label>
          
          <span className="flex items-center justify-center text-gray-400 font-bold">
            OR
          </span>

          <LegoButton 
            onClick={() => setMode('webcam')} 
            variant="secondary"
            icon={<Camera size={20} />}
          >
            Use Camera
          </LegoButton>
        </div>
      </motion.div>
    </div>
  );
};

export default PhotoInput;
export { PhotoInput };
