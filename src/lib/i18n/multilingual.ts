/**
 * NUR Lingo v4 — Multilingual Lesson Content
 * 6 language pair directions, each with own lessons and exercises.
 *
 * HY→EN: Armenian speakers learn English
 * HY→RU: Armenian speakers learn Russian
 * EN→HY: English speakers learn Armenian
 * EN→RU: English speakers learn Russian
 * RU→HY: Russian speakers learn Armenian
 * RU→EN: Russian speakers learn English
 */

import type { LangPair } from "../i18n/index";

export interface MultiLessonUnit {
  id: string;
  emoji: string;
  colorFrom: string;
  colorTo: string;
  title: Record<string, string>;       // per display language
  description: Record<string, string>;
}

export interface MultiLesson {
  id: string;
  unitId: string;
  title: Record<string, string>;
  hayqTotal: number;
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  cefr: string;
  exercises: MultiExercise[];
}

export interface MultiExercise {
  id: string;
  type: "translate" | "multiple_choice" | "word_order";
  // The question shown (in native language)
  prompt: Record<string, string>;
  // The correct answer (in target language)
  targetAnswer: string;
  acceptableAnswers: string[];
  options?: string[];                  // for multiple_choice
  words?: string[];                    // for word_order
  hayqReward: number;
  hint?: Record<string, string>;
}

// ── HY→EN: Armenian learning English ─────────────────────────────────────────
const HY_EN_UNITS: MultiLessonUnit[] = [
  { id:"u1", emoji:"👋", colorFrom:"#D90012", colorTo:"#8b0000",
    title:{ hy:"Ողջuynnеr", en:"Greetings", ru:"Приветствия" },
    description:{ hy:"Arlajin angleren barery", en:"First English words", ru:"Первые слова на английском" } },
  { id:"u2", emoji:"🏠", colorFrom:"#0033A0", colorTo:"#001a6b",
    title:{ hy:"Tun ev Kentagh", en:"Home & Life", ru:"Дом и быт" },
    description:{ hy:"Tani u kenсагhаyin barапаshar", en:"Home vocabulary", ru:"Словарь дома" } },
  { id:"u3", emoji:"🍽️", colorFrom:"#F2A800", colorTo:"#b07800",
    title:{ hy:"Utelik ev Xmelik", en:"Food & Drink", ru:"Еда и напитки" },
    description:{ hy:"Utелiki angleren anunnery", en:"English food vocabulary", ru:"Английские слова про еду" } },
];

const HY_EN_LESSONS: MultiLesson[] = [
  {
    id:"hyen_l1", unitId:"u1", cefr:"A1", difficulty:1,
    title:{ hy:"Bari luyss angleren", en:"Hello in English", ru:"Привет по-английски" },
    hayqTotal:80, estimatedMinutes:7,
    exercises:[
      { id:"e1", type:"multiple_choice",
        prompt:{ hy:"«Barev» angleren ew inch e?", en:"How do you say «Barev» in English?", ru:"Как «Barев» по-английски?" },
        targetAnswer:"Hello", acceptableAnswers:["Hello","Hi","Hey"],
        options:["Hello","Goodbye","Please","Sorry"],
        hayqReward:8 },
      { id:"e2", type:"translate",
        prompt:{ hy:"Targmanel angleren: «Ынчпes es?»", en:"Translate: «Ynchhpes es?»", ru:"Переведи: «Ынчпэс эс?»" },
        targetAnswer:"How are you?",
        acceptableAnswers:["How are you?","How are you","How r u"],
        hayqReward:10 },
      { id:"e3", type:"word_order",
        prompt:{ hy:"Dasavorel angleren barery", en:"Arrange the English words", ru:"Составь английские слова" },
        targetAnswer:"I am fine thank you",
        acceptableAnswers:["I am fine thank you","I'm fine thank you","I am fine, thank you"],
        words:["I","am","fine","thank","you"],
        hayqReward:12 },
      { id:"e4", type:"multiple_choice",
        prompt:{ hy:"«Shnorhakalut'yun» angleren", en:"«Thank you» in English", ru:"«Спасибо» по-английски" },
        targetAnswer:"Thank you",
        acceptableAnswers:["Thank you","Thanks"],
        options:["Thank you","Sorry","Please","Excuse me"],
        hayqReward:8 },
    ],
  },
  {
    id:"hyen_l2", unitId:"u1", cefr:"A1", difficulty:1,
    title:{ hy:"Yes em...", en:"I am...", ru:"Я есть..." },
    hayqTotal:90, estimatedMinutes:8,
    exercises:[
      { id:"e1", type:"translate",
        prompt:{ hy:"Targmanel angleren: «Ës ousanox em»", en:"Translate: I am a student", ru:"Переведи: Я студент" },
        targetAnswer:"I am a student",
        acceptableAnswers:["I am a student","I'm a student"],
        hint:{ hy:"Yes = I, em = am", en:"Yes = I, em = am", ru:"Yes = I, em = am" },
        hayqReward:12 },
      { id:"e2", type:"multiple_choice",
        prompt:{ hy:"«Ës»-i angleren targmanut'yuny", en:"English for «Yes»", ru:"«Yes» по-английски" },
        targetAnswer:"I",
        acceptableAnswers:["I"],
        options:["I","He","She","We"],
        hayqReward:8 },
      { id:"e3", type:"translate",
        prompt:{ hy:"Targmanel angleren: «Ës hаy em»", en:"Translate: I am Armenian", ru:"Переведи: Я армянин" },
        targetAnswer:"I am Armenian",
        acceptableAnswers:["I am Armenian","I'm Armenian"],
        hayqReward:12 },
    ],
  },
];

