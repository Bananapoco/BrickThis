import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("ANTHROPIC_API_KEY is not defined in environment variables");
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

/**
 * Analyzes an image with Claude Opus and generates detailed LEGO build instructions.
 * Returns raw JSON text that the caller should parse.
 *
 * @param imageBase64 - Base64-encoded image (data URL or raw base64)
 * @param partsList  - JSON string of available LEGO parts catalog
 */
export async function analyzeImageWithClaude(
  imageBase64: string,
  partsList: string
): Promise<string> {
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  // Detect media type from data URL prefix, default to jpeg
  let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" =
    "image/jpeg";
  if (imageBase64.startsWith("data:image/png")) mediaType = "image/png";
  else if (imageBase64.startsWith("data:image/webp")) mediaType = "image/webp";
  else if (imageBase64.startsWith("data:image/gif")) mediaType = "image/gif";

  const prompt = `You are a world-class LEGO set designer and instruction manual author. Given the photo above, design a buildable LEGO model that faithfully represents the subject using ONLY parts from the catalog below.

=== AVAILABLE PARTS CATALOG ===
${partsList}

=== DESIGN PARAMETERS ===
- Scale: Determine based on image (Example: A frog photo would be about 4 inches)
- Total piece count: 50–150 pieces
- Build direction: bottom to top
- Exactly 6 building steps
- Prioritize structural stability: wide base, interlocking layers, staggered bonds, no floating parts
- Use ONLY part_id values from the catalog above. NEVER invent parts.
- Choose LEGO colors that best match the subject in the photo

=== INSTRUCTION DETAIL LEVEL (CRITICAL) ===
Your instructions must be extraordinarily detailed — the quality that made real LEGO manuals legendary. For EACH step:
- Reference specific part IDs in parentheses, e.g. "Place two 2×6 Plates (3795) parallel..."
- Describe exact stud positions and orientations
- Explain structural reasoning (why parts go where they do)
- Use sub-assembly instructions when needed (e.g. "Sub-assembly A — build 2×, mirrored")
- Minimum 4–10 sentences per step
- Describe layers, offsets, and interlocking patterns

Here is an example of the expected detail level for ONE step:
"Layer 1 (structural core): Place two 2×6 Plates (3795) parallel, long edges touching, forming a 4×6 stud rectangle. Attach the 1×8 Plate (3460) lengthwise as a spine down the center, extending 2 studs beyond the front. Add one 2×4 Plate (3020) overlapping the front and one at the rear to extend the leaf to ~14 studs long.
Layer 2 (stagger bond): Offset the second layer by 1 stud for strength. Place two 2×3 Plates (3021) across the center width. Use 1×6 Plates (3666) along each side. Place 2×2 Corner Plates (2420) at the front tip and rear corners, rotated to create an organic tapered shape."

=== IMAGE PROMPT RULES (for FLUX AI image generation) ===

STEP IMAGE PROMPTS — These must look like pages from an official LEGO instruction manual:
- Technical illustration style, NOT a photograph
- Isometric 3/4 view from slightly above, clean light blue background (#D4E8F7)
- The CUMULATIVE partially-built LEGO model (everything assembled so far) shown in the lower center
- Bricks should be rendered as clean, solid-colored LEGO pieces with visible studs and clean black outlines
- The new pieces being added in THIS step should appear slightly separated/floating above where they attach, with a thin black arrow pointing down to show placement
- A small rectangular callout box in the upper portion shows the individual new parts for this step, each labeled with a small number (1, 2, etc.)
- The step number appears as a large bold number in the upper-left corner
- Clean, minimal style — no text descriptions, no realistic lighting, no shadows beyond simple drop shadows
- Think: official LEGO instruction booklet illustration, vector-like rendering, flat shading

Step imagePrompt format:
"LEGO instruction manual technical diagram, step [N]. [2-3 sentences describing the cumulative build state and which new colored pieces are being added and where]. The new pieces float slightly above their attachment points with small black arrows indicating placement. A rectangular callout box in the upper area shows the new parts numbered sequentially. Large bold step number [N] in the upper left. Isometric 3/4 view from slightly above. Clean light blue background. Clean flat-shaded LEGO bricks with visible studs and thin black outlines. Official LEGO instruction booklet style, technical illustration, vector-like rendering. No realistic lighting, no text descriptions."

COVER IMAGE PROMPT — This should be a polished product shot of the finished model:

Cover "coverImagePrompt" format:
"[3-5 sentences describing the COMPLETED LEGO model in full detail — colors, textures, distinctive features, overall shape]. Product photography, isometric 3/4 view from slightly above. Clean white background. Realistic LEGO bricks with visible studs and plastic shine. Studio lighting. No text, no labels."

=== OUTPUT FORMAT ===
Return ONLY a single JSON object (no markdown, no code fences, no explanation) with this exact structure:

{
  "objectDescription": "Brief description of what the photo shows",
  "modelOverview": "Subject name, approximate dimensions in studs (L×W×H), build direction, scale note",
  "colors": ["Array of LEGO color names used in the build"],
  "shapes": ["Main geometric shapes identified in the subject"],
  "pieceList": [
    {
      "partId": "3023",
      "name": "1×2 Plate",
      "color": "Bright Green",
      "colorHex": "#4CAF50",
      "quantity": 4
    }
  ],
  "instructions": [
    {
      "stepNumber": 1,
      "title": "Short descriptive title for this step",
      "description": "EXTREMELY detailed building instructions (see detail level above).",
      "partsUsed": [
        {
          "partId": "3795",
          "name": "2×6 Plate",
          "color": "Dark Green",
          "colorHex": "#1B5E20",
          "quantity": 2
        }
      ],
      "imagePrompt": "A FLUX-compatible prompt describing the cumulative build at this step..."
    }
  ],
  "coverImagePrompt": "A FLUX-compatible prompt for the finished model..."
}

=== COLOR HEX VALUES ===
Use standard LEGO color names with accurate hex codes. Common ones:
White: #FFFFFF, Black: #000000, Red: #E3000B, Blue: #0055BF,
Yellow: #FFD500, Dark Green: #184632, Bright Green: #4B9F4A, Orange: #FF6900,
Dark Orange: #A95500, Light Gray: #9C9C9C, Dark Gray: #6B5A5A,
Tan: #D4A574, Brown: #583927, Reddish Brown: #6C3B2A,
Bright Light Orange: #F9BA61, Lime: #C2DAB8, Medium Blue: #0055BF,
Dark Blue: #0A3463, Sand Green: #7C9051, Nougat: #D09168

Output ONLY the JSON object. No markdown fences, no extra text.`;

  console.log("🧠 Sending image to Claude Opus for analysis...");

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  // Extract text from the response
  const textBlock = message.content.find((block) => block.type === "text");
  const rawText = textBlock && "text" in textBlock ? textBlock.text : "";

  console.log(`✅ Claude Opus response received (${rawText.length} chars)`);
  console.log(`   Stop reason: ${message.stop_reason}`);
  console.log(
    `   Usage: ${message.usage.input_tokens} input / ${message.usage.output_tokens} output tokens`
  );

  return rawText;
}
