import { AnalysisResult } from '../types';

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

    // Map Gemini response to our frontend AnalysisResult type
    return {
      status: 'success',
      estimatedTime: `${Math.ceil(data.pieceList.reduce((acc: number, p: any) => acc + p.quantity, 0) * 0.5)} mins`,
      difficulty: data.pieceList.length > 50 ? 'Hard' : data.pieceList.length > 20 ? 'Medium' : 'Easy',
      pieces: data.pieceList.map((p: any, index: number) => ({
        id: String(index + 1),
        name: `Part ${p.partId}`,
        color: p.color,
        colorHex: p.colorHex || '#CCCCCC', // Use hex from API response
        quantity: p.quantity,
        partNumber: p.partId,
      })),
      instructions: data.instructions.map((s: any) => ({
        stepNumber: s.stepNumber,
        description: s.description,
        imageUrl: 'https://picsum.photos/400/300', // Placeholder until Imagen is integrated
        piecesNeeded: [], // Gemini doesn't explicitly list pieces per step in the current schema
      })),
    };
  } catch (error) {
    console.error("Error in analyzeImage:", error);
    throw error;
  }
};
