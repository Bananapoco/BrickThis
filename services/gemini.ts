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
          color: { type: SchemaType.STRING },
          colorHex: { type: SchemaType.STRING },
          quantity: { type: SchemaType.NUMBER },
        },
        required: ["partId", "color", "colorHex", "quantity"],
      },
    },
    instructions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          stepNumber: { type: SchemaType.NUMBER },
          description: { type: SchemaType.STRING },
        },
        required: ["stepNumber", "description"],
      },
    },
    coverImagePrompt: {
      type: SchemaType.STRING,
      description: "Detailed prompt for Imagen to generate a cover image of the finished model",
    },
    instructionsImagePrompt: {
      type: SchemaType.STRING,
      description: "Prompt for a single image showing an exploded view or summary of the building steps",
    },
  },
  required: [
    "objectDescription",
    "colors",
    "shapes",
    "pieceList",
    "instructions",
    "coverImagePrompt",
    "instructionsImagePrompt",
  ],
};

// Gemini 3 Pro Preview model with JSON schema enforcement
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-3-pro-preview",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
  },
});

export async function analyzeImageWithGemini(imageBase64: string, partsList: string) {
  const prompt = `
You are an expert LEGO designer creating simple, stable builds (100–300 pieces) from a photo using ONLY the exact parts provided.

=== IMAGE STYLE RULES (follow these exactly) ===
Global style keyword: "LEGO_INSTRUCTION_STYLE"
Full style (use only the keyword in your output):
"Official LEGO building instructions style, clean light-blue background, white rectangular step panel with subtle shadow, isometric 3/4 view from slightly above, highly detailed realistic LEGO bricks with visible studs and subtle plastic shine, black arrows clearly showing exact placement/rotation, new parts highlighted with thin white glow, part callout boxes with quantity (e.g. '2x'), no text printed on bricks, professional printed manual look, high contrast, clean white space"

Rules for instructionsImagePrompt:
- Describe a "knolling" style layout or an exploded view of the parts and partial assembly.
- Keywords: "LEGO knolling photography, organized parts layout, white background, high contrast, top-down view"
- End with: LEGO_INSTRUCTION_STYLE

Example:
"A knolling layout of LEGO parts for a small car, organized by color and size, with a partially built chassis in the center. White background. LEGO_INSTRUCTION_STYLE"

For coverImagePrompt: Describe the finished model + end with LEGO_INSTRUCTION_STYLE

=== TASK ===
Analyze this photo of an object. Design a simple, stable LEGO build (100–300 pieces max) that resembles it, using ONLY real LEGO parts from this exact list:

${partsList}

Prioritize stability: wide base, secure connections, no floating parts. Use only parts from the list above. Do not invent part numbers or names.

Output ONLY valid JSON matching this exact schema. No extra text, no markdown, no explanations.

{
  "objectDescription": "string",
  "colors": ["string"],
  "shapes": ["string"],
  "pieceList": [
    { "partId": "string", "color": "string", "quantity": number }
  ],
  "instructionStylePrompt": "string",           // ← put the FULL style paragraph here (the one above)
  "instructions": [
    {
      "stepNumber": number,
      "description": "string"
    }
  ],
  "coverImagePrompt": "string",                 // ← finished model + LEGO_INSTRUCTION_STYLE
  "instructionsImagePrompt": "string"           // ← knolling/exploded view + LEGO_INSTRUCTION_STYLE
}

Make 5–8 steps.
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
