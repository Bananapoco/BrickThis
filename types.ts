export interface Piece {
  id: string;
  name: string;
  color: string;
  colorHex: string;
  quantity: number;
  partNumber: string;
  imageUrl?: string;
}

export interface StepPart {
  partId: string;
  name: string;
  color: string;
  colorHex?: string;
  quantity: number;
}

export interface InstructionStep {
  stepNumber: number;
  title?: string;            // Short descriptive title (e.g. "Leaf Base Platform")
  description: string;
  imageUrl?: string;         // AI-generated image of assembly at this step
  partsUsed?: StepPart[];    // Parts added in this step (for callout boxes)
}

export interface AnalysisResult {
  status: string;
  pieces: Piece[];
  instructions: InstructionStep[];
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  modelOverview?: string;    // Scale, dimensions, build direction summary
  coverImageUrl?: string;
}

export type AppState = 'home' | 'camera' | 'editing' | 'processing' | 'results';
