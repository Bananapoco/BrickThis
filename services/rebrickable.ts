const REBRICKABLE_API_KEY = process.env.REBRICKABLE_API_KEY;

// Cache the colors list so we only fetch it once per server lifecycle
let cachedColors: { id: number; name: string }[] | null = null;

async function getColorsList(): Promise<{ id: number; name: string }[]> {
  if (cachedColors) return cachedColors;

  if (!REBRICKABLE_API_KEY) return [];

  try {
    const res = await fetch(`https://rebrickable.com/api/v3/lego/colors/?page_size=200`, {
      headers: { Authorization: `key ${REBRICKABLE_API_KEY}` },
    });
    if (!res.ok) {
      console.warn(`Rebrickable colors fetch failed: ${res.status}`);
      return [];
    }
    const data = await res.json();
    cachedColors = data.results.map((c: any) => ({ id: c.id, name: c.name }));
    console.log(`✅ Cached ${cachedColors!.length} Rebrickable colors`);
    return cachedColors!;
  } catch (err) {
    console.error("Failed to fetch Rebrickable colors:", err);
    return [];
  }
}

/**
 * Finds Rebrickable color ID from a LEGO color name.
 */
function findColorId(colors: { id: number; name: string }[], colorName: string): number | null {
  const lower = colorName.toLowerCase();

  // Exact match
  const exact = colors.find((c) => c.name.toLowerCase() === lower);
  if (exact) return exact.id;

  // Contains match
  const partial = colors.find(
    (c) => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
  );
  if (partial) return partial.id;

  return null;
}

/**
 * Fetches part image URL from Rebrickable.
 * Tries: color-specific image -> generic part image -> null
 */
export async function getPartImageUrl(
  partNum: string,
  colorName: string
): Promise<string | null> {
  if (!REBRICKABLE_API_KEY) {
    console.warn("REBRICKABLE_API_KEY is not defined");
    return null;
  }

  try {
    const colors = await getColorsList();
    const colorId = findColorId(colors, colorName);

    // Try color-specific image first
    if (colorId !== null) {
      try {
        const partRes = await fetch(
          `https://rebrickable.com/api/v3/lego/parts/${partNum}/colors/${colorId}/`,
          { headers: { Authorization: `key ${REBRICKABLE_API_KEY}` } }
        );
        if (partRes.ok) {
          const partData = await partRes.json();
          if (partData.part_img_url) {
            return partData.part_img_url;
          }
        }
      } catch {
        // Fall through to generic
      }
    }

    // Fallback: generic part image (no specific color)
    try {
      const partGeneralRes = await fetch(
        `https://rebrickable.com/api/v3/lego/parts/${partNum}/`,
        { headers: { Authorization: `key ${REBRICKABLE_API_KEY}` } }
      );
      if (partGeneralRes.ok) {
        const partGeneralData = await partGeneralRes.json();
        if (partGeneralData.part_img_url) {
          return partGeneralData.part_img_url;
        }
      }
    } catch {
      // Fall through
    }

    return null;
  } catch (error) {
    console.error(`Error fetching Rebrickable image for ${partNum} in ${colorName}:`, error);
    return null;
  }
}
