import Replicate from "replicate";

if (!process.env.REPLICATE_API_KEY) {
  console.warn("REPLICATE_API_KEY is not defined in environment variables");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || "",
});

/**
 * Generates an image using Replicate's prunaai/flux.1-dev model
 * @param prompt The prompt for image generation
 * @returns The URL of the generated image
 */
export async function generateImageWithReplicate(prompt: string): Promise<string> {
  console.log(`\n=== Replicate Image Generation Started ===`);
  console.log(`Prompt: ${prompt}`);

  try {
    const output = await replicate.run(
      "prunaai/flux.1-dev",
      {
        input: {
          prompt: prompt,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          safety_tolerance: 2
        }
      }
    );

    // Replicate returns an array of URLs or a single URL depending on the model
    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    console.log("✅ Replicate generation: SUCCESS");
    console.log(`Image URL: ${imageUrl}`);
    return imageUrl as string;
  } catch (error: any) {
    console.error("❌ Replicate generation: FAILED");
    console.error("Replicate error:", error.message);
    throw error;
  }
}
