import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Layers, BookOpen, RefreshCw, Package } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AnalysisResult, InstructionStep } from '../types';
import { LegoButton } from './LegoButton';

interface ResultsViewProps {
  results: AnalysisResult;
  onReset: () => void;
}

/** Small callout box showing parts added in a step */
const PartsCallout: React.FC<{ step: InstructionStep }> = ({ step }) => {
  if (!step.partsUsed || step.partsUsed.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-2 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {step.partsUsed.map((part, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-6 h-6 rounded-sm border border-gray-300 shrink-0 bg-no-repeat bg-contain bg-center"
              style={{ 
                backgroundColor: part.colorHex || '#CCCCCC',
                // We don't have imageUrl on StepPart yet, but we can add it or just use color for now
                // Actually, let's just keep the color square for the tiny callout to keep it clean
              }}
            />
            <span className="font-bold text-gray-700">{part.quantity}x</span>
            <span className="text-gray-500 truncate max-w-[100px]">{part.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Individual step card in the instruction grid */
const StepCard: React.FC<{ step: InstructionStep; index: number }> = ({ step, index }) => {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      {/* Step number banner */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-[#E3000B] text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm">
            {step.stepNumber}
          </div>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Step {step.stepNumber}
          </span>
        </div>
      </div>

      {/* Step image */}
      <div className="aspect-square bg-[#C3E1F0] flex items-center justify-center p-2">
        {step.imageUrl ? (
          <img
            src={step.imageUrl}
            alt={`Step ${step.stepNumber}`}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
            <Package size={32} />
            <span className="text-xs font-medium">Generating...</span>
          </div>
        )}
      </div>

      {/* Parts callout + description */}
      <div className="p-3 space-y-2">
        <PartsCallout step={step} />
        <p className="text-sm text-gray-700 font-medium leading-snug">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'instructions'>('parts');

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(227, 0, 11);
    doc.text('Brickify Instructions', 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Difficulty: ${results.difficulty} | Time: ${results.estimatedTime}`, 20, 30);

    // Parts List
    doc.setFontSize(16);
    doc.text('Parts Needed:', 20, 45);

    let yPos = 55;
    results.pieces.forEach((piece) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(12);
      doc.text(`- ${piece.quantity}x ${piece.color} ${piece.name} (${piece.partNumber})`, 20, yPos);
      yPos += 8;
    });

    // Instructions
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Building Steps:', 20, 20);

    yPos = 30;
    results.instructions.forEach((step) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(227, 0, 11);
      doc.text(`Step ${step.stepNumber}`, 20, yPos);
      doc.setFontSize(11);
      doc.setTextColor(0);

      // Parts used in this step
      if (step.partsUsed && step.partsUsed.length > 0) {
        const partsLine = step.partsUsed.map((p) => `${p.quantity}x ${p.color} ${p.name}`).join(', ');
        const splitParts = doc.splitTextToSize(`Parts: ${partsLine}`, 170);
        doc.text(splitParts, 20, yPos + 6);
        yPos += 6 + splitParts.length * 5;
      }

      const splitText = doc.splitTextToSize(step.description, 170);
      doc.text(splitText, 20, yPos + 6);
      yPos += 14 + splitText.length * 5;
    });

    doc.save('my-brick-build.pdf');
  };

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
          <div className="relative">
            <img
              src={results.coverImageUrl}
              alt="Your LEGO Build"
              className="w-full h-auto object-contain max-h-[420px] bg-gray-50"
            />
            {/* Branding overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h2 className="text-white text-2xl md:text-3xl font-black drop-shadow-lg">
                BRICKIFY
              </h2>
              <p className="text-white/80 text-sm font-medium mt-1">
                {results.pieces.reduce((acc, p) => acc + p.quantity, 0)} pieces
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
          <div className="flex gap-4 mt-2 text-gray-600 font-medium">
            <span className="bg-gray-100 px-3 py-1 rounded-lg">⏱ {results.estimatedTime}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-lg">🔨 {results.difficulty}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-lg">
              🧱 {results.pieces.reduce((acc, p) => acc + p.quantity, 0)} pieces
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <LegoButton onClick={generatePDF} variant="secondary" icon={<Download size={18} />}>
            PDF
          </LegoButton>
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
            <div className="overflow-x-auto p-2">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-500 uppercase text-sm font-bold">
                  <tr>
                    <th className="px-6 py-4 text-left">Color</th>
                    <th className="px-6 py-4 text-left">Part Name</th>
                    <th className="px-6 py-4 text-center">ID</th>
                    <th className="px-6 py-4 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.pieces.map((piece) => (
                    <tr key={piece.id} className="hover:bg-[#FFF9C4] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {piece.imageUrl ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0 bg-white">
                              <img 
                                src={piece.imageUrl} 
                                alt={piece.name}
                                className="w-full h-full object-contain" 
                                style={{
                                  filter: 'grayscale(100%) brightness(1.1) contrast(1.1)',
                                }}
                              />
                              <div 
                                className="absolute inset-0 mix-blend-multiply" 
                                style={{ backgroundColor: piece.colorHex }} 
                              />
                            </div>
                          ) : (
                            <div
                              className="w-12 h-12 rounded-lg border border-gray-300 shadow-sm shrink-0"
                              style={{ backgroundColor: piece.colorHex }}
                            />
                          )}
                          <span className="font-medium text-gray-700">{piece.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">{piece.name}</td>
                      <td className="px-6 py-4 text-center text-gray-400 font-mono text-xs">{piece.partNumber}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="bg-gray-100 text-gray-800 font-bold px-3 py-1 rounded-lg">
                          x{piece.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* LEGO Manual-Style Instruction Grid */}
            <div className="bg-[#C3E1F0] rounded-3xl shadow-xl p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
