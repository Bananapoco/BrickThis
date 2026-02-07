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
          <div className="p-4 md:p-8">
             <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={30}
                slidesPerView={1}
                className="w-full h-full rounded-2xl"
                style={{
                    '--swiper-navigation-color': '#E3000B',
                    '--swiper-pagination-color': '#E3000B',
                } as React.CSSProperties}
            >
                {results.instructions.map((step) => (
                    <SwiperSlide key={step.stepNumber}>
                        <div className="flex flex-col md:flex-row gap-8 items-center h-full pb-12">
                            <div className="w-full md:w-1/2">
                                <img 
                                    src={step.imageUrl} 
                                    alt={`Step ${step.stepNumber}`} 
                                    className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-md border-4 border-gray-100"
                                />
                            </div>
                            <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
                                <div className="inline-block bg-[#FFD500] px-4 py-2 rounded-xl font-bold text-xl mb-2 shadow-sm">
                                    Step {step.stepNumber}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 leading-tight">
                                    {step.description}
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
                                    <p className="text-xs uppercase text-gray-400 font-bold mb-2">Pieces Needed</p>
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                        {step.piecesNeeded.map((p, idx) => (
                                            <span key={idx} className="bg-white border border-gray-200 px-2 py-1 rounded text-sm text-gray-600 shadow-sm">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
};