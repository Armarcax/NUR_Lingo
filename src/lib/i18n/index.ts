/**
 * NUR Lingo v4 — Multilingual Direction System
 * Supports all 6 language pair directions:
 * HY↔EN, HY↔RU, EN↔RU
 */

export type LangCode = "hy" | "en" | "ru";

export interface LanguageInfo {
  code: LangCode;
  name: string;           // English name
  nativeName: string;     // Name in own language
  flag: string;           // emoji flag
  dir: "ltr" | "rtl";
  fontClass: string;
}

export const LANGUAGES: Record<LangCode, LanguageInfo> = {
  hy: {
    code: "hy",
    name: "Armenian",
    nativeName: "Հայerен",
    flag: "🇦🇲",
    dir: "ltr",
    fontClass: "font-armenian",
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    dir: "ltr",
    fontClass: "font-mono",
  },
  ru: {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    dir: "ltr",
    fontClass: "font-mono",
  },
};

export type LangPair = "hy-en" | "hy-ru" | "en-hy" | "en-ru" | "ru-hy" | "ru-en";

export interface UserLangConfig {
  native: LangCode;
  learning: LangCode;
  pair: LangPair;
}

export function makePair(native: LangCode, learning: LangCode): LangPair {
  return `${native}-${learning}` as LangPair;
}

export function parsePair(pair: LangPair): { native: LangCode; learning: LangCode } {
  const [native, learning] = pair.split("-") as [LangCode, LangCode];
  return { native, learning };
}

// All valid language pairs
export const VALID_PAIRS: LangPair[] = [
  "hy-en", "hy-ru",
  "en-hy", "en-ru",
  "ru-hy", "ru-en",
];

export function isValidPair(pair: string): pair is LangPair {
  return VALID_PAIRS.includes(pair as LangPair);
}

// UI strings per language
export const UI_STRINGS: Record<LangCode, {
  learn: string;
  continue: string;
  correct: string;
  wrong: string;
  translate: string;
  arrange: string;
  choose: string;
  check: string;
  next: string;
  goodMorning: string;
  streak: string;
  hayq: string;
  seeds: string;
  lesson: string;
  unit: string;
}> = {
  hy: {
    learn: "Սовоrum",
    continue: "Sharunakel →",
    correct: "Ëntrel e! ✅",
    wrong: "Voch ëntrel ❌",
    translate: "Тargmanel hayeren",
    arrange: "Dasavorel bardery",
    choose: "Ëntrel ëntrel",
    check: "Stugel →",
    next: "Sharunakel →",
    goodMorning: "Bari loys",
    streak: "Sharunakvutʻyun",
    hayq: "HAYQ",
    seeds: "Nur Seeds",
    lesson: "Dаs",
    unit: "Bajin",
  },
  en: {
    learn: "Learn",
    continue: "Continue →",
    correct: "Correct! ✅",
    wrong: "Not quite ❌",
    translate: "Translate to Armenian",
    arrange: "Arrange the words",
    choose: "Choose the answer",
    check: "Check →",
    next: "Continue →",
    goodMorning: "Good morning",
    streak: "Streak",
    hayq: "HAYQ",
    seeds: "Nur Seeds",
    lesson: "Lesson",
    unit: "Unit",
  },
  ru: {
    learn: "Учиться",
    continue: "Продолжить →",
    correct: "Правильно! ✅",
    wrong: "Не совсем ❌",
    translate: "Переведи на армянский",
    arrange: "Составь слова",
    choose: "Выбери ответ",
    check: "Проверить →",
    next: "Продолжить →",
    goodMorning: "Доброе утро",
    streak: "Серия",
    hayq: "HAYQ",
    seeds: "Зёрна Нура",
    lesson: "Урок",
    unit: "Раздел",
  },
};

// LocalStorage key
export const LANG_CONFIG_KEY = "nur_lingo_lang_v4";

export function saveLangConfig(config: UserLangConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LANG_CONFIG_KEY, JSON.stringify(config));
  }
}

export function loadLangConfig(): UserLangConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LANG_CONFIG_KEY);
    if (!raw) return null;
    const config = JSON.parse(raw) as UserLangConfig;
    if (!isValidPair(config.pair)) return null;
    return config;
  } catch {
    return null;
  }
}
