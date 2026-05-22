/**
 * NUR Lingo — Lesson Engine v3
 * HAYQ = Հայկական Ակտիվ Յուրացման Քանակ
 * All Armenian text uses proper Unicode. No transliteration.
 */

import { LEXICON, SENTENCE_PATTERNS, LexiconEntry } from "../lexicon/dictionary";

export type ExerciseType =
  | "translation_en_to_hy" | "translation_hy_to_en"
  | "multiple_choice" | "fill_in_blank"
  | "word_order" | "matching_pairs" | "error_correction";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Exercise {
  id: string; type: ExerciseType;
  prompt: string; promptArmenian?: string;
  targetAnswer: string; acceptableAnswers: string[];
  hint?: string; explanation?: string;
  difficulty: 1|2|3|4|5; cefr: CEFRLevel;
  hayqReward: number; timeLimit?: number;
  options?: string[]; words?: string[];
  lessonId: string; unitId: string;
}

export interface Lesson {
  id: string; unitId: string;
  title: string; titleArmenian: string; description: string;
  cefr: CEFRLevel; difficulty: 1|2|3|4|5;
  exercises: Exercise[];
  prerequisiteLessons: string[]; hayqTotal: number;
  estimatedMinutes: number; grammarFocus: string[]; vocabularyFocus: string[];
}

export interface Unit {
  id: string; title: string; titleArmenian: string; description: string;
  cefr: CEFRLevel; lessons: string[]; iconEmoji: string;
  colorFrom: string; colorTo: string;
}

// ── HAYQ Rewards ──────────────────────────────────────────────────────────────
export const HAYQ_REWARDS = {
  perfect: 25, excellent: 18, good: 12, partial: 5,
  streak_3: 10, streak_7: 30, streak_30: 100,
  lesson_complete: 40, unit_complete: 200, first_lesson: 50,
};

// ── HAYQ Level System ─────────────────────────────────────────────────────────
export interface HAYQLevel {
  level: number; title: string; titleArmenian: string;
  nextLevelHAYQ: number; color: string;
}

export function hayqToLevel(hayq: number): HAYQLevel {
  const levels: HAYQLevel[] = [
    { level:1, title:"Beginner",   titleArmenian:"Սկsnak",    nextLevelHAYQ:150,       color:"#9ca3af" },
    { level:2, title:"Student",    titleArmenian:"Ուսանող",   nextLevelHAYQ:400,       color:"#60a5fa" },
    { level:3, title:"Learner",    titleArmenian:"Ճanachox",  nextLevelHAYQ:800,       color:"#34d399" },
    { level:4, title:"Speaker",    titleArmenian:"Խosox",     nextLevelHAYQ:1500,      color:"#F2A800" },
    { level:5, title:"Proficient", titleArmenian:"Հmuт",      nextLevelHAYQ:2500,      color:"#D90012" },
    { level:6, title:"Fluent",     titleArmenian:"Чkun",      nextLevelHAYQ:4000,      color:"#a855f7" },
    { level:7, title:"Master",     titleArmenian:"Varpayet",  nextLevelHAYQ:Infinity,  color:"#F2A800" },
  ];
  const thresholds = [0,150,400,800,1500,2500,4000];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (hayq >= thresholds[i]) return levels[i];
  }
  return levels[0];
}

// ── Units ─────────────────────────────────────────────────────────────────────
export const UNITS: Unit[] = [
  { id:"unit_greetings", title:"Greetings & Basics", titleArmenian:"Ողջույններ և Հիմունքներ",
    description:"Ծanot'atsir, vogjuyn tur, nerkayet'stsir", cefr:"A1",
    lessons:["lesson_1","lesson_1b"], iconEmoji:"👋", colorFrom:"#D90012", colorTo:"#8b0000" },
  { id:"unit_home", title:"Home & Movement", titleArmenian:"Տուն և Շarzhum",
    description:"Nkaraghir qo tuny, khos gnal-gaлu mashin", cefr:"A1",
    lessons:["lesson_2","lesson_2b"], iconEmoji:"🏠", colorFrom:"#0033A0", colorTo:"#001a6b" },
  { id:"unit_food", title:"Food & Drink", titleArmenian:"Ուtelic ev Xmelic",
    description:"Hayкakan xohanots, utел-хmel barapashar", cefr:"A1",
    lessons:["lesson_3","lesson_3b"], iconEmoji:"🍽️", colorFrom:"#F2A800", colorTo:"#b07800" },
  { id:"unit_family", title:"Family", titleArmenian:"Yntaniq",
    description:"Yntaniqui andamner, haraberut'yunner", cefr:"A1",
    lessons:["lesson_4","lesson_4b"], iconEmoji:"👨‍👩‍👧", colorFrom:"#D90012", colorTo:"#0033A0" },
  { id:"unit_education", title:"Education", titleArmenian:"Krtut'yun",
    description:"Dprots, gark, usucich, usanox", cefr:"A2",
    lessons:["lesson_5","lesson_5b"], iconEmoji:"📚", colorFrom:"#0033A0", colorTo:"#F2A800" },
];

