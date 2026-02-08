"use client";

import React, { useState, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppState, AnalysisResult } from '../types';
import { analyzeImage } from '../services/mockApi';

// Dynamic imports — only loaded when the component is needed
const PhotoInput = lazy(() => import('../components/PhotoInput'));
const ImageCropper = lazy(() => import('../components/ImageCropper'));
const LoadingBrick = lazy(() => import('../components/LoadingBrick'));
const ResultsView = lazy(() => import('../components/ResultsView'));
const FauxErrorScreen = lazy(() => import('../components/FauxErrorScreen'));

const ENABLE_FAUX_ERROR = true;

/** Minimal loading fallback for lazy components */
const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="w-8 h-8 border-4 border-[#FFD500] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function Home() {
  const [appState, setAppState] = useState<AppState>('home');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  
  // Faux Error State
  const [showFauxError, setShowFauxError] = useState(false);
  const [isFauxErrorFlow, setIsFauxErrorFlow] = useState(false);
  const [hasRetriedFauxError, setHasRetriedFauxError] = useState(false);
  const currentBlob = useRef<Blob | null>(null);

  const handleImageSelected = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
    setAppState('editing');
  }, []);

  const startRealAnalysis = useCallback(async (blob: Blob) => {
    setAppState('processing');
    try {
      const result = await analyzeImage(blob);
      setAnalysisResults(result);
      setAppState('results');
    } catch (error) {
      console.error("Analysis failed", error);
      setAppState('home');
    }
  }, []);

  const handleImageCropped = useCallback(async (blob: Blob) => {
    if (appState === 'processing') return;
    currentBlob.current = blob;
    setHasRetriedFauxError(false);
    
    const hasSeenFauxError = localStorage.getItem('hasSeenFauxError');
    
    if (ENABLE_FAUX_ERROR && !hasSeenFauxError) {
      setAppState('processing');
      setIsFauxErrorFlow(true);
    } else {
      startRealAnalysis(blob);
    }
  }, [appState, startRealAnalysis]);

  const handleLoadingProgress = useCallback((progress: number) => {
    if (isFauxErrorFlow && progress >= 60 && !showFauxError) {
      setShowFauxError(true);
    }
  }, [isFauxErrorFlow, showFauxError]);

  const handleFauxErrorRetry = useCallback(() => {
    localStorage.setItem('hasSeenFauxError', 'true');
    setShowFauxError(false);
    setIsFauxErrorFlow(false);
    setHasRetriedFauxError(true);
    
    if (currentBlob.current) {
      startRealAnalysis(currentBlob.current);
    } else {
      setAppState('home');
    }
  }, [startRealAnalysis]);

  const handleReset = useCallback(() => {
    setSelectedImage(null);
    setAnalysisResults(null);
    setAppState('home');
    setShowFauxError(false);
    setIsFauxErrorFlow(false);
    setHasRetriedFauxError(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">
      
      {/* Faux Error Overlay */}
      <AnimatePresence>
        {showFauxError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <Suspense fallback={null}>
              <FauxErrorScreen onRetry={handleFauxErrorRetry} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Characters — lazy loaded images */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute left-[-8%] top-1/2 -translate-y-1/2">
          <motion.img 
            src="/emmet.png" 
            alt="" 
            loading="lazy"
            className="h-[400px] md:h-[500px] opacity-30"
            style={{ scaleX: -1 }}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="absolute right-[0%] top-1/2 -translate-y-1/2">
          <motion.img 
            src="/benny-removebg-preview.png" 
            alt="" 
            loading="lazy"
            className="h-[280px] md:h-[450px] opacity-30"
            animate={{ y: [0, 20, 0], rotate: [0, -2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
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
             <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
             <h1 className="text-2xl font-black tracking-wider drop-shadow-md">
               BRICKTHIS
             </h1>
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
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <motion.h2 
                  className="text-4xl md:text-6xl font-black text-gray-800 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  Turn Your{' '}
                  <span className="text-[#E3000B]">Ideas</span>
                  {' '}Into{' '}
                  <span className="text-[#E3000B] transform -rotate-2 inline-block">Bricks</span>
                </motion.h2>
                <motion.p 
                  className="text-xl text-gray-500 font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Snap a photo of any object, and we'll generate the pieces and instructions you need to build it.
                </motion.p>
              </div>
              <Suspense fallback={<LazyFallback />}>
                <PhotoInput onImageSelected={handleImageSelected} />
              </Suspense>
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
              <Suspense fallback={<LazyFallback />}>
                <ImageCropper 
                  imageSrc={selectedImage}
                  onCancel={() => setAppState('home')}
                  onComplete={handleImageCropped}
                />
              </Suspense>
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
              <Suspense fallback={<LazyFallback />}>
                <LoadingBrick 
                  message="Building your instructions..." 
                  onProgress={handleLoadingProgress}
                  resetProgress={hasRetriedFauxError}
                />
              </Suspense>
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
              <Suspense fallback={<LazyFallback />}>
                <ResultsView results={analysisResults} onReset={handleReset} />
              </Suspense>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm flex flex-col items-center gap-2">
        <p>© 2026 February 7th BrickThis Prototype. Not affiliated with the LEGO Group.</p>
        <button 
          onClick={() => {
            localStorage.removeItem('hasSeenFauxError');
            alert('Faux error reset! The next generation will trigger the error screen.');
          }}
          className="text-xs opacity-20 hover:opacity-100 transition-opacity"
        >
          [Reset First-Time Experience]
        </button>
      </footer>
    </div>
  );
}
