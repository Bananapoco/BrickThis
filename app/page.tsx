"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AppState, AnalysisResult } from '../types';
import { analyzeImage } from '../services/mockApi';

import { PhotoInput } from '../components/PhotoInput';
import { ImageCropper } from '../components/ImageCropper';
import { LoadingBrick } from '../components/LoadingBrick';
import { ResultsView } from '../components/ResultsView';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('home');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

  const handleImageSelected = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setAppState('editing');
  };

  const handleImageCropped = async (blob: Blob) => {
    setAppState('processing');
    try {
      const result = await analyzeImage(blob);
      setAnalysisResults(result);
      setAppState('results');
    } catch (error) {
      console.error("Analysis failed", error);
      setAppState('home');
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResults(null);
    setAppState('home');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">
      {/* Background Characters */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute left-[-8%] top-1/2 -translate-y-1/2">
          <motion.img 
            src="/emmet.png" 
            alt="Emmet" 
            className="h-[400px] md:h-[500px] opacity-30"
            style={{ scaleX: -1 }}
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        <div className="absolute right-[0%] top-1/2 -translate-y-1/2">
          <motion.img 
            src="/benny-removebg-preview.png" 
            alt="Benny" 
            className="h-[280px] md:h-[450px] opacity-30"
            animate={{
              y: [0, 20, 0],
              rotate: [0, -2, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>
      </div>

      {/* Header */}
      <motion.header 
        className="bg-[#FFD500] text-gray-800 shadow-lg sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
             <motion.img 
               src="/logo.png" 
               alt="Logo" 
               className="h-10 w-auto" 
               whileHover={{ rotate: [0, -10, 10, -10, 0] }}
               transition={{ duration: 0.5 }}
             />
             <motion.h1 
               className="text-2xl font-black tracking-wider drop-shadow-md"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
             >
               BRICKTHIS
             </motion.h1>
          </motion.div>
          <AnimatePresence>
            {appState !== 'home' && (
              <motion.button 
                onClick={handleReset} 
                className="text-xs font-bold uppercase tracking-widest opacity-80 hover:opacity-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 0.8, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                Start Over
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 relative z-10">
        <AnimatePresence mode="wait">
          
          {appState === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-12"
            >
              <motion.div 
                className="text-center max-w-2xl mx-auto space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.2, delayChildren: 0.1 }}
              >
                <motion.h2 
                  className="text-4xl md:text-6xl font-black text-gray-800 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  Turn Your{' '}
                  <motion.span 
                    className="text-[#E3000B] inline-block"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    Ideas
                  </motion.span>
                  {' '}Into{' '}
                  <motion.span 
                    className="text-[#E3000B] transform -rotate-2 inline-block"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: -2 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    Bricks
                  </motion.span>
                </motion.h2>
                <motion.p 
                  className="text-xl text-gray-500 font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  Snap a photo of any object, and we'll generate the pieces and instructions you need to build it.
                </motion.p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
              >
                <PhotoInput onImageSelected={handleImageSelected} />
              </motion.div>
            </motion.div>
          )}

          {appState === 'editing' && selectedImage && (
            <motion.div
              key="editing"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full"
            >
              <ImageCropper 
                imageSrc={selectedImage}
                onCancel={() => setAppState('home')}
                onComplete={handleImageCropped}
              />
            </motion.div>
          )}

          {appState === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-[70vh] flex items-center justify-center"
            >
              <LoadingBrick message="Building your instructions..." />
            </motion.div>
          )}

          {appState === 'results' && analysisResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full"
            >
              <ResultsView results={analysisResults} onReset={handleReset} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer 
        className="bg-gray-800 text-gray-400 py-6 text-center text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>© 2024 BrickThis Prototype. Not affiliated with the LEGO Group.</p>
      </motion.footer>
    </div>
  );
}
