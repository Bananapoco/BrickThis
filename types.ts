export interface Piece {
  id: string;
  name: string;
  color: string;
  colorHex: string;
  quantity: number;
  partNumber: string;
}

export interface InstructionStep {
  stepNumber: number;
  description: string;
  imageUrl: string; // Placeholder for step visualization
  piecesNeeded: string[];
}

export interface AnalysisResult {
  status: string;
  pieces: Piece[];
  instructions: InstructionStep[];
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export type AppState = 'home' | 'camera' | 'editing' | 'processing' | 'results';