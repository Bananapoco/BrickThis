import Replicate from "replicate";

if (!process.env.REPLICATE_API_KEY) {
  console.warn("REPLICATE_API_KEY is not defined in environment variables");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || "",
});

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 6000; // 6s base (Replicate says "resets in ~5s")

/**
 * Sleep utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extracts a URL string from Replicate's various output formats
 */
function extractUrl(output: unknown): string {
  if (Array.isArray(output) && output.length > 0) {
    const first = output[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      if ("url" in first && typeof first.url === "function") return first.url();
      if ("url" in first) return String(first.url);
      return String(first);
    }
    return String(first);
  }
  if (typeof output === "string") return output;
  throw new Error(`Unexpected Replicate output format: ${typeof output}`);
}

/**
 * Generates an image using Replicate's FLUX dev model with automatic retry on 429
 */
export async function generateImageWithReplicate(
  prompt: string,
  aspectRatio: string = "1:1"
): Promise<string> {
  const dimensions =
    aspectRatio === "4:3"
      ? { width: 1024, height: 768 }
      : { width: 1024, height: 1024 };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const output = await replicate.run("black-forest-labs/flux-dev", {
        input: {
          prompt,
          num_outputs: 1,
          ...dimensions,
          output_format: "png",
          output_quality: 100,
          num_inference_steps: 35,
          guidance_scale: 4.5,
          seed: Math.floor(Math.random() * 1000000),
        },
      });

      const imageUrl = extractUrl(output);

      // Validate URL
      if (!imageUrl || imageUrl === "[object Object]" || !imageUrl.startsWith("http")) {
        throw new Error(`Invalid image URL: ${imageUrl}`);
      }

      console.log(`✅ Replicate: ${aspectRatio} image generated`);
      return imageUrl;
    } catch (error: any) {
      const is429 = error.message?.includes("429") || error.status === 429;

      if (is429 && attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY_MS * (attempt + 1);
        console.warn(`⏳ Replicate 429 — retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await sleep(delay);
        continue;
      }

      console.error(`❌ Replicate failed (attempt ${attempt + 1}):`, error.message);
      throw error;
    }
  }

  throw new Error("Replicate: max retries exceeded");
}
