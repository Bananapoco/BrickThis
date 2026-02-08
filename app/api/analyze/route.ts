import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini } from "../../../services/gemini";
import { generateImageWithReplicate } from "../../../services/replicate";
import legoParts from "../../../data/lego-parts.json";
import { jsonrepair } from "jsonrepair";
import { getLegoColorHex } from "../../../services/legoColors";
import { getPartImageUrl } from "../../../services/rebrickable";

export const maxDuration = 60; // Allow up to 60s for Gemini + cover image generation (step images disabled)

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Convert the parts list to a string for the prompt
    const partsListString = JSON.stringify(legoParts);

    console.log("\n=== Gemini Analysis Started ===");

    let result: string;

    try {
      result = await analyzeImageWithGemini(image, partsListString);
      console.log("✅ Gemini connection: SUCCESS");
    } catch (error: any) {
      console.log("❌ Gemini connection: FAILED");
      console.error("Gemini error:", error.message);
      throw error;
    }

    // Repair JSON if needed using jsonrepair
    let repairedJson: string;
    try {
      repairedJson = jsonrepair(result);
      console.log("✅ JSON repair: SUCCESS");
    } catch (repairError: any) {
      console.log("⚠️  JSON repair: FAILED (using original)");
      console.error("Repair error:", repairError.message);
      repairedJson = result;
    }

    // Parse the JSON response
    let parsedResult: any;
    try {
      parsedResult = JSON.parse(repairedJson);

      // Add hex color values to pieceList if not already present
      if (parsedResult.pieceList && Array.isArray(parsedResult.pieceList)) {
        parsedResult.pieceList = parsedResult.pieceList.map((piece: any) => ({
          ...piece,
          colorHex: piece.colorHex || getLegoColorHex(piece.color),
        }));
      }

      // Add hex color values to partsUsed in each instruction step
      if (parsedResult.instructions && Array.isArray(parsedResult.instructions)) {
        parsedResult.instructions = parsedResult.instructions.map((step: any) => ({
          ...step,
          partsUsed: (step.partsUsed || []).map((part: any) => ({
            ...part,
            colorHex: part.colorHex || getLegoColorHex(part.color),
          })),
        }));
      }

      console.log("\n=== Gemini Response JSON ===");
      console.log(JSON.stringify(parsedResult, null, 2));
      console.log("===========================\n");
    } catch (parseError: any) {
      console.log("❌ JSON parsing: FAILED");
      console.error("Parse error:", parseError.message);
      console.log("Raw response:", result);
      throw parseError;
    }

    // --- ENRICH WITH REBRICKABLE IMAGES ---
    if (parsedResult.pieceList && Array.isArray(parsedResult.pieceList)) {
      console.log("🔍 Fetching Rebrickable images for parts list...");
      const partImagePromises = parsedResult.pieceList.map(async (piece: any) => {
        try {
          const imageUrl = await getPartImageUrl(piece.partId, piece.color);
          if (imageUrl) {
            piece.imageUrl = imageUrl;
          }
        } catch (err) {
          console.error(`Failed to fetch image for ${piece.partId}:`, err);
        }
      });
      await Promise.all(partImagePromises);
    }

    // --- IMAGE GENERATION WITH REPLICATE ---
    // Generate cover image + all per-step images in parallel
    const allImagePromises: Promise<void>[] = [];

    // Cover image (4:3 aspect ratio for box-art style)
    if (parsedResult.coverImagePrompt) {
      console.log("\n🎨 Generating cover image...");
      allImagePromises.push(
        generateImageWithReplicate(parsedResult.coverImagePrompt, "4:3")
          .then((url) => {
            parsedResult.coverImageUrl = url;
            console.log("✅ Cover image generated:", url);
          })
          .catch((err) => {
            console.error("❌ Cover image generation failed:", err.message);
          })
      );
    } else {
      console.log("⚠️ No coverImagePrompt found in Gemini response");
    }

    // Per-step images (1:1 aspect ratio for instruction cards)
    // TEMPORARILY DISABLED - focusing on cover image only
    // if (parsedResult.instructions && Array.isArray(parsedResult.instructions)) {
    //   parsedResult.instructions.forEach((step: any, i: number) => {
    //     if (step.imagePrompt) {
    //       console.log(`🎨 Generating image for step ${step.stepNumber || i + 1}...`);
    //       allImagePromises.push(
    //         generateImageWithReplicate(step.imagePrompt, "1:1")
    //           .then((url) => {
    //             parsedResult.instructions[i].imageUrl = url;
    //             console.log(`✅ Step ${step.stepNumber || i + 1} image generated`);
    //           })
    //           .catch((err) => {
    //             console.error(`❌ Step ${step.stepNumber || i + 1} image failed:`, err.message);
    //           })
    //       );
    //     }
    //   });
    // }

    console.log(`\n⏳ Waiting for ${allImagePromises.length} image(s) to generate in parallel...`);
    await Promise.all(allImagePromises);

    // Summary
    console.log("\n=== Final Response ===");
    console.log(`Cover image: ${parsedResult.coverImageUrl ? "YES" : "NO"}`);
    console.log(`Step images: DISABLED (focusing on cover + text descriptions)`);
    console.log("=====================\n");

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("\n❌ Error in analyze API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
