/**
 * LEGO Color Name to Hex Code Mapping
 * Based on official LEGO color palette
 */
export const legoColorMap: Record<string, string> = {
  // Common colors
  'White': '#FFFFFF',
  'Black': '#000000',
  'Red': '#E3000B',
  'Blue': '#0055BF',
  'Yellow': '#FFD500',
  'Green': '#237841',
  'Orange': '#FF6900',
  'Brown': '#583927',
  'Tan': '#D4A574',
  'Light Gray': '#9C9C9C',
  'Dark Gray': '#6B5A5A',
  'Light Blue': '#B4D2E3',
  'Dark Blue': '#0A3463',
  'Light Green': '#A4BD47',
  'Dark Green': '#184632',
  'Pink': '#FFB7D5',
  'Purple': '#6B327C',
  'Lime': '#C2DAB8',
  'Magenta': '#C870A0',
  'Nougat': '#D09168',
  'Medium Nougat': '#AA7D55',
  'Dark Nougat': '#7C503F',
  'Light Nougat': '#E5C29F',
  'Sand Yellow': '#958A73',
  'Sand Blue': '#5F9BD1',
  'Sand Green': '#7C9051',
  'Dark Red': '#A42834',
  'Dark Orange': '#A95500',
  'Bright Light Orange': '#F9BA61',
  'Bright Light Blue': '#9FC3E9',
  'Bright Light Yellow': '#FFF03A',
  'Bright Pink': '#FF4C9B',
  'Bright Purple': '#81007B',
  'Bright Red': '#C91A09',
  'Bright Blue': '#0E68AB',
  'Bright Yellow': '#F2CD37',
  'Bright Green': '#4B9F4A',
  'Transparent': '#FCFCFC',
  'Transparent Red': '#C91A09',
  'Transparent Blue': '#0E68AB',
  'Transparent Yellow': '#F2CD37',
  'Transparent Green': '#4B9F4A',
  'Transparent Orange': '#FF6900',
  'Transparent Purple': '#81007B',
  'Metallic Gold': '#DBAC34',
  'Metallic Silver': '#898788',
  'Pearl Gold': '#AA7F2E',
  'Pearl Silver': '#898788',
  'Chrome Gold': '#BBA53D',
  'Chrome Silver': '#E8E8E8',
  'Copper': '#B46A00',
  'Pearl White': '#F2F3F2',
  'Pearl Light Gray': '#9C9C9C',
  'Pearl Dark Gray': '#6B5A5A',
  'Pearl Blue': '#68C3E2',
  'Pearl Green': '#4C9156',
  'Pearl Red': '#C91A09',
  'Pearl Yellow': '#F2CD37',
  'Pearl Orange': '#FF6900',
  'Pearl Pink': '#FF4C9B',
  'Pearl Purple': '#81007B',
  'Pearl Brown': '#583927',
  'Pearl Black': '#000000',
  'Pearl Light Blue': '#B4D2E3',
  'Pearl Dark Blue': '#0A3463',
  'Pearl Light Green': '#A4BD47',
  'Pearl Dark Green': '#184632',
  'Pearl Lime': '#C2DAB8',
  'Pearl Magenta': '#C870A0',
  'Pearl Nougat': '#D09168',
  'Pearl Medium Nougat': '#AA7D55',
  'Pearl Dark Nougat': '#7C503F',
  'Pearl Light Nougat': '#E5C29F',
  'Pearl Sand Yellow': '#958A73',
  'Pearl Sand Blue': '#5F9BD1',
  'Pearl Sand Green': '#7C9051',
  'Pearl Dark Red': '#A42834',
  'Pearl Dark Orange': '#A95500',
  'Pearl Bright Light Orange': '#F9BA61',
  'Pearl Bright Light Blue': '#9FC3E9',
  'Pearl Bright Light Yellow': '#FFF03A',
  'Pearl Bright Pink': '#FF4C9B',
  'Pearl Bright Purple': '#81007B',
  'Pearl Bright Red': '#C91A09',
  'Pearl Bright Blue': '#0E68AB',
  'Pearl Bright Yellow': '#F2CD37',
  'Pearl Bright Green': '#4B9F4A',
  'Pearl Transparent': '#FCFCFC',
  'Pearl Transparent Red': '#C91A09',
  'Pearl Transparent Blue': '#0E68AB',
  'Pearl Transparent Yellow': '#F2CD37',
  'Pearl Transparent Green': '#4B9F4A',
  'Pearl Transparent Orange': '#FF6900',
  'Pearl Transparent Purple': '#81007B',
  'Pearl Metallic Gold': '#DBAC34',
  'Pearl Metallic Silver': '#898788',
  'Pearl Chrome Gold': '#BBA53D',
  'Pearl Chrome Silver': '#E8E8E8',
  'Pearl Copper': '#B46A00',
  // Additional common variations (no duplicates of entries above)
  'Grey': '#9C9C9C',
  'Gray': '#9C9C9C',
  'Light Grey': '#9C9C9C',
  'Dark Grey': '#6B5A5A',
  'Medium Stone Grey': '#9C9C9C',
  'Dark Stone Grey': '#6B5A5A',
  'Very Light Orange': '#F9BA61',
  'Light Orange': '#FFA500',
  'Medium Orange': '#FF6900',
  'Very Light Blue': '#B4D2E3',
  'Medium Blue': '#0055BF',
  'Very Light Grey': '#E8E8E8',
  'Very Light Bluish Grey': '#E8E8E8',
  'Medium Bluish Grey': '#9C9C9C',
  'Dark Bluish Grey': '#6B5A5A',
  'Very Light Green': '#C2DAB8',
  'Medium Green': '#237841',
  'Very Light Yellow': '#FFF03A',
  'Medium Yellow': '#FFD500',
  'Dark Yellow': '#F2CD37',
  'Very Light Red': '#FF4C9B',
  'Medium Red': '#E3000B',
  'Very Light Purple': '#C870A0',
  'Medium Purple': '#6B327C',
  'Dark Purple': '#81007B',
  'Very Light Pink': '#FFB7D5',
  'Medium Pink': '#FF4C9B',
  'Dark Pink': '#C870A0',
  'Very Light Brown': '#D4A574',
  'Medium Brown': '#583927',
  'Dark Brown': '#7C503F',
  'Very Light Nougat': '#E5C29F',
  'Very Light Sand Yellow': '#D4A574',
  'Medium Sand Yellow': '#958A73',
  'Dark Sand Yellow': '#7C503F',
  'Very Light Sand Blue': '#B4D2E3',
  'Medium Sand Blue': '#5F9BD1',
  'Dark Sand Blue': '#0A3463',
  'Very Light Sand Green': '#C2DAB8',
  'Medium Sand Green': '#7C9051',
  'Dark Sand Green': '#184632',
};

/**
 * Get hex color code for a LEGO color name
 * Returns a default gray if color not found
 */
export function getLegoColorHex(colorName: string): string {
  // Try exact match first
  if (legoColorMap[colorName]) {
    return legoColorMap[colorName];
  }
  
  // Try case-insensitive match
  const lowerColorName = colorName.toLowerCase();
  for (const [key, value] of Object.entries(legoColorMap)) {
    if (key.toLowerCase() === lowerColorName) {
      return value;
    }
  }
  
  // Try partial match (e.g., "Red" matches "Bright Red")
  for (const [key, value] of Object.entries(legoColorMap)) {
    if (key.toLowerCase().includes(lowerColorName) || lowerColorName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Default fallback
  return '#CCCCCC';
}
