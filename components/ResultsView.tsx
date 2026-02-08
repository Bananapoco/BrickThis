import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, BookOpen, RefreshCw } from 'lucide-react';
import { AnalysisResult } from '../types';
import { LegoButton } from './LegoButton';
import PartsTable from './results/PartsTable';
import StepCard from './results/StepCard';

interface ResultsViewProps {
  results: AnalysisResult;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'instructions'>('parts');

  const totalPieces = useMemo(
    () => results.pieces.reduce((acc, p) => acc + p.quantity, 0),
    [results.pieces]
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* Cover Image Hero */}
      {results.coverImageUrl && (
        <motion.div
          className="bg-white rounded-3xl shadow-lg overflow-hidden border-b-8 border-[#E3000B]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative flex justify-center bg-gray-50">
            <img
              src={results.coverImageUrl}
              alt="Your LEGO Build"
              className="w-auto h-auto object-contain max-h-[420px] max-w-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h2 className="text-white text-2xl md:text-3xl font-black drop-shadow-lg">
                BRICKTHIS
              </h2>
              <p className="text-white/80 text-sm font-medium mt-1">
                {totalPieces} pieces
                {' '}&middot;{' '}{results.difficulty}
                {' '}&middot;{' '}{results.estimatedTime}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary Header */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border-b-8 border-[#FFD500] flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Ready to Build!</h2>
          {results.modelOverview && (
            <p className="text-sm text-gray-500 mt-1 italic">{results.modelOverview}</p>
          )}
          <div className="flex gap-4 mt-2 text-gray-600 font-medium">
            <span className="bg-gray-100 px-3 py-1 rounded-lg">⏱ {results.estimatedTime}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-lg">🔨 {results.difficulty}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-lg">🧱 {totalPieces} pieces</span>
          </div>
        </div>
        <div className="flex gap-3">
          <LegoButton onClick={onReset} variant="neutral" icon={<RefreshCw size={18} />}>
            New
          </LegoButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setActiveTab('parts')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
            activeTab === 'parts'
              ? 'bg-[#E3000B] text-white shadow-lg scale-105'
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Layers size={20} /> Parts List
        </button>
        <button
          onClick={() => setActiveTab('instructions')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
            activeTab === 'instructions'
              ? 'bg-[#E3000B] text-white shadow-lg scale-105'
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <BookOpen size={20} /> Instructions
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'parts' ? (
          <motion.div
            key="parts"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[400px]"
          >
            <PartsTable pieces={results.pieces} />
          </motion.div>
        ) : (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-50 rounded-3xl shadow-xl p-4 md:p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                {results.instructions.map((step, index) => (
                  <StepCard key={step.stepNumber} step={step} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultsView;
export { ResultsView };
