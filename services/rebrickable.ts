import { getLegoColorHex } from "./legoColors";

const REBRICKABLE_API_KEY = process.env.REBRICKABLE_API_KEY;

/**
 * Fetches part image URL from Rebrickable
 * @param partNum Rebrickable part number
 * @param colorName LEGO color name
 * @returns Promise with image URL or null
 */
export async function getPartImageUrl(partNum: string, colorName: string): Promise<string | null> {
  if (!REBRICKABLE_API_KEY) {
    console.warn("REBRICKABLE_API_KEY is not defined");
    return null;
  }

  try {
    // 1. Get color ID from Rebrickable
    // Try to find an exact match first, then fall back to search
    const colorsRes = await fetch(`https://rebrickable.com/api/v3/lego/colors/?page_size=1000`, {
      headers: { 'Authorization': `key ${REBRICKABLE_API_KEY}` }
    });
    
    if (!colorsRes.ok) return null;
    const colorsData = await colorsRes.json();
    
    // Find exact match (case insensitive)
    let color = colorsData.results.find((c: any) => c.name.toLowerCase() === colorName.toLowerCase());
    
    // If no exact match, try to find a color that contains the name
    if (!color) {
      color = colorsData.results.find((c: any) => c.name.toLowerCase().includes(colorName.toLowerCase()));
    }

    const colorId = color?.id;

    if (!colorId) return null;

    // 2. Get part color info (contains image URL)
    const partRes = await fetch(`https://rebrickable.com/api/v3/lego/parts/${partNum}/colors/${colorId}/`, {
      headers: { 'Authorization': `key ${REBRICKABLE_API_KEY}` }
    });

    if (!partRes.ok) {
        // Fallback: Try just the part image if color-specific fails
        // console.log(`Color-specific image failed for ${partNum}/${colorId}, trying generic...`);
        const partGeneralRes = await fetch(`https://rebrickable.com/api/v3/lego/parts/${partNum}/`, {
            headers: { 'Authorization': `key ${REBRICKABLE_API_KEY}` }
        });
        if (!partGeneralRes.ok) {
            // console.log(`Generic image failed for ${partNum}`);
            return null;
        }
        const partGeneralData = await partGeneralRes.json();
        return partGeneralData.part_img_url || null;
    }

    const partData = await partRes.json();
    return partData.part_img_url || null;
  } catch (error) {
    console.error(`Error fetching Rebrickable image for ${partNum} in ${colorName}:`, error);
    return null;
  }
}
