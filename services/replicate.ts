import Replicate from "replicate";

if (!process.env.REPLICATE_API_KEY) {
  console.warn("REPLICATE_API_KEY is not defined in environment variables");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || "",
});

/**
 * Generates an image using Replicate's FLUX Schnell model
 * @param prompt The prompt for image generation
 * @param aspectRatio The aspect ratio for the image (default "1:1")
 * @returns The URL of the generated image
 */
export async function generateImageWithReplicate(
  prompt: string,
  aspectRatio: string = "1:1"
): Promise<string> {
  console.log(`\n=== Replicate Image Generation Started ===`);
  console.log(`Aspect ratio: ${aspectRatio}`);
  console.log(`Prompt (first 200 chars): ${prompt.substring(0, 200)}...`);

  // Explicit dimensions for high resolution
  const dimensions = aspectRatio === "4:3" 
    ? { width: 1024, height: 768 } 
    : { width: 1024, height: 1024 };

  try {
    const output = await replicate.run(
      "black-forest-labs/flux-dev",
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
          ...dimensions,
          output_format: "png",
          output_quality: 100,
          num_inference_steps: 35,
          guidance_scale: 4.5,
          seed: Math.floor(Math.random() * 1000000),
        }
      }
    );

    console.log("Raw Replicate output type:", typeof output);
    console.log("Raw Replicate output:", JSON.stringify(output).substring(0, 500));

    // flux-schnell returns an array of FileOutput objects (ReadableStream with .url())
    // or an array of URL strings depending on the SDK version
    let imageUrl: string;

    if (Array.isArray(output) && output.length > 0) {
      const first = output[0];
      if (typeof first === "string") {
        imageUrl = first;
      } else if (first && typeof first === "object" && "url" in first) {
        // FileOutput object - call .url() or use toString()
        imageUrl = typeof first.url === "function" ? first.url() : String(first.url);
      } else {
        // Fallback: convert to string
        imageUrl = String(first);
      }
    } else if (typeof output === "string") {
      imageUrl = output;
    } else {
      throw new Error(`Unexpected Replicate output format: ${JSON.stringify(output).substring(0, 200)}`);
    }

    console.log("✅ Replicate generation: SUCCESS");
    console.log(`Image URL: ${imageUrl}`);
    return imageUrl;
  } catch (error: any) {
    console.error("❌ Replicate generation: FAILED");
    console.error("Replicate error:", error.message);
    console.error("Full error:", JSON.stringify(error, null, 2).substring(0, 500));
    throw error;
  }
}