// ── EN→HY: English speakers learn Armenian ────────────────────────────────────
const EN_HY_UNITS: MultiLessonUnit[] = [
  { id:"u1", emoji:"👋", colorFrom:"#D90012", colorTo:"#8b0000",
    title:{ en:"Greetings", hy:"Vogjuynner", ru:"Приветствия" },
    description:{ en:"First Armenian words", hy:"Arlajin hаyeren barery", ru:"Первые армянские слова" } },
  { id:"u2", emoji:"🏠", colorFrom:"#0033A0", colorTo:"#001a6b",
    title:{ en:"Home & Life", hy:"Tun ev Kentagh", ru:"Дом и быт" },
    description:{ en:"Armenian home vocabulary", hy:"Tani barapashar hayerenom", ru:"Армянский словарь дома" } },
  { id:"u3", emoji:"👨‍👩‍👧", colorFrom:"#F2A800", colorTo:"#b07800",
    title:{ en:"Family", hy:"Yntaniq", ru:"Семья" },
    description:{ en:"Armenian family vocabulary", hy:"Yntaniqui barапасhar", ru:"Армянский словарь семьи" } },
];

const EN_HY_LESSONS: MultiLesson[] = [
  {
    id:"enhy_l1", unitId:"u1", cefr:"A1", difficulty:1,
    title:{ en:"Hello in Armenian", hy:"Barev hayeren", ru:"Привет по-армянски" },
    hayqTotal:80, estimatedMinutes:7,
    exercises:[
      { id:"e1", type:"multiple_choice",
        prompt:{ en:"How do you say «Hello» in Armenian?", hy:"Inch e «Hello»-y hayerenom?", ru:"Как «Hello» по-армянски?" },
        targetAnswer:"Barев",
        acceptableAnswers:["Barев","Vogjuyn"],
        options:["Barев","Shnorhakalut'yun","Neroghut'yun","Vogjuyn"],
        hayqReward:8 },
      { id:"e2", type:"translate",
        prompt:{ en:"Translate to Armenian: «How are you?»", hy:"Targmanel hayeren: «How are you?»", ru:"Переведи на армянский: «How are you?»" },
        targetAnswer:"Ынчпес ес",
        acceptableAnswers:["Ынчпес ес","Ynchpes es","Inch pes es","Vontsch es"],
        hint:{ en:"Armenian: Ынчпес ес (Ynchpes es)", hy:"Hayeren: Ынчпес ес", ru:"По-армянски: Ынчпес ес" },
        hayqReward:12 },
      { id:"e3", type:"word_order",
        prompt:{ en:"Arrange the Armenian words for: I am fine", hy:"Dasavorel bardery «I am fine»-y hayerenom", ru:"Составь армянские слова: I am fine" },
        targetAnswer:"Ës lav em",
        acceptableAnswers:["Ës lav em","Lav em","Ës shat lav em"],
        words:["Ës","lav","em"],
        hayqReward:12 },
    ],
  },
  {
    id:"enhy_l2", unitId:"u1", cefr:"A1", difficulty:1,
    title:{ en:"I am going home", hy:"Tun gnum em", ru:"Иду домой" },
    hayqTotal:100, estimatedMinutes:9,
    exercises:[
      { id:"e1", type:"multiple_choice",
        prompt:{ en:"«Home» in Armenian is:", hy:"«Home»-y hayerenom", ru:"«Дом» по-армянски:" },
        targetAnswer:"Tun",
        acceptableAnswers:["Tun","Bnakaran"],
        options:["Tun","Senyak","Dprots","Kaghak"],
        hayqReward:8 },
      { id:"e2", type:"translate",
        prompt:{ en:"Translate to Armenian: «I am going home»", hy:"Targmanel hayeren: «I am going home»", ru:"Переведи на армянский: «I am going home»" },
        targetAnswer:"Ës gnum em tun",
        acceptableAnswers:["Ës gnum em tun","Ës tun em gnum","Tun em gnum","Gnum em tun"],
        hint:{ en:"Word order is flexible in Armenian!", hy:"Hayerenoom azat barakarg ka!", ru:"В армянском свободный порядок слов!" },
        hayqReward:15 },
      { id:"e3", type:"word_order",
        prompt:{ en:"Arrange: I love Armenia", hy:"Dasavorel: I love Armenia", ru:"Составь: I love Armenia" },
        targetAnswer:"Ës sirum em Hayastany",
        acceptableAnswers:["Ës sirum em Hayastany","Hayastany sirum em","Ës Hayastany sirum em"],
        words:["Ës","sirum","em","Hayastany"],
        hayqReward:12 },
    ],
  },
  {
    id:"enhy_l3", unitId:"u2", cefr:"A1", difficulty:1,
    title:{ en:"My Family", hy:"Im Yntaniqy", ru:"Моя семья" },
    hayqTotal:110, estimatedMinutes:10,
    exercises:[
      { id:"e1", type:"multiple_choice",
        prompt:{ en:"«Mother» in Armenian:", hy:"«Mother»-y hayerenom", ru:"«Мама» по-армянски:" },
        targetAnswer:"Mayr",
        acceptableAnswers:["Mayr","Mayrik"],
        options:["Mayr","Hayr","Quyr","Yeghbayr"],
        hayqReward:8 },
      { id:"e2", type:"translate",
        prompt:{ en:"Translate: My mother is a doctor", hy:"Targmanel: My mother is a doctor", ru:"Переведи: Моя мама — врач" },
        targetAnswer:"Mayrs bjshkuhi e",
        acceptableAnswers:["Mayrs bjshkuhi e","Mayrs bjishk e","Im mayry bjshkuhi e","Mayikms bjshkuhi e"],
        hint:{ en:"Use possessive suffix: Mayrs = My mother", hy:"Statsakan verjunov: Mayrs = im mayry", ru:"Притяжательный суффикс: Mayrs = Моя мама" },
        hayqReward:15 },
      { id:"e3", type:"multiple_choice",
        prompt:{ en:"«Sister» in Armenian:", hy:"«Sister»-y hayerenom", ru:"«Сестра» по-армянски:" },
        targetAnswer:"Quyr",
        acceptableAnswers:["Quyr"],
        options:["Quyr","Yeghbayr","Mayr","Fam"],
        hayqReward:8 },
    ],
  },
];

