import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithClaude } from "../../../services/anthropic";
import { generateImageWithReplicate } from "../../../services/replicate";
import legoParts from "../../../data/lego-parts.json";
import { jsonrepair } from "jsonrepair";
import { getLegoColorHex } from "../../../services/legoColors";
import { getPartImageUrl } from "../../../services/rebrickable";

export const maxDuration = 300;

// Cache the stringified parts list — it never changes at runtime
const partsListString = JSON.stringify(legoParts);

// ---------- helpers ----------

function enrichColors(parsedResult: any) {
  if (parsedResult.pieceList && Array.isArray(parsedResult.pieceList)) {
    parsedResult.pieceList = parsedResult.pieceList.map((piece: any) => ({
      ...piece,
      colorHex: piece.colorHex || getLegoColorHex(piece.color),
    }));
  }
  if (parsedResult.instructions && Array.isArray(parsedResult.instructions)) {
    parsedResult.instructions = parsedResult.instructions.map((step: any) => ({
      ...step,
      partsUsed: (step.partsUsed || []).map((part: any) => ({
        ...part,
        colorHex: part.colorHex || getLegoColorHex(part.color),
      })),
    }));
  }
}

async function fetchRebrickableImages(parsedResult: any) {
  if (!parsedResult.pieceList || !Array.isArray(parsedResult.pieceList)) return;
  console.log("🔍 Fetching Rebrickable images...");
  await Promise.all(
    parsedResult.pieceList.map(async (piece: any) => {
      try {
        const imageUrl = await getPartImageUrl(piece.partId, piece.color);
        if (imageUrl) piece.imageUrl = imageUrl;
      } catch {
        // Silently skip — we already have a frontend fallback icon
      }
    })
  );
}

async function generateAllImages(parsedResult: any) {
  const BATCH_SIZE = 4;

  interface ImageTask {
    name: string;
    prompt: string;
    aspectRatio: string;
    onSuccess: (url: string) => void;
  }

  const tasks: ImageTask[] = [];

  if (parsedResult.coverImagePrompt) {
    tasks.push({
      name: "Cover",
      prompt: parsedResult.coverImagePrompt,
      aspectRatio: "4:3",
      onSuccess: (url) => { parsedResult.coverImageUrl = url; },
    });
  }

  if (parsedResult.instructions && Array.isArray(parsedResult.instructions)) {
    parsedResult.instructions.forEach((step: any, i: number) => {
      if (step.imagePrompt) {
        tasks.push({
          name: `Step ${step.stepNumber || i + 1}`,
          prompt: step.imagePrompt,
          aspectRatio: "1:1",
          onSuccess: (url) => { parsedResult.instructions[i].imageUrl = url; },
        });
      }
    });
  }

  console.log(`🎨 ${tasks.length} images queued (batch: ${BATCH_SIZE})`);

  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE);
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(tasks.length / BATCH_SIZE)}...`);

    await Promise.all(
      batch.map(async (task) => {
        try {
          const url = await generateImageWithReplicate(task.prompt, task.aspectRatio);
          task.onSuccess(url);
          console.log(`  ✅ ${task.name}`);
        } catch (err: any) {
          console.error(`  ❌ ${task.name}: ${err.message}`);
        }
      })
    );
  }
}

// ---------- route handler ----------

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 1. Claude Opus analysis
    console.log("\n=== Claude Opus Analysis ===");
    let rawJson: string;
    try {
      rawJson = await analyzeImageWithClaude(image, partsListString);
      console.log("✅ Claude done");
    } catch (error: any) {
      console.error("❌ Claude failed:", error.message);
      throw error;
    }

    // 2. Parse JSON
    let repairedJson: string;
    try {
      repairedJson = jsonrepair(rawJson);
    } catch {
      repairedJson = rawJson;
    }

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(repairedJson);
    } catch (e: any) {
      console.error("❌ JSON parse failed:", e.message);
      throw e;
    }

    enrichColors(parsedResult);
    console.log(`Parsed: ${parsedResult.pieceList?.length || 0} parts, ${parsedResult.instructions?.length || 0} steps`);

    // 3. Rebrickable images + Replicate images — run IN PARALLEL
    //    Rebrickable is fast (tiny API calls), Replicate is slow (image gen).
    //    Starting them at the same time saves significant wall-clock time.
    await Promise.all([
      fetchRebrickableImages(parsedResult),
      generateAllImages(parsedResult),
    ]);

    // 4. Summary
    const stepImages = (parsedResult.instructions || []).filter((s: any) => s.imageUrl).length;
    console.log(`\n=== Done: cover=${parsedResult.coverImageUrl ? "Y" : "N"} steps=${stepImages}/${(parsedResult.instructions || []).length} ===\n`);

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("\n❌ analyze API error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}
