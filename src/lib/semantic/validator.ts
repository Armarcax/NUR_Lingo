/**
 * NUR Lingo — Semantic Validation Engine
 *
 * Multi-layer answer checking pipeline:
 *   Layer 1: Exact match (fast path)
 *   Layer 2: Pattern registry match
 *   Layer 3: Morphological equivalence (Armenian only)
 *   Layer 4: Synonym expansion
 *   Layer 5: AI semantic evaluation (LLM fallback)
 *
 * Each layer increases computational cost; we short-circuit as early as possible.
 */

import {
  normalizeArmenian,
  areMorphologicallyEquivalent,
  extractSemanticTokens,
  isArmenian,
} from "../nlp/morphology";
import {
  lookupSentencePattern,
  getAllValidArmenianForms,
  getSynonyms,
} from "../lexicon/dictionary";

// ─── Validation Result ───────────────────────────────────────────────────────

export type ValidationLayer =
  | "exact_match"
  | "pattern_registry"
  | "morphological"
  | "synonym_expansion"
  | "ai_semantic";

export interface ValidationResult {
  accepted: boolean;
  score: number;                     // 0.0 – 1.0
  layer: ValidationLayer;           // which layer accepted/rejected
  feedback: string;                  // user-facing message
  corrections?: string[];           // suggested improvements
  alternatives?: string[];          // other valid answers
  confidence: number;               // engine confidence 0.0 – 1.0
  debug?: Record<string, unknown>;  // dev-mode details
}

// ─── Scoring constants ───────────────────────────────────────────────────────

const SCORE_EXACT          = 1.00;
const SCORE_PATTERN        = 0.98;
const SCORE_MORPHOLOGICAL  = 0.85;
const SCORE_SYNONYM        = 0.80;
const SCORE_AI_ACCEPT      = 0.75;
const SCORE_REJECT         = 0.00;

const ACCEPTANCE_THRESHOLD = 0.70;

// ─── Layer 1: Exact Match ────────────────────────────────────────────────────

export function exactMatch(
  userAnswer: string,
  expectedAnswer: string
): ValidationResult | null {
  const isHy = isArmenian(expectedAnswer);
  const u = isHy ? normalizeArmenian(userAnswer) : userAnswer.trim().toLowerCase();
  const e = isHy ? normalizeArmenian(expectedAnswer) : expectedAnswer.trim().toLowerCase();

  if (u === e) {
    return {
      accepted: true,
      score: SCORE_EXACT,
      layer: "exact_match",
      feedback: "Perfect answer!",
      confidence: 1.0,
    };
  }
  return null;
}

// ─── Layer 2: Pattern Registry Match ────────────────────────────────────────

export function patternRegistryMatch(
  userAnswer: string,
  sourceSentence: string,
  sourceLanguage: "en" | "hy"
): ValidationResult | null {
  // Pattern registry currently mostly for English -> Armenian
  if (sourceLanguage !== "en") return null;

  const validForms = getAllValidArmenianForms(sourceSentence);
  if (validForms.length === 0) return null;

  const u = normalizeArmenian(userAnswer);
  const match = validForms.find((v) => normalizeArmenian(v) === u);
  if (match) {
    return {
      accepted: true,
      score: SCORE_PATTERN,
      layer: "pattern_registry",
      feedback: "Correct — valid phrasing!",
      alternatives: validForms.filter((v) => normalizeArmenian(v) !== u),
      confidence: 0.99,
    };
  }
  return null;
}

// ─── Layer 3: Morphological Equivalence ─────────────────────────────────────

export function morphologicalMatch(
  userAnswer: string,
  referenceAnswer: string,
  allValidForms: string[]
): ValidationResult | null {
  // Only for Armenian
  if (!isArmenian(referenceAnswer)) return null;

  // Check against reference
  const vsReference = areMorphologicallyEquivalent(userAnswer, referenceAnswer);
  if (vsReference.equivalent) {
    return {
      accepted: true,
      score: SCORE_MORPHOLOGICAL,
      layer: "morphological",
      feedback: "Correct meaning! Word order may vary.",
      confidence: vsReference.overlap,
      debug: { morphological_overlap: vsReference.details },
    };
  }

  // Check against all registered valid forms
  for (const validForm of allValidForms) {
    const vsForm = areMorphologicallyEquivalent(userAnswer, validForm);
    if (vsForm.equivalent) {
      return {
        accepted: true,
        score: SCORE_MORPHOLOGICAL,
        layer: "morphological",
        feedback: "Correct! Your answer has the same meaning.",
        confidence: vsForm.overlap,
        debug: { morphological_overlap: vsForm.details, matched_form: validForm },
      };
    }
  }
  return null;
}

// ─── Layer 4: Synonym Expansion ──────────────────────────────────────────────