// ── RU→HY: Russian speakers learn Armenian ────────────────────────────────────
const RU_HY_UNITS: MultiLessonUnit[] = [
  { id:"u1", emoji:"👋", colorFrom:"#D90012", colorTo:"#8b0000",
    title:{ ru:"Приветствия", hy:"Vogjuynner", en:"Greetings" },
    description:{ ru:"Первые армянские слова", hy:"Arlajin hаyeren barery", en:"First Armenian words" } },
  { id:"u2", emoji:"🏠", colorFrom:"#0033A0", colorTo:"#001a6b",
    title:{ ru:"Дом и быт", hy:"Tun ev Kentagh", en:"Home & Life" },
    description:{ ru:"Армянский словарь дома", hy:"Tani barapashar", en:"Armenian home vocab" } },
];

const RU_HY_LESSONS: MultiLesson[] = [
  {
    id:"ruhy_l1", unitId:"u1", cefr:"A1", difficulty:1,
    title:{ ru:"Привет по-армянски", hy:"Barev hayeren", en:"Hello in Armenian" },
    hayqTotal:80, estimatedMinutes:7,
    exercises:[
      { id:"e1", type:"multiple_choice",
        prompt:{ ru:"«Привет» по-армянски — это:", hy:"«Barев»-y russerenom", en:"«Hello» in Armenian" },
        targetAnswer:"Barев",
        acceptableAnswers:["Barев","Vogjuyn"],
        options:["Barев","Shnorhakalut'yun","Voch","Ayo"],
        hayqReward:8 },
      { id:"e2", type:"translate",
        prompt:{ ru:"Переведи на армянский: «Как дела?»", hy:"Targmanel hayeren: «Как дела?»", en:"Translate to Armenian" },
        targetAnswer:"Ынчпес ес",
        acceptableAnswers:["Ынчпес ес","Inch pes es","Vontsch es"],
        hint:{ ru:"Армянский: Ынчпес ес (Ynchpes es)", hy:"Hayeren: Ынчпес ес", en:"Armenian: Ynchpes es" },
        hayqReward:12 },
      { id:"e3", type:"translate",
        prompt:{ ru:"Переведи: «Я иду домой»", hy:"Targmanel: «Ya idu domoy»", en:"Translate: I am going home" },
        targetAnswer:"Ës gnum em tun",
        acceptableAnswers:["Ës gnum em tun","Ës tun em gnum","Tun em gnum"],
        hint:{ ru:"В армянском свободный порядок слов!", hy:"Hayerenoom azat barakarg ka!", en:"Free word order in Armenian!" },
        hayqReward:15 },
    ],
  },
  {
    id:"ruhy_l2", unitId:"u2", cefr:"A1", difficulty:1,
    title:{ ru:"Моя семья", hy:"Im Yntaniqy", en:"My Family" },
    hayqTotal:90, estimatedMinutes:8,
    exercises:[
      { id:"e1", type:"multiple_choice",
        prompt:{ ru:"«Мама» по-армянски:", hy:"«Мама»-n hayerenom", en:"Mom in Armenian" },
        targetAnswer:"Mayrik",
        acceptableAnswers:["Mayrik","Mayr"],
        options:["Mayrik","Hayrik","Quyr","Yeghbayr"],
        hayqReward:8 },
      { id:"e2", type:"translate",
        prompt:{ ru:"Переведи: «Моя мама — врач»", hy:"Targmanel: «Мама моя врач»", en:"Translate: My mother is a doctor" },
        targetAnswer:"Mayrs bjshkuhi e",
        acceptableAnswers:["Mayrs bjshkuhi e","Mayrs bjishk e","Im mayry bjshkuhi e"],
        hayqReward:15 },
    ],
  },
];

