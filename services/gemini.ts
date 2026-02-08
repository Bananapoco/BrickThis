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
          description: { type: SchemaType.STRING },
          imagePrompt: {
            type: SchemaType.STRING,
            description:
              "A prompt for FLUX image generation describing the cumulative build state at this step. Isometric view, light blue background, realistic LEGO bricks. No text, no arrows, no UI elements.",
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
        required: ["stepNumber", "description", "imagePrompt", "partsUsed"],
      },
    },
    coverImagePrompt: {
      type: SchemaType.STRING,
      description:
        "A prompt for FLUX image generation showing the completed LEGO model. Product photography, isometric 3/4 view, white background, realistic bricks with visible studs. No text.",
    },
  },
  required: [
    "objectDescription",
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
  const prompt = `
You are an expert LEGO set designer. Given a photo of an object, design a simple, stable LEGO build (50–150 pieces max) that resembles it, using ONLY parts from the provided list.

=== AVAILABLE PARTS ===
${partsList}

=== RULES ===
- Use ONLY part_num values from the list above. Do not invent parts.
- Each piece in pieceList must include the part_num, the exact name from the list, a LEGO color name, its hex code, and a quantity.
- Prioritize stability: wide base, interlocking bricks, no floating parts.
- Design 5–8 building steps. Each step should add a clear group of parts.

=== PER-STEP IMAGE PROMPTS (critical - read carefully) ===
For each instruction step, write an "imagePrompt" that describes ONLY what is VISIBLE at that step (the cumulative build so far). These prompts will be sent to an AI image generator (FLUX), so follow these rules exactly:

1. Describe the physical LEGO bricks by color, size, and position (e.g. "a green 2x4 plate on top of a blue 2x6 plate").
2. Every prompt MUST end with: "Isometric 3/4 view from slightly above. Clean light blue background. Realistic LEGO bricks with visible studs and subtle plastic shine. Studio lighting. No text, no arrows, no labels, no UI."
3. Do NOT mention step numbers, callout boxes, arrows, or any diagram elements in the prompt.
4. Each step's prompt should describe the FULL assembly up to that point, with newly added parts mentioned last.
5. Keep prompts concise (2-3 sentences max before the style suffix).

Example imagePrompt for a step:
"A partially-built LEGO frog: a green 4x6 baseplate with two yellow 2x2 slope bricks placed on the front edge. Isometric 3/4 view from slightly above. Clean light blue background. Realistic LEGO bricks with visible studs and subtle plastic shine. Studio lighting. No text, no arrows, no labels, no UI."

=== COVER IMAGE PROMPT ===
Write a "coverImagePrompt" describing the FINISHED model only. Use this style:
"A completed LEGO [object] model made of [colors] bricks. [Brief description of shape]. Product photography, isometric 3/4 view from slightly above. Clean white background. Realistic LEGO bricks with visible studs and plastic shine. Studio lighting. No text, no labels."

=== partsUsed PER STEP ===
For each step, list ONLY the parts being ADDED in that step (not cumulative). Include partId, name, color, colorHex, and quantity.

Output valid JSON matching the schema. No extra text.
`;

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
