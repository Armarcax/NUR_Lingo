/**
 * NUR Lingo — /api/validate
 * POST: Validate a student's Armenian answer against the semantic engine.
 *
 * Runs the full multi-layer validation pipeline:
 * 1. Exact match
 * 2. Pattern registry
 * 3. Morphological analysis
 * 4. Synonym expansion
 * 5. AI semantic evaluation (if needed)
 */

import { NextRequest, NextResponse } from "next/server";
import { validateAnswer, scoreToGrade, gradeEmoji } from "@/lib/semantic/validator";
import { fullValidationWithAI } from "@/lib/ai/evaluator";

export const runtime = "edge";

interface ValidateRequest {
  userAnswer: string;
  expectedAnswer: string;
  englishOriginal: string;
  allValidAnswers?: string[];
  useAI?: boolean;              // opt-in to AI layer
  debug?: boolean;              // include debug info in response
}

interface ValidateResponse {
  accepted: boolean;
  score: number;
  grade: string;
  emoji: string;
  layer: string;
  feedback: string;
  corrections?: string[];
  alternatives?: string[];
  confidence: number;
  aiUsed?: boolean;
  debug?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ValidateRequest;

    // Input validation
    if (!body.userAnswer || !body.expectedAnswer || !body.englishOriginal) {
      return NextResponse.json(
        { error: "Missing required fields: userAnswer, expectedAnswer, englishOriginal" },
        { status: 400 }
      );
    }

    if (body.userAnswer.length > 500) {
      return NextResponse.json(
        { error: "Answer too long (max 500 chars)" },
        { status: 400 }
      );
    }

    let result;
    let aiUsed = false;

    if (body.useAI) {
      // Full pipeline including AI fallback
      const aiResult = await fullValidationWithAI({
        userArmenian: body.userAnswer,
        expectedArmenian: body.expectedAnswer,
        englishSentence: body.englishOriginal,
        allValidForms: body.allValidAnswers,
      });
      aiUsed = aiResult.aiUsed;
      result = aiResult;
    } else {
      // Rule-based only (faster, no cost)
      result = await validateAnswer({
        userAnswer: body.userAnswer,
        expectedAnswer: body.expectedAnswer,
        englishOriginal: body.englishOriginal,
        allValidAnswers: body.allValidAnswers,
      });
    }

    const grade = scoreToGrade(result.score);

    const response: ValidateResponse = {
      accepted: result.accepted,
      score: Math.round(result.score * 100) / 100,
      grade,
      emoji: gradeEmoji(grade),
      layer: result.layer,
      feedback: result.feedback,
      corrections: result.corrections,
      alternatives: result.alternatives,
      confidence: Math.round((result.confidence ?? 0) * 100) / 100,
      aiUsed,
    };

    if (body.debug) {
      response.debug = result.debug;
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-NUR-Engine": "semantic-v1",
      },
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Internal validation error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "NUR Lingo Semantic Validation Engine",
    version: "1.0.0",
    layers: [
      "exact_match",
      "pattern_registry",
      "morphological",
      "synonym_expansion",
      "ai_semantic",
    ],
    status: "operational",
  });
}