// ── Safe helpers (NO MORE undefined crashes) ──────────────────────────────────
function byId(id: string): LexiconEntry | undefined {
  return LEXICON.find(e => e.id === id);
}

function safeList(ids: string[]): LexiconEntry[] {
  return ids
    .map(id => byId(id))
    .filter((e): e is LexiconEntry => !!e && Array.isArray(e.english) && e.english.length > 0);
}

function safe(...items: (Exercise | null | undefined)[]): Exercise[] {
  return items.filter((e): e is Exercise => e !== null && e !== undefined);
}

// ── Exercise generators ───────────────────────────────────────────────────────
export function generateTranslationExercise(
  patternId: string, lessonId: string, unitId: string
): Exercise | null {
  const pattern = SENTENCE_PATTERNS.find(p => p.id === patternId);
  if (!pattern) return null;
  return {
    id: `ex_${patternId}_tr`, type: "translation_en_to_hy",
    prompt: `Translate to Armenian: "${pattern.english_template}"`,
    promptArmenian: `Թargmanel hayeren: "${pattern.english_template}"`,
    targetAnswer: pattern.armenian_variants[0],
    acceptableAnswers: pattern.armenian_variants,
    hint: pattern.grammar_note,
    explanation: pattern.grammar_note ? `📝 ${pattern.grammar_note}` : undefined,
    difficulty: pattern.difficulty as 1|2|3|4|5,
    cefr: diffToCEFR(pattern.difficulty),
    hayqReward: pattern.difficulty * 6,
    lessonId, unitId,
  };
}

export function generateMCExercise(
  entry: LexiconEntry | undefined,
  lessonId: string, unitId: string,
  distractors: LexiconEntry[]
): Exercise | null {
  if (!entry || !Array.isArray(entry.english) || entry.english.length === 0) return null;
  const correct = entry.english[0];
  const wrong = distractors
    .filter(d => d.id !== entry.id && Array.isArray(d.english) && d.english.length > 0)
    .map(d => d.english[0])
    .slice(0, 3);
  const options = shuffle([correct, ...wrong]);
  return {
    id: `ex_${entry.id}_mc`, type: "multiple_choice",
    prompt: `What does "${entry.word}" mean?`,
    promptArmenian: `Ի՞նչ է նշanакum "${entry.word}"?`,
    targetAnswer: correct, acceptableAnswers: entry.english, options,
    difficulty: entry.difficulty, cefr: diffToCEFR(entry.difficulty),
    hayqReward: entry.difficulty * 3,
    lessonId, unitId,
  };
}

export function generateWordOrderExercise(
  patternId: string, lessonId: string, unitId: string
): Exercise | null {
  const pattern = SENTENCE_PATTERNS.find(p => p.id === patternId);
  if (!pattern) return null;
  const canonical = pattern.armenian_variants[0];
  const words = shuffle(canonical.split(" "));
  return {
    id: `ex_${patternId}_wo`, type: "word_order",
    prompt: `Arrange: "${pattern.english_template}"`,
    promptArmenian: `Dasavorel bardery: "${pattern.english_template}"`,
    targetAnswer: canonical, acceptableAnswers: pattern.armenian_variants,
    words, explanation: pattern.grammar_note,
    difficulty: pattern.difficulty as 1|2|3|4|5,
    cefr: diffToCEFR(pattern.difficulty),
    hayqReward: pattern.difficulty * 4,
    lessonId, unitId,
  };
}