// ── HY→RU: Armenian speakers learn Russian ────────────────────────────────────
const HY_RU_LESSONS: MultiLesson[] = [
  {
    id:"hyru_l1", unitId:"u1", cefr:"A1", difficulty:1,
    title:{ hy:"Barev russerenom", ru:"Привет по-русски", en:"Hello in Russian" },
    hayqTotal:80, estimatedMinutes:7,
    exercises:[
      { id:"e1", type:"multiple_choice",
        prompt:{ hy:"«Barев»-y russerenom inch e?", ru:"«Barев» по-русски:", en:"«Hello» in Russian" },
        targetAnswer:"Привет",
        acceptableAnswers:["Привет","Здравствуйте"],
        options:["Привет","Пожалуйста","Спасибо","Извините"],
        hayqReward:8 },
      { id:"e2", type:"translate",
        prompt:{ hy:"Targmanel russerenom: «Ынчпес ес?»", ru:"Переведи: «Ынчпес ес?»", en:"Translate: How are you?" },
        targetAnswer:"Как дела?",
        acceptableAnswers:["Как дела?","Как дела","Как ты?"],
        hayqReward:12 },
      { id:"e3", type:"multiple_choice",
        prompt:{ hy:"«Shnorhakalut'yun»-y russerenom", ru:"«Спасибо» по-армянски это:", en:"Thank you in Russian" },
        targetAnswer:"Спасибо",
        acceptableAnswers:["Спасибо"],
        options:["Спасибо","Извините","Пожалуйста","Здравствуйте"],
        hayqReward:8 },
    ],
  },
];