export function synonymExpansionMatch(
  userAnswer: string,
  referenceAnswer: string
): ValidationResult | null {
  // Currently optimized for Armenian
  if (!isArmenian(referenceAnswer)) return null;

  const { lemmas: userLemmas } = extractSemanticTokens(userAnswer);
  const { lemmas: refLemmas } = extractSemanticTokens(referenceAnswer);

  // Expand reference lemmas with synonyms
  const expandedRef = new Set<string>(refLemmas);
  for (const lemma of refLemmas) {
    const syns = getSynonyms(lemma);
    syns.forEach((s) => expandedRef.add(s));
  }

  const userSet = new Set(userLemmas.filter((l) => l.length > 1));
  const intersection = [...userSet].filter((l) => expandedRef.has(l));
  const overlap = userSet.size > 0 ? intersection.length / userSet.size : 0;

  if (overlap >= 0.75) {
    return {
      accepted: true,
      score: SCORE_SYNONYM,
      layer: "synonym_expansion",
      feedback: "Very good! Correct with synonyms.",
      confidence: overlap,
      debug: { synonym_overlap: overlap, matched: intersection },
    };
  }
  return null;
}

// ─── Main Validation Pipeline (without AI) ──────────────────────────────────

export interface ValidationRequest {
  userAnswer: string;
  expectedAnswer: string;         // primary correct answer
  sourceSentence: string;         // original question
  sourceLanguage: "en" | "hy";
  targetLanguage: "en" | "hy";
  allValidAnswers?: string[];     // additional valid forms
  strictMode?: boolean;           // if true, skip morphology and synonym expansion
}

export async function validateAnswer(
  req: ValidationRequest
): Promise<ValidationResult> {
  const {
    userAnswer,
    expectedAnswer,
    sourceSentence,
    sourceLanguage,
    targetLanguage,
    allValidAnswers = [],
    strictMode = false
  } = req;

  if (!userAnswer.trim()) {
    return {
      accepted: false,
      score: SCORE_REJECT,
      layer: "exact_match",
      feedback: "Answer is empty.",
      confidence: 1.0,
    };
  }

  // All valid forms for this question
  let patternForms: string[] = [];
  if (sourceLanguage === "en" && targetLanguage === "hy") {
    patternForms = getAllValidArmenianForms(sourceSentence);
  }

  const allForms = [
    ...new Set([expectedAnswer, ...patternForms, ...allValidAnswers]),
  ];

  // Layer 1: Exact match
  for (const form of allForms) {
    const result = exactMatch(userAnswer, form);
    if (result) return result;
  }

  // Layer 2: Pattern registry
  const patternResult = patternRegistryMatch(userAnswer, sourceSentence, sourceLanguage);
  if (patternResult) return patternResult;

  // If in strict mode, we stop here (only exact or registered patterns allowed)
  if (strictMode) {
    return {
      accepted: false,
      score: SCORE_REJECT,
      layer: "pattern_registry",
      feedback: "Words are in wrong order or missing.",
      corrections: allForms.slice(0, 1),
      confidence: 1.0,
    };
  }

  // Layer 3: Morphological (Armenian only)
  if (targetLanguage === "hy") {
    const morphResult = morphologicalMatch(userAnswer, expectedAnswer, allForms);
    if (morphResult) return morphResult;
  }

  // Layer 4: Synonym expansion (Armenian only for now)
  if (targetLanguage === "hy") {
    const synonymResult = synonymExpansionMatch(userAnswer, expectedAnswer);
    if (synonymResult) return synonymResult;
  }

  // Default reject — caller may optionally run AI layer
  return {
    accepted: false,
    score: SCORE_REJECT,
    layer: targetLanguage === "hy" ? "morphological" : "exact_match",
    feedback: targetLanguage === "hy"
        ? buildFeedback(userAnswer, expectedAnswer, allForms)
        : `Incorrect. Expected: "${expectedAnswer}"`,
    corrections: allForms.slice(0, 3),
    confidence: 0.9,
  };
}

// ─── Feedback builder ────────────────────────────────────────────────────────

function buildFeedback(
  userAnswer: string,
  expected: string,
  allValid: string[]
): string {
  const { lemmas: uLemmas } = extractSemanticTokens(userAnswer);
  const { lemmas: eLemmas } = extractSemanticTokens(expected);

  const uSet = new Set(uLemmas);
  const eSet = new Set(eLemmas);
  const missing = [...eSet].filter((l) => !uSet.has(l) && l.length > 1);
  const extra = [...uSet].filter((l) => !eSet.has(l) && l.length > 1);

  const parts: string[] = ["Not quite right."];

  if (missing.length > 0) {
    parts.push(`Missing concepts: [${missing.join(", ")}]`);
  }
  if (extra.length > 0) {
    parts.push(`Extra words: [${extra.join(", ")}]`);
  }
  if (allValid.length > 0) {
    parts.push(`Correct answer: "${allValid[0]}"`);
  }

  return parts.join(" | ");
}

// ─── Score → Grade mapping ───────────────────────────────────────────────────

export type Grade = "perfect" | "excellent" | "good" | "partial" | "incorrect";

export function scoreToGrade(score: number): Grade {
  if (score >= 0.98) return "perfect";
  if (score >= 0.85) return "excellent";
  if (score >= 0.75) return "good";
  if (score >= 0.50) return "partial";
  return "incorrect";
}

export function gradeEmoji(grade: Grade): string {
  const map: Record<Grade, string> = {
    perfect: "🌟",
    excellent: "✅",
    good: "👍",
    partial: "🔶",
    incorrect: "❌",
  };
  return map[grade];
}
