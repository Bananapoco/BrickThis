import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini } from "../../../services/gemini";
import legoParts from "../../../data/lego-parts.json";
import { jsonrepair } from "jsonrepair";
import { getLegoColorHex } from "../../../services/legoColors";

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
      
      // Add hex color values to pieceList if not already present
      if (parsedResult.pieceList && Array.isArray(parsedResult.pieceList)) {
        parsedResult.pieceList = parsedResult.pieceList.map((piece: any) => ({
          ...piece,
          colorHex: piece.colorHex || getLegoColorHex(piece.color),
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

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("\n❌ Error in analyze API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
