import { NextRequest, NextResponse } from "next/server";
import { validateAnswer, scoreToGrade, gradeEmoji } from "@/lib/semantic/validator";
import { fullValidationWithAI } from "@/lib/ai/evaluator";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userAnswer, expectedAnswer, englishOriginal, allValidAnswers = [], useAI = false } = body;

    if (!userAnswer || !expectedAnswer || !englishOriginal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (userAnswer.length > 500) {
      return NextResponse.json({ error: "Answer too long" }, { status: 400 });
    }

    let result;
    let aiUsed = false;

    if (useAI) {
      const aiResult = await fullValidationWithAI({
        userArmenian: userAnswer,
        expectedArmenian: expectedAnswer,
        englishSentence: englishOriginal,
        allValidForms: allValidAnswers,
      });
      aiUsed = aiResult.aiUsed;
      result = aiResult;
    } else {
      result = await validateAnswer({
        userAnswer,
        expectedAnswer,
        englishOriginal,
        allValidAnswers,
      });
    }

    const grade = scoreToGrade(result.score);
    return NextResponse.json({
      accepted:    result.accepted,
      score:       Math.round(result.score * 100) / 100,
      grade,
      emoji:       gradeEmoji(grade),
      layer:       result.layer,
      feedback:    result.feedback,
      corrections: result.corrections,
      alternatives:result.alternatives,
      confidence:  Math.round((result.confidence ?? 0) * 100) / 100,
      aiUsed,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ service: "NUR Lingo Semantic Validator v4", status: "operational" });
}