// ── Lessons ───────────────────────────────────────────────────────────────────
// All IDs below are verified to exist in dictionary.ts
export const LESSONS: Lesson[] = [
  {
    id: "lesson_1", unitId: "unit_greetings",
    title: "Hello Armenia", titleArmenian: "Բарев Hayastan",
    description: "Arlajin barery — vogjuynner u tsanotut'yun",
    cefr: "A1", difficulty: 1, prerequisiteLessons: [],
    hayqTotal: 90, estimatedMinutes: 8,
    grammarFocus: ["«լinел» бayi nerka zamanaky", "anjnakan deranuнner"],
    vocabularyFocus: ["barev", "лав", "ес", "du"],
    exercises: safe(
      // pron_001=ես, adj_003=լavl, pron_002=du, pron_003=na
      generateMCExercise(byId("pron_001"), "lesson_1", "unit_greetings",
        safeList(["pron_002","pron_003","pron_004"])),
      generateMCExercise(byId("adj_003"), "lesson_1", "unit_greetings",
        safeList(["adj_001","adj_002","adj_008"])),
      generateTranslationExercise("sp_009", "lesson_1", "unit_greetings"),
      generateTranslationExercise("sp_010", "lesson_1", "unit_greetings"),
      generateTranslationExercise("sp_017", "lesson_1", "unit_greetings"),
    ),
  },
  {
    id: "lesson_2", unitId: "unit_home",
    title: "Going Home", titleArmenian: "Tun gnal",
    description: "Khos tan ev sharzman mashin",
    cefr: "A1", difficulty: 1, prerequisiteLessons: ["lesson_1"],
    hayqTotal: 110, estimatedMinutes: 10,
    grammarFocus: ["nерка sharunaкan", "azat barakan"],
    vocabularyFocus: ["tun", "gnal", "aprel", "Erevan"],
    exercises: safe(
      generateTranslationExercise("sp_001", "lesson_2", "unit_home"),
      generateTranslationExercise("sp_005", "lesson_2", "unit_home"),
      generateWordOrderExercise("sp_001", "lesson_2", "unit_home"),
      generateWordOrderExercise("sp_005", "lesson_2", "unit_home"),
      // home_001=տun, home_002=senyak, city_002=Erevan
      generateMCExercise(byId("home_001"), "lesson_2", "unit_home",
        safeList(["home_002","home_003","city_002"])),
    ),
  },
  {
    id: "lesson_3", unitId: "unit_food",
    title: "Eating & Drinking", titleArmenian: "Utel u Xmel",
    description: "Utелiki barapashar u zruytsner",
    cefr: "A1", difficulty: 1, prerequisiteLessons: ["lesson_1"],
    hayqTotal: 100, estimatedMinutes: 9,
    grammarFocus: ["ughjigh xndir", "bayi xonarhum"],
    vocabularyFocus: ["utel", "xmel", "hac", "jur"],
    exercises: safe(
      generateTranslationExercise("sp_002", "lesson_3", "unit_food"),
      generateTranslationExercise("sp_020", "lesson_3", "unit_food"),
      generateWordOrderExercise("sp_002", "lesson_3", "unit_food"),
      // food_001=ջuр, food_002=hac, food_009=surj, food_010=tey
      generateMCExercise(byId("food_001"), "lesson_3", "unit_food",
        safeList(["food_009","food_010","food_003"])),
      generateMCExercise(byId("food_002"), "lesson_3", "unit_food",
        safeList(["food_005","food_006","food_007"])),
    ),
  },
  {
    id: "lesson_4", unitId: "unit_family",
    title: "My Family", titleArmenian: "Im Yntaniqy",
    description: "Yntaniqui andamner u statsakan holog",
    cefr: "A1", difficulty: 1, prerequisiteLessons: ["lesson_2"],
    hayqTotal: 120, estimatedMinutes: 11,
    grammarFocus: ["statsakan hodер", "masnagiтut'yunner"],
    vocabularyFocus: ["mayrs", "hayrs", "bjshkuhi", "usucich"],
    exercises: safe(
      generateTranslationExercise("sp_006", "lesson_4", "unit_family"),
      generateTranslationExercise("sp_007", "lesson_4", "unit_family"),
      generateTranslationExercise("sp_004", "lesson_4", "unit_family"),
      generateWordOrderExercise("sp_006", "lesson_4", "unit_family"),
      // prof_002=bjshkuhi, prof_001=bjishk, prof_003=usucich, edu_003=usanox
      generateMCExercise(byId("prof_002"), "lesson_4", "unit_family",
        safeList(["prof_001","prof_003","edu_003"])),
      // fam_001=mayr, fam_002=hayr, fam_005=quyr, fam_006=yeghbayr
      generateMCExercise(byId("fam_001"), "lesson_4", "unit_family",
        safeList(["fam_002","fam_005","fam_006"])),
    ),
  },
  {
    id: "lesson_5", unitId: "unit_education",
    title: "School & Books", titleArmenian: "Dprots u Gark",
    description: "Krtakan barapashar",
    cefr: "A2", difficulty: 2, prerequisiteLessons: ["lesson_4"],
    hayqTotal: 130, estimatedMinutes: 12,
    grammarFocus: ["nерка sharunaкan (kardal/grel)", "nergoyakan holog"],
    vocabularyFocus: ["dprots", "gark", "kardalel", "grel"],
    exercises: safe(
      generateTranslationExercise("sp_008", "lesson_5", "unit_education"),
      generateWordOrderExercise("sp_008", "lesson_5", "unit_education"),
      // edu_002=gark, edu_001=dprots, tech_001=hagelust
      generateMCExercise(byId("edu_002"), "lesson_5", "unit_education",
        safeList(["edu_001","home_007","tech_001"])),
      // edu_003=usanox, edu_004=ashakert, prof_003=usucich
      generateMCExercise(byId("edu_003"), "lesson_5", "unit_education",
        safeList(["edu_004","prof_003","fam_009"])),
    ),
  },
];

// ── Utilities ──────────────────────────────────────────────────────────────────
function diffToCEFR(d: number): CEFRLevel {
  return (["A1","A1","A2","B1","B2","C1"] as CEFRLevel[])[Math.min(d,5)] ?? "A1";
}
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

export const getLessonById     = (id: string) => LESSONS.find(l => l.id === id);
export const getUnitById       = (id: string) => UNITS.find(u => u.id === id);
export const getLessonsForUnit = (uid: string) => LESSONS.filter(l => l.unitId === uid);
export const scoreToGrade      = (s: number) =>
  s >= 0.98 ? "perfect" : s >= 0.85 ? "excellent" : s >= 0.75 ? "good" : s >= 0.5 ? "partial" : "incorrect";
