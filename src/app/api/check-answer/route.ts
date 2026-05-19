import { NextRequest, NextResponse } from "next/server";
import { fullValidationWithAI } from "@/lib/ai/evaluator";
import { getLessonById } from "@/lib/lessons/engine";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const {
      userAnswer,
      lessonId,
      expectedAnswers = [],
      sourceLanguage = "en",
      targetLanguage = "hy",
    } = await req.json();

    if (!userAnswer || !lessonId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lesson = getLessonById(lessonId);
    if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Determine the source sentence and expected answer for validation
    // In current UX, most exercises are translation from prompt (source) to userAnswer (target)
    // We'll find the exercise that matches the lesson context or just use the provided expectedAnswers

    // For now, we assume the first expected answer is the primary one
    const primaryExpected = expectedAnswers[0] || "";

    // We need the source sentence for the AI to judge semantic equivalence properly.
    // We'll try to find the exercise in the lesson to get the prompt.
    const exercise = lesson.exercises.find(e =>
        e.targetAnswer === primaryExpected || e.acceptableAnswers.includes(primaryExpected)
    );

    const sourceSentence = exercise ? exercise.prompt : primaryExpected;

    const result = await fullValidationWithAI({
      userAnswer,
      expectedAnswer: primaryExpected,
      sourceSentence,
      sourceLanguage,
      targetLanguage,
      allValidForms: expectedAnswers,
    });

    return NextResponse.json({
      correct: result.accepted,
      hayq: result.accepted ? (result.score >= 0.95 ? 20 : 15) : 0,
      seeds: result.accepted && result.score >= 0.98 ? 1 : 0,
      score: result.score,
      feedback: result.feedback,
      corrections: result.corrections,
      layer: result.layer,
      aiUsed: result.aiUsed,
    });

  } catch (error) {
    console.error("Check answer error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
