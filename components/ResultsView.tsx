import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Download, Layers, BookOpen, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AnalysisResult } from '../types';
import { LegoButton } from './LegoButton';

interface ResultsViewProps {
  results: AnalysisResult;
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'instructions'>('parts');

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(227, 0, 11); // Lego Red
    doc.text('Brickify Instructions', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Difficulty: ${results.difficulty} | Time: ${results.estimatedTime}`, 20, 30);

    // Parts List
    doc.setFontSize(16);
    doc.text('Parts Needed:', 20, 45);
    
    let yPos = 55;
    results.pieces.forEach((piece) => {
      doc.setFontSize(12);
      doc.text(`- ${piece.quantity}x ${piece.color} ${piece.name}`, 20, yPos);
      yPos += 10;
    });

    // Instructions (Simplified for MVP PDF)
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Building Steps:', 20, 20);
    
    yPos = 30;
    results.instructions.forEach((step) => {
        if(yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFontSize(14);
        doc.text(`Step ${step.stepNumber}:`, 20, yPos);
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(step.description, 170);
        doc.text(splitText, 20, yPos + 7);
        yPos += 20 + (splitText.length * 5);
    });

    doc.save('my-brick-build.pdf');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Summary Header */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border-b-8 border-[#FFD500] flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Ready to Build!</h2>
          <div className="flex gap-4 mt-2 text-gray-600 font-medium">
             <span className="bg-gray-100 px-3 py-1 rounded-lg">⏱ {results.estimatedTime}</span>
             <span className="bg-gray-100 px-3 py-1 rounded-lg">🔨 {results.difficulty}</span>
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
          <BookOpen size={20} /> Steps
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[400px]">
        {activeTab === 'parts' ? (
          <div className="overflow-x-auto p-2">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 uppercase text-sm font-bold">
                <tr>
                  <th className="px-6 py-4 text-left">Color</th>
                  <th className="px-6 py-4 text-left">Part Name</th>
                  <th className="px-6 py-4 text-center">ID</th>
                  <th className="px-6 py-4 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.pieces.map((piece) => (
                  <tr key={piece.id} className="hover:bg-[#FFF9C4] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                          style={{ backgroundColor: piece.colorHex }}
                        />
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
        ) : (
          <div className="p-4 md:p-8 flex flex-col items-center">
            {/* Single Instruction Image */}
            {(results.instructionsImageUrl || results.coverImageUrl) && (
              <div className="w-full max-w-2xl mb-8">
                <img 
                  src={results.instructionsImageUrl || results.coverImageUrl} 
                  alt="LEGO Build Instructions" 
                  className="w-full h-auto object-contain rounded-2xl shadow-lg border-4 border-gray-100"
                />
              </div>
            )}
            
            {/* Simple Step-by-Step Text */}
            <div className="w-full max-w-2xl space-y-6">
              <h3 className="text-2xl font-black text-gray-800 border-b-4 border-[#FFD500] inline-block pb-1 mb-4">
                Building Steps
              </h3>
              <div className="space-y-4">
                {results.instructions.map((step) => (
                  <div key={step.stepNumber} className="flex gap-4 items-start bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="bg-[#E3000B] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm">
                      {step.stepNumber}
                    </div>
                    <p className="text-gray-700 font-medium pt-1">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};