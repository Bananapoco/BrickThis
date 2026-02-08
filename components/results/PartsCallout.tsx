import React from 'react';
import { InstructionStep } from '../../types';

const PartsCallout: React.FC<{ step: InstructionStep }> = ({ step }) => {
  if (!step.partsUsed || step.partsUsed.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-3 shadow-sm">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Parts for this step</p>
      <div className="flex flex-wrap gap-2">
        {step.partsUsed.map((part, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs bg-white rounded-lg px-2 py-1 border border-gray-100">
            <div
              className="w-5 h-5 rounded-sm border border-gray-300 shrink-0"
              style={{ backgroundColor: part.colorHex || '#CCCCCC' }}
            />
            <span className="font-bold text-gray-700">{part.quantity}x</span>
            <span className="text-gray-500 truncate max-w-[120px]">{part.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(PartsCallout);
