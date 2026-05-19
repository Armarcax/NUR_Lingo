import { NextRequest, NextResponse } from "next/server";
import { getEmbedding, cosineSimilarity } from "@/lib/ai/embeddings";
import { evaluateWithAI } from "@/lib/ai/evaluator";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { userAnswer, lessonId, expectedAnswers } = await req.json();

    if (!userAnswer || !expectedAnswers || expectedAnswers.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get embedding for user answer (translated if needed)
    // For Phase 1, we assume comparison is done in the target language (English)
    // If the input is Armenian, we use evaluateWithAI which handles translation + logic

    // However, the task specifically asked for embeddings and cosine similarity.
    // Let's implement the logic:
    // Translate user answer to English via Gemini (handled by evaluateWithAI if we use it)

    // Plan:
    // a. Get embeddings for all accepted answers
    // b. Get embedding for user answer
    // c. Calculate max cosine similarity

    // Note: Armenian to English translation is best done via evaluateWithAI for nuance,
    // but the task specifies embedding similarity.

    const userVec = await getEmbedding(userAnswer);

    // Get embeddings for all expected answers in parallel
    const ansVectors = await Promise.all((expectedAnswers as string[]).map(ans => getEmbedding(ans)));

    let maxSim = 0;
    for (const ansVec of ansVectors) {
      const sim = cosineSimilarity(userVec, ansVec);
      if (sim > maxSim) maxSim = sim;
    }

    const correct = maxSim > 0.85;

    return NextResponse.json({
      correct,
      hayq: correct ? 10 : 0,
      seeds: 0,
      score: maxSim,
      feedback: correct ? "Excellent!" : "Try again!",
    });

  } catch (error) {
    console.error("Check answer error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
