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
          quantity: { type: SchemaType.NUMBER },
        },
        required: ["partId", "color", "quantity"],
      },
    },
    instructions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          stepNumber: { type: SchemaType.NUMBER },
          description: { type: SchemaType.STRING },
          imagePrompt: { type: SchemaType.STRING },
        },
        required: ["stepNumber", "description", "imagePrompt"],
      },
    },
    coverImagePrompt: {
      type: SchemaType.STRING,
      description: "Detailed prompt for Imagen to generate a cover image of the finished model",
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

// Gemini 2.0 Flash is currently the recommended model for speed and multimodal tasks
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-3-pro-preview",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
  },
});

/**
 * Helper to analyze an image using Gemini and design a LEGO build
 * @param imageBase64 Base64 string of the image
 * @param partsList JSON string of the available LEGO parts
 */
export async function analyzeImageWithGemini(imageBase64: string, partsList: string) {
  const prompt = `Analyze this photo of an object. Design a simple, stable LEGO build (100-300 pieces max) that resembles it, using ONLY real LEGO parts from this exact list: ${partsList}.

Use only parts from the list above. No inventing part numbers or names. Prioritize stability: wide base, secure connections, no floating parts.

Output ONLY valid JSON matching the requested schema.

Make 5-8 clear steps. For imagePrompts, make them detailed for Imagen: e.g. 'LEGO style step showing attaching red 2x4 brick to base at center, isometric view, white background, clean'.`;

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
