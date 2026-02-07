import { AnalysisResult } from '../types';

export const analyzeImage = async (imageBlob: Blob): Promise<AnalysisResult> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2500));

  return {
    status: 'success',
    estimatedTime: '45 mins',
    difficulty: 'Medium',
    pieces: [
      { id: '1', name: '2x4 Brick', color: 'Yellow', colorHex: '#FFD500', quantity: 12, partNumber: '3001' },
      { id: '2', name: '2x2 Brick', color: 'Red', colorHex: '#E3000B', quantity: 8, partNumber: '3003' },
      { id: '3', name: '1x2 Plate', color: 'White', colorHex: '#FFFFFF', quantity: 24, partNumber: '3023' },
      { id: '4', name: '1x1 Brick', color: 'Blue', colorHex: '#0055BF', quantity: 6, partNumber: '3005' },
      { id: '5', name: '2x3 Brick', color: 'Black', colorHex: '#000000', quantity: 4, partNumber: '3002' },
    ],
    instructions: [
      {
        stepNumber: 1,
        description: 'Start with the base using 2x4 Yellow bricks.',
        imageUrl: 'https://picsum.photos/400/300?random=1',
        piecesNeeded: ['2x4 Brick'],
      },
      {
        stepNumber: 2,
        description: 'Add the red structural supports in the corners.',
        imageUrl: 'https://picsum.photos/400/300?random=2',
        piecesNeeded: ['2x2 Brick'],
      },
      {
        stepNumber: 3,
        description: 'Layer the white plates for stability.',
        imageUrl: 'https://picsum.photos/400/300?random=3',
        piecesNeeded: ['1x2 Plate'],
      },
      {
        stepNumber: 4,
        description: 'Finish the details with blue and black bricks.',
        imageUrl: 'https://picsum.photos/400/300?random=4',
        piecesNeeded: ['1x1 Brick', '2x3 Brick'],
      },
      {
        stepNumber: 5,
        description: 'Your creation is complete!',
        imageUrl: 'https://picsum.photos/400/300?random=5',
        piecesNeeded: [],
      },
    ]
  };
};