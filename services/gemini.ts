import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  console.warn("GOOGLE_GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// Response schema for Gemini to ensure structured output
const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    objectDescription: {
      type: SchemaType.STRING,
      description: "A brief description of the object in the photo",
    },
    modelOverview: {
      type: SchemaType.STRING,
      description: "Subject name, approximate dimensions in studs (L×W×H), build direction, scale note",
    },
    colors: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Dominant LEGO colors identified",
    },
    shapes: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Main shapes identified",
    },
    pieceList: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          partId: { type: SchemaType.STRING },
          name: { type: SchemaType.STRING },
          color: { type: SchemaType.STRING },
          colorHex: { type: SchemaType.STRING },
          quantity: { type: SchemaType.NUMBER },
        },
        required: ["partId", "name", "color", "colorHex", "quantity"],
      },
    },
    instructions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          stepNumber: { type: SchemaType.NUMBER },
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          imagePrompt: {
            type: SchemaType.STRING,
            description: "A prompt for FLUX image generation describing the cumulative build state at this step.",
          },
          partsUsed: {
            type: SchemaType.ARRAY,
            description: "The parts added in THIS step only",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                partId: { type: SchemaType.STRING },
                name: { type: SchemaType.STRING },
                color: { type: SchemaType.STRING },
                colorHex: { type: SchemaType.STRING },
                quantity: { type: SchemaType.NUMBER },
              },
              required: ["partId", "name", "color", "quantity"],
            },
          },
        },
        required: ["stepNumber", "title", "description", "imagePrompt", "partsUsed"],
      },
    },
    coverImagePrompt: {
      type: SchemaType.STRING,
      description: "A prompt for FLUX image generation showing the completed LEGO model.",
    },
  },
  required: [
    "objectDescription",
    "modelOverview",
    "colors",
    "shapes",
    "pieceList",
    "instructions",
    "coverImagePrompt",
  ],
};

// Gemini model with JSON schema enforcement
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-3-pro-preview",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
  },
});

export async function analyzeImageWithGemini(imageBase64: string, partsList: string) {
  const prompt = `You are a world-class LEGO set designer and instruction manual author. Given the photo, design a buildable LEGO model that faithfully represents the subject using ONLY parts from the catalog below.

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

Output valid JSON matching the schema. No extra text.`;

  const result = await geminiModel.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBase64.split(",")[1] || imageBase64,
        mimeType: "image/jpeg",
      },
    },
  ]);

  return result.response.text();
}
