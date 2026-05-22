/**
 * NUR Lingo v4 — Pomegranate Seed Reward System
 * Dual economy: HAYQ Points (frequent) + Pomegranate Seeds (rare, symbolic)
 *
 * Seeds are earned through:
 * - Perfect lesson streaks
 * - Milestone completions
 * - Special achievements
 *
 * The user's central pomegranate grows visually with each seed collected.
 */

export type SeedType = "normal" | "golden" | "crystal" | "legendary";

export interface PomSeed {
  id: string;
  type: SeedType;
  label: string;
  labelRu: string;
  labelHy: string;
  description: string;
  emoji: string;
  color: string;
  glowColor: string;
  earnedAt?: number;  // timestamp
  reason?: string;
}

export const SEED_DEFINITIONS: Record<string, Omit<PomSeed, "id" | "earnedAt" | "reason">> = {
  first_lesson: {
    type: "normal",
    label: "First Lesson",
    labelRu: "Первый урок",
    labelHy: "Аrlajin das",
    description: "Complete your very first lesson",
    emoji: "🌱",
    color: "#4ade80",
    glowColor: "rgba(74,222,128,0.4)",
  },
  perfect_lesson: {
    type: "golden",
    label: "Perfect Lesson",
    labelRu: "Идеальный урок",
    labelHy: "Катаryаl das",
    description: "Complete a lesson with 100% score",
    emoji: "⭐",
    color: "#F2A800",
    glowColor: "rgba(242,168,0,0.4)",
  },
  streak_3: {
    type: "normal",
    label: "3-Day Streak",
    labelRu: "3 дня подряд",
    labelHy: "3 orvа shаrunаkvutʻyun",
    description: "Learn 3 days in a row",
    emoji: "🔥",
    color: "#f97316",
    glowColor: "rgba(249,115,22,0.4)",
  },
  streak_7: {
    type: "golden",
    label: "Week Warrior",
    labelRu: "Неделя побед",
    labelHy: "Shаbаtvy аrmаtаkаn",
    description: "7-day learning streak",
    emoji: "💎",
    color: "#60a5fa",
    glowColor: "rgba(96,165,250,0.4)",
  },
  streak_30: {
    type: "crystal",
    label: "Month Master",
    labelRu: "Мастер месяца",
    labelHy: "Amsvy vаrpаyet",
    description: "30-day learning streak",
    emoji: "🏆",
    color: "#a855f7",
    glowColor: "rgba(168,85,247,0.4)",
  },
  unit_complete: {
    type: "golden",
    label: "Unit Complete",
    labelRu: "Раздел пройден",
    labelHy: "Bаjiny аvelogh",
    description: "Complete an entire unit",
    emoji: "🎯",
    color: "#D90012",
    glowColor: "rgba(217,0,18,0.4)",
  },
  word_100: {
    type: "crystal",
    label: "100 Words",
    labelRu: "100 слов",
    labelHy: "100 bаrer",
    description: "Learn 100 vocabulary words",
    emoji: "📚",
    color: "#0033A0",
    glowColor: "rgba(0,51,160,0.4)",
  },
  multilingual: {
    type: "legendary",
    label: "Polyglot",
    labelRu: "Полиглот",
    labelHy: "Bаzаlezvi",
    description: "Start learning a third language",
    emoji: "🌍",
    color: "#F2A800",
    glowColor: "rgba(242,168,0,0.6)",
  },
};

// ── Seed state (localStorage) ─────────────────────────────────────────────────
export const SEEDS_KEY = "nur_lingo_seeds_v4";
export const HAYQ_KEY  = "nur_lingo_hayq_v4";

export interface RewardState {
  hayq: number;
  seeds: PomSeed[];
  streak: number;
  lastStudyDate: string | null;  // ISO date string
  totalLessons: number;
  wordsLearned: number;
}

export const DEFAULT_STATE: RewardState = {
  hayq: 0,
  seeds: [],
  streak: 0,
  lastStudyDate: null,
  totalLessons: 0,
  wordsLearned: 0,
};

export function loadRewards(): RewardState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(SEEDS_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveRewards(state: RewardState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEDS_KEY, JSON.stringify(state));
}

export function addHAYQ(current: RewardState, amount: number): RewardState {
  return { ...current, hayq: current.hayq + amount };
}

export function awardSeed(current: RewardState, seedKey: string, reason: string): RewardState {
  const def = SEED_DEFINITIONS[seedKey];
  if (!def) return current;
  // Don't duplicate seeds of same type
  if (current.seeds.some(s => s.label === def.label)) return current;
  const seed: PomSeed = {
    id: `${seedKey}_${Date.now()}`,
    ...def,
    earnedAt: Date.now(),
    reason,
  };
  return { ...current, seeds: [...current.seeds, seed] };
}

export function updateStreak(current: RewardState): RewardState {
  const today = new Date().toISOString().split("T")[0];
  if (current.lastStudyDate === today) return current;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newStreak = current.lastStudyDate === yesterday ? current.streak + 1 : 1;
  return { ...current, streak: newStreak, lastStudyDate: today };
}

// Pomegranate visual growth: 0-100% fullness based on seed count + type
export function getPomGrowth(seeds: PomSeed[]): number {
  const weights: Record<SeedType, number> = {
    normal: 3, golden: 7, crystal: 15, legendary: 30,
  };
  const total = seeds.reduce((sum, s) => sum + weights[s.type], 0);
  return Math.min(total, 100);
}