// ── EN→RU, RU→EN: simpler stubs ──────────────────────────────────────────────
const EN_RU_LESSONS: MultiLesson[] = [
  {
    id:"enru_l1", unitId:"u1", cefr:"A1", difficulty:1,
    title:{ en:"Hello in Russian", ru:"Привет по-русски", hy:"Barev russerenom" },
    hayqTotal:80, estimatedMinutes:7,
    exercises:[
      { id:"e1", type:"multiple_choice",
        prompt:{ en:"«Hello» in Russian:", ru:"«Hello» по-русски:", hy:"«Hello»-y russerenom" },
        targetAnswer:"Привет",
        acceptableAnswers:["Привет","Здравствуйте"],
        options:["Привет","Спасибо","Пожалуйста","Извините"],
        hayqReward:8 },
      { id:"e2", type:"translate",
        prompt:{ en:"Translate to Russian: «I am a student»", ru:"Переведи: I am a student", hy:"Targmanel russeren" },
        targetAnswer:"Я студент",
        acceptableAnswers:["Я студент","Я студентка","Я являюсь студентом"],
        hayqReward:12 },
    ],
  },
];

const RU_EN_LESSONS: MultiLesson[] = [
  {
    id:"ruen_l1", unitId:"u1", cefr:"A1", difficulty:1,
    title:{ ru:"Привет по-английски", en:"Hello in English", hy:"Barev angleren" },
    hayqTotal:80, estimatedMinutes:7,
    exercises:[
      { id:"e1", type:"multiple_choice",
        prompt:{ ru:"«Привет» по-английски:", en:"«Hello» in English", hy:"«Barев»-y angleren" },
        targetAnswer:"Hello",
        acceptableAnswers:["Hello","Hi","Hey"],
        options:["Hello","Goodbye","Sorry","Please"],
        hayqReward:8 },
      { id:"e2", type:"translate",
        prompt:{ ru:"Переведи на английский: «Как дела?»", en:"Translate: How are you?", hy:"Targmanel angleren" },
        targetAnswer:"How are you?",
        acceptableAnswers:["How are you?","How are you","How r u"],
        hayqReward:12 },
    ],
  },
];

// ── Master registry ────────────────────────────────────────────────────────────
export const MULTI_UNITS: Record<LangPair, MultiLessonUnit[]> = {
  "hy-en": HY_EN_UNITS,
  "en-hy": EN_HY_UNITS,
  "ru-hy": RU_HY_UNITS,
  "hy-ru": [
    { id:"u1", emoji:"🇷🇺", colorFrom:"#D90012", colorTo:"#0033A0",
      title:{ hy:"Vogjuynner", ru:"Приветствия", en:"Greetings" },
      description:{ hy:"Arlajin russeren barery", ru:"Первые русские слова", en:"First Russian words" } },
  ],
  "en-ru": [
    { id:"u1", emoji:"🇷🇺", colorFrom:"#0033A0", colorTo:"#F2A800",
      title:{ en:"Russian Basics", ru:"Основы русского", hy:"Russereni himerunqner" },
      description:{ en:"First Russian words", ru:"Первые русские слова", hy:"Arlajin russeren barery" } },
  ],
  "ru-en": [
    { id:"u1", emoji:"🇬🇧", colorFrom:"#0033A0", colorTo:"#D90012",
      title:{ ru:"Основы английского", en:"English Basics", hy:"Angliereni himerunqner" },
      description:{ ru:"Первые английские слова", en:"First English words", hy:"Arlajin anglieren barery" } },
  ],
};

export const MULTI_LESSONS: Record<LangPair, MultiLesson[]> = {
  "hy-en": HY_EN_LESSONS,
  "en-hy": EN_HY_LESSONS,
  "ru-hy": RU_HY_LESSONS,
  "hy-ru": HY_RU_LESSONS,
  "en-ru": EN_RU_LESSONS,
  "ru-en": RU_EN_LESSONS,
};

export function getLessonsForPair(pair: LangPair): MultiLesson[] {
  return MULTI_LESSONS[pair] ?? [];
}

export function getUnitsForPair(pair: LangPair): MultiLessonUnit[] {
  return MULTI_UNITS[pair] ?? [];
}

export function getLessonById(pair: LangPair, id: string): MultiLesson | undefined {
  return MULTI_LESSONS[pair]?.find(l => l.id === id);
}
