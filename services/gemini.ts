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
You are an expert at designing simple, stable LEGO builds from photos using only real parts.

Global LEGO manual image style (output this exactly once as the field "instructionStylePrompt"):
"Official LEGO building instructions style, clean light-blue background, white rectangular step panel with subtle shadow, isometric 3/4 view from slightly above, highly detailed realistic LEGO bricks with visible studs and subtle plastic shine, black arrows clearly showing exact placement/rotation, new parts highlighted with thin white glow, part callout boxes with quantity (e.g. '2x'), no text printed on bricks, professional printed manual look, high contrast, clean white space"

For EVERY imagePrompt in "instructions":
- First describe the FULL current state of the model so far (summarize all pieces added in previous steps, including colors and positions where relevant).
- Then describe exactly what NEW pieces are being added this step (with color, part name/number from the list, and precise position/attachment).
- End with the global style description above (copy-paste it verbatim).
- Make prompts detailed enough for high-quality image generation (e.g., specify isometric view, arrows, highlights on new parts).

Example for a step: "The model so far has a green 4x6 baseplate with two white 2x4 plates in the center and a central green 2x4 brick. Now adding four green 2x2 bricks around the core and two blue 1x2 tiles on the side brackets to form flank stripes. Official LEGO building instructions style, clean light-blue background... [full style]"

For the coverImagePrompt: Describe the fully finished model in the same global style.

Analyze this photo of an object. Design a simple, stable LEGO build (100–300 pieces max) that resembles it, using ONLY real LEGO parts from this exact list: ${partsList}.

Use only parts from the list above. No inventing part numbers or names. Prioritize stability: wide base, secure connections, no floating parts.

For each piece in pieceList, include the colorHex field with the hex color code (e.g., "#E3000B" for Red, "#0055BF" for Blue, "#FFD500" for Yellow, "#FFFFFF" for White, "#000000" for Black, etc.). Use standard LEGO color hex codes.

Output ONLY valid JSON matching this exact schema:

{
  "objectDescription": "string",           // Brief description of the object and LEGO model
  "colors": ["string"],                    // Dominant LEGO colors used
  "shapes": ["string"],                    // Main shapes identified
  "pieceList": [
    { "partId": "string", "color": "string", "colorHex": "string", "quantity": number }
  ],
  "instructionStylePrompt": "string",      // The global style string
  "instructions": [
    {
      "stepNumber": number,
      "description": "string",             // Clear building instruction text
      "imagePrompt": "string"              // Detailed cumulative prompt as described above
    }
  ],
  "coverImagePrompt": "string"             // Prompt for finished model cover image
}

Make 5–8 clear steps. Output NOTHING else — no explanations, no markdown, just the JSON.
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