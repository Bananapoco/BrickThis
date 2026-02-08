import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini } from "@/services/gemini";
import { generateImageWithReplicate } from "@/services/replicate";
import legoParts from "@/data/lego-parts.json";
import { jsonrepair } from "jsonrepair";

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
    
    let geminiSuccess = false;
    let result: string;
    
    try {
      // Call Gemini for analysis and design
      result = await analyzeImageWithGemini(image, partsListString);
      geminiSuccess = true;
      console.log("✅ Gemini connection: SUCCESS");
    } catch (error: any) {
      geminiSuccess = false;
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
      console.log("\n=== Gemini Response JSON ===");
      console.log(JSON.stringify(parsedResult, null, 2));
      console.log("===========================\n");
    } catch (parseError: any) {
      console.log("❌ JSON parsing: FAILED");
      console.error("Parse error:", parseError.message);
      console.log("Raw response:", result);
      throw parseError;
    }

    // Generate cover image if prompt exists
    if (parsedResult.coverImagePrompt) {
      console.log("🎨 Generating cover image with prompt:", parsedResult.coverImagePrompt);
      try {
        const coverImageUrl = await generateImageWithReplicate(parsedResult.coverImagePrompt);
        parsedResult.coverImageUrl = coverImageUrl;
        console.log("✅ Cover image generated:", coverImageUrl);
      } catch (imageError) {
        console.error("Failed to generate cover image:", imageError);
        // Don't fail the whole request if only image generation fails
      }
    } else {
      console.log("⚠️ No coverImagePrompt found in Gemini response");
    }

    // Generate instructions summary image if prompt exists
    if (parsedResult.instructionsImagePrompt) {
      console.log("🎨 Generating instructions image with prompt:", parsedResult.instructionsImagePrompt);
      try {
        const instructionsImageUrl = await generateImageWithReplicate(parsedResult.instructionsImagePrompt);
        parsedResult.instructionsImageUrl = instructionsImageUrl;
        console.log("✅ Instructions image generated:", instructionsImageUrl);
      } catch (imageError) {
        console.error("Failed to generate instructions image:", imageError);
      }
    } else {
      console.log("⚠️ No instructionsImagePrompt found in Gemini response");
    }

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("\n❌ Error in analyze API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
