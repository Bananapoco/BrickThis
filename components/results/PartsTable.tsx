import React from 'react';
import { Package } from 'lucide-react';
import { Piece } from '../../types';

interface PartsTableProps {
  pieces: Piece[];
}

const FALLBACK_SVG = '<div class="w-full h-full flex items-center justify-center text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>';

const PartRow: React.FC<{ piece: Piece }> = React.memo(({ piece }) => (
  <tr className="hover:bg-[#FFF9C4] transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        {piece.imageUrl ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0 bg-white">
            <img 
              src={piece.imageUrl} 
              alt={piece.name}
              loading="lazy"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = FALLBACK_SVG;
              }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg border border-gray-300 shadow-sm shrink-0 bg-gray-100 flex items-center justify-center text-gray-400">
            <Package size={20} />
          </div>
        )}
        <div
          className="w-10 h-10 rounded-md border-2 border-gray-200 shadow-sm shrink-0"
          style={{ backgroundColor: piece.colorHex }}
          title={piece.color}
        />
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
));

PartRow.displayName = 'PartRow';

const PartsTable: React.FC<PartsTableProps> = ({ pieces }) => {
  return (
    <div className="overflow-x-auto p-2">
      <table className="w-full">
        <thead className="bg-gray-50 text-gray-500 uppercase text-sm font-bold">
          <tr>
            <th className="px-6 py-4 text-left">Part & Color</th>
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-center">ID</th>
            <th className="px-6 py-4 text-right">Qty</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pieces.map((piece) => (
            <PartRow key={piece.id} piece={piece} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(PartsTable);
