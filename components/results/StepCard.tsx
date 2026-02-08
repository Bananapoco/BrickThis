import React from 'react';
import { motion } from 'framer-motion';
import { InstructionStep } from '../../types';
import PartsCallout from './PartsCallout';

interface StepCardProps {
  step: InstructionStep;
  index: number;
}

const StepCard: React.FC<StepCardProps> = ({ step, index }) => {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      {/* Step number + title banner */}
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-[#E3000B] text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-sm">
            {step.stepNumber}
          </div>
          <div>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">
              Step {step.stepNumber}
            </span>
            {step.title && (
              <h3 className="text-base font-bold text-gray-800 leading-tight">
                {step.title}
              </h3>
            )}
          </div>
        </div>
      </div>

      {/* Step image — LEGO instruction diagram style */}
      {step.imageUrl && (
        <div className="bg-[#D4E8F7] flex justify-center p-6">
          <img
            src={step.imageUrl}
            alt={`Step ${step.stepNumber}${step.title ? ` — ${step.title}` : ''}`}
            loading="lazy"
            className="w-full max-w-[480px] h-auto object-contain rounded-lg"
          />
        </div>
      )}

      {/* Parts callout + description */}
      <div className="p-5 space-y-4 flex-grow">
        <PartsCallout step={step} />
        <div className="text-base text-gray-800 font-medium leading-relaxed whitespace-pre-line">
          {step.description}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(StepCard);
