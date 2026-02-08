import { AnalysisResult } from '../types';
import { getLegoColorHex } from './legoColors';

export const analyzeImage = async (imageBlob: Blob): Promise<AnalysisResult> => {
  try {
    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageBlob);
    });

    const base64Image = await base64Promise;

    // Call our real API
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze image');
    }

    const data = await response.json();

    // Map Claude Opus response to our frontend AnalysisResult type
    const totalPieces = data.pieceList.reduce((acc: number, p: any) => acc + p.quantity, 0);
    return {
      status: 'success',
      estimatedTime: `${Math.ceil(totalPieces * 0.5)} mins`,
      difficulty: totalPieces > 100 ? 'Hard' : totalPieces > 50 ? 'Medium' : 'Easy',
      modelOverview: data.modelOverview || undefined,
      pieces: data.pieceList.map((p: any, index: number) => ({
        id: String(index + 1),
        name: p.name || `Part ${p.partId}`,
        color: p.color,
        colorHex: p.colorHex || getLegoColorHex(p.color),
        quantity: p.quantity,
        partNumber: p.partId,
        imageUrl: p.imageUrl,
      })),
      instructions: data.instructions.map((s: any) => ({
        stepNumber: s.stepNumber,
        title: s.title || undefined,
        description: s.description,
        imageUrl: s.imageUrl || undefined,
        partsUsed: (s.partsUsed || []).map((p: any) => ({
          partId: p.partId,
          name: p.name || `Part ${p.partId}`,
          color: p.color,
          colorHex: p.colorHex || getLegoColorHex(p.color),
          quantity: p.quantity,
        })),
      })),
      coverImageUrl: data.coverImageUrl,
    };
  } catch (error) {
    console.error("Error in analyzeImage:", error);
    throw error;
  }
};
