/**
 * NUR Lingo — Multilingual Content v2
 * Supports 6 learning directions between Armenian (HY), English (EN), and Russian (RU).
 */

export type LangCode = "en" | "hy" | "ru";
export type LangPair = "en-hy" | "hy-en" | "ru-hy" | "hy-ru" | "en-ru" | "ru-en";

export interface MultiExercise {
  id: string;
  type: "multiple_choice" | "translate" | "word_order";
  prompt: Record<LangCode, string>;
  targetAnswer: string;
  acceptableAnswers?: string[];
  options?: string[];
  words?: string[];
  hint?: Record<LangCode, string>;
}

export interface MultiLesson {
  id: string;
  unitId: string;
  title: Record<LangCode, string>;
  description: Record<LangCode, string>;
  estimatedMinutes: number;
  hayqTotal: number;
  exercises: MultiExercise[];
}

export interface MultiUnit {
  id: string;
  title: Record<LangCode, string>;
  description: Record<LangCode, string>;
  iconEmoji: string;
  colorFrom: string;
  colorTo: string;
  lessons: string[];
}

export const MULTI_UNITS: MultiUnit[] = [
  {
    id: "unit_1",
    title: { en: "Greetings & Basics", hy: "Ողջույններ և Հիմունքներ", ru: "Приветствия и Основы" },
    description: { en: "First words and common phrases", hy: "Առաջին բառերը և տարածված արտահայտությունները", ru: "Первые слова и основные фразы" },
    iconEmoji: "👋", colorFrom: "#D90012", colorTo: "#8b0000",
    lessons: ["l1", "l2", "l3", "l4", "l5"]
  },
  {
    id: "unit_2",
    title: { en: "I am / You are", hy: "Ես եմ / Դու ես", ru: "Я / Ты" },
    description: { en: "Pronouns and 'to be' verb", hy: "Դերանուններ և «լինել» բայը", ru: "Местоимения и глагол 'быть'" },
    iconEmoji: "👤", colorFrom: "#0033A0", colorTo: "#001a6b",
    lessons: ["l6", "l7", "l8", "l9", "l10"]
  }
];

// Content for PAIR: hy-en (Armenian speaks learns English)
const HY_EN_LESSONS: MultiLesson[] = [
  {
    id: "hyen_l1", unitId: "unit_1",
    title: { hy: "Ողջույն", en: "Greetings", ru: "Приветствие" },
    description: { hy: "Ինչպե՞ս ողջունել անգլերեն", en: "How to greet in English", ru: "Как здороваться по-английски" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "hyen_e1", type: "multiple_choice",
        prompt: { hy: "«Բարև»-ի անգլերեն թարգմանությունը", en: "English for «Barev»", ru: "«Barev» по-английски" },
        targetAnswer: "Hello", options: ["Hello", "Goodbye", "Please", "Sorry"] },
      { id: "hyen_e2", type: "translate",
        prompt: { hy: "Թարգմանել անգլերեն՝ «Ինչպե՞ս ես»", en: "Translate to English", ru: "Переведи на английский" },
        targetAnswer: "How are you?", acceptableAnswers: ["How are you?", "How are you", "How r u"] },
      { id: "hyen_e3", type: "word_order",
        prompt: { hy: "Դասավորել անգլերեն բառերը", en: "Arrange English words", ru: "Составь английские слова" },
        targetAnswer: "I am fine thank you", words: ["I", "am", "fine", "thank", "you"] },
      { id: "hyen_e4", type: "multiple_choice",
        prompt: { hy: "«Շնորհակալություն»-ը անգլերեն", en: "«Thanks» in English", ru: "«Спасибо» по-английски" },
        targetAnswer: "Thank you", options: ["Thank you", "Sorry", "Excuse me", "Please"] },
    ]
  },
  {
    id: "hyen_l2", unitId: "unit_2",
    title: { hy: "Ես ուսանող եմ", en: "I am a student", ru: "Я студент" },
    description: { hy: "Անձնական դերանուններ", en: "Personal pronouns", ru: "Личные местоимения" },
    estimatedMinutes: 6, hayqTotal: 60,
    exercises: [
      { id: "hyen_e5", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Ես ուսանող եմ»", en: "Translate", ru: "Переведи" },
        targetAnswer: "I am a student", acceptableAnswers: ["I am a student", "I'm a student"] },
      { id: "hyen_e6", type: "multiple_choice",
        prompt: { hy: "«Ես»-ի անգլերեն թարգմանությունը", en: "«I» in English", ru: "«Я» по-английски" },
        targetAnswer: "I", options: ["I", "He", "She", "We"] },
      { id: "hyen_e7", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Մայրս բժշկուհի է»", en: "Translate", ru: "Переведи" },
        targetAnswer: "My mother is a doctor", acceptableAnswers: ["My mother is a doctor", "My mom is a doctor"] },
      { id: "hyen_e8", type: "word_order",
        prompt: { hy: "Դասավորել՝ «Ես հայ եմ»", en: "Arrange", ru: "Составь" },
        targetAnswer: "I am Armenian", words: ["I", "am", "Armenian"] },
    ]
  },
  {
    id: "hyen_l3", unitId: "unit_1",
    title: { hy: "Ուտելիք", en: "Food", ru: "Еда" },
    description: { hy: "Ինչպե՞ս խոսել ուտելիքի մասին", en: "Talking about food", ru: "О еде" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "hyen_e9", type: "multiple_choice",
        prompt: { hy: "«Հաց»-ի անգլերեն անունը", en: "English for «Hac»", ru: "«Хлеб» по-английски" },
        targetAnswer: "Bread", options: ["Bread", "Water", "Milk", "Meat"] },
      { id: "hyen_e10", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Ես հաց եմ ուտում»", en: "Translate", ru: "Переведи" },
        targetAnswer: "I am eating bread", acceptableAnswers: ["I am eating bread", "I'm eating bread"] },
      { id: "hyen_e11", type: "multiple_choice",
        prompt: { hy: "«Ջուր»-ի անգլերեն անունը", en: "«Water» in English", ru: "«Вода» по-английски" },
        targetAnswer: "Water", options: ["Water", "Juice", "Milk", "Tea"] },
      { id: "hyen_e12", type: "translate",
        prompt: { hy: "Թարգմանել՝ «Ես սուրջ եմ խմում»", en: "Translate", ru: "Переведи" },
        targetAnswer: "I am drinking coffee", acceptableAnswers: ["I am drinking coffee", "I'm drinking coffee"] },
    ]
  },
  { id: "hyen_l4", unitId: "unit_1", title: { hy: "Այո և Ոչ", en: "Yes and No", ru: "Да и Нет" }, description: { hy: "Պարզ պատասխաններ", en: "Simple answers", ru: "Простые ответы" }, estimatedMinutes: 4, hayqTotal: 40, exercises: [] },
  { id: "hyen_l5", unitId: "unit_1", title: { hy: "Ընտանիք", en: "Family", ru: "Семья" }, description: { hy: "Իմ հարազատները", en: "My relatives", ru: "Мои родственники" }, estimatedMinutes: 7, hayqTotal: 70, exercises: [] }
];

// Content for PAIR: ru-hy (Russian speaker learns Armenian)
const RU_HY_LESSONS: MultiLesson[] = [
  {
    id: "ruhy_l1", unitId: "unit_1",
    title: { ru: "Приветствие", hy: "Ողջույն", en: "Greetings" },
    description: { ru: "Первые фразы на армянском", hy: "Առաջին արտահայտությունները հայերենով", en: "First phrases in Armenian" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "ruhy_e1", type: "multiple_choice",
        prompt: { ru: "«Привет» по-армянски — это:", hy: "«Привет»-ը հայերենում", en: "Hello in Armenian" },
        targetAnswer: "Բարև", options: ["Բարև", "Շնորհակալություն", "Ոչ", "Այո"] },
      { id: "ruhy_e2", type: "translate",
        prompt: { ru: "Переведи на армянский: «Как дела?»", hy: "Թարգմանել հայերեն", en: "Translate to Armenian" },
        targetAnswer: "Ինչպե՞ս ես", acceptableAnswers: ["Ինչպե՞ս ես", "Ինչպե՞ս ես դու", "Ո՞նց ես"],
        hint: { ru: "По-армянски: Ինչպե՞ս ես", hy: "Հայերեն՝ Ինչպե՞ս ես", en: "Armenian: Inchpes es" } },
      { id: "ruhy_e3", type: "translate",
        prompt: { ru: "Переведи: «Я иду домой»", hy: "Թարգմանել", en: "Translate" },
        targetAnswer: "Ես գնում եմ տուն", acceptableAnswers: ["Ես գնում եմ տուն", "Ես տուն եմ գնում", "Տուն եմ գնում"],
        hint: { ru: "В армянском свободный порядок слов!", hy: "Հայերենում ազատ բառակարգ է!", en: "Free word order!" } },
      { id: "ruhy_e4", type: "multiple_choice",
        prompt: { ru: "«Спасибо» по-армянски:", hy: "«Շնորհակալություն»-ը ռուսերենում", en: "Thanks in Armenian" },
        targetAnswer: "Շնորհակալություն", options: ["Շնորհակալություն", "Բարև", "Ոչ", "Այո"] },
    ]
  },
  {
    id: "ruhy_l2", unitId: "unit_2",
    title: { ru: "Семья", hy: "Ընտանիք", en: "Family" },
    description: { ru: "Члены семьи", hy: "Ընտանիքի անդամները", en: "Family members" },
    estimatedMinutes: 6, hayqTotal: 60,
    exercises: [
      { id: "ruhy_e5", type: "multiple_choice",
        prompt: { ru: "«Мама» по-армянски:", hy: "«Մամա»-ն հայերենում", en: "Mom in Armenian" },
        targetAnswer: "Մայրիկ", options: ["Մայրիկ", "Հայրիկ", "Քույր", "Եղբայր"] },
      { id: "ruhy_e6", type: "translate",
        prompt: { ru: "Переведи: «Моя мама врач»", hy: "Թարգմանել", en: "Translate" },
        targetAnswer: "Մայրս բժշկուհի է", acceptableAnswers: ["Մայրս բժշկուհի է", "Մայրս բժիշկ է", "Իմ մայրը բժշկուհի է"] },
      { id: "ruhy_e7", type: "multiple_choice",
        prompt: { ru: "«Брат» по-армянски:", hy: "«Եղբայր»-ը ռուսերենում", en: "Brother in Armenian" },
        targetAnswer: "Եղբայր", options: ["Եղբայր", "Քույր", "Մայր", "Հայր"] },
      { id: "ruhy_e8", type: "word_order",
        prompt: { ru: "Составь армянскую фразу: «Я люблю Армению»", hy: "Դասավորել", en: "Arrange" },
        targetAnswer: "Ես սիրում եմ Հայաստանը", words: ["Ես", "սիրում", "եմ", "Հայաստանը"] },
    ]
  },
  {
    id: "ruhy_l3", unitId: "unit_1",
    title: { ru: "Дом и Движение", hy: "Տուն և Շարժում", en: "Home & Movement" },
    description: { ru: "Где я живу", hy: "Որտեղ եմ ես ապրում", en: "Where I live" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "ruhy_e9", type: "multiple_choice",
        prompt: { ru: "«Дом» по-армянски:", hy: "«Տուն»-ը ռուսերենում", en: "Home in Armenian" },
        targetAnswer: "Տուն", options: ["Տուն", "Սենյակ", "Դպրոց", "Քաղաք"] },
      { id: "ruhy_e10", type: "translate",
        prompt: { ru: "Переведи: «Я живу в Ереване»", hy: "Թարգմանել", en: "Translate" },
        targetAnswer: "Ես ապրում եմ Երևանում", acceptableAnswers: ["Ես ապրում եմ Երևանում", "Երևանում եմ ապրում", "Ես Երևանում եմ ապրում"] },
      { id: "ruhy_e11", type: "multiple_choice",
        prompt: { ru: "«Идти» по-армянски:", hy: "«Գնալ»-ը ռուսերենում", en: "To go in Armenian" },
        targetAnswer: "Գնալ", options: ["Գնալ", "Գալ", "Ուտել", "Խմել"] },
      { id: "ruhy_e12", type: "word_order",
        prompt: { ru: "Составь: «Я иду домой»", hy: "Դասավորել", en: "Arrange" },
        targetAnswer: "Ես գնում եմ տուն", words: ["Ես", "գնում", "եմ", "տուն"] },
    ]
  },
  { id: "ruhy_l4", unitId: "unit_1", title: { ru: "Еда", hy: "Ուտելիք", en: "Food" }, description: { ru: "Продукты", hy: "Մթերքներ", en: "Products" }, estimatedMinutes: 5, hayqTotal: 50, exercises: [] },
  { id: "ruhy_l5", unitId: "unit_1", title: { ru: "Числа", hy: "Թվեր", en: "Numbers" }, description: { ru: "Счет до 10", hy: "Հաշվել մինչև 10", en: "Counting to 10" }, estimatedMinutes: 4, hayqTotal: 40, exercises: [] }
];

// Content for PAIR: en-hy (English speaker learns Armenian)
const EN_HY_LESSONS: MultiLesson[] = [
  {
    id: "enhy_l1", unitId: "unit_1",
    title: { en: "Greetings", hy: "Ողջույն", ru: "Приветствие" },
    description: { en: "First Armenian words", hy: "Առաջին հայերեն բառերը", ru: "Первые армянские слова" },
    estimatedMinutes: 5, hayqTotal: 50,
    exercises: [
      { id: "enhy_e1", type: "multiple_choice",
        prompt: { en: "Armenian for «Hello»", hy: "«Hello»-ն հայերենում", ru: "«Hello» по-армянски" },
        targetAnswer: "Բարև", options: ["Բարև", "Շնորհակալություն", "Ոչ", "Այո"] },
      { id: "enhy_e2", type: "translate",
        prompt: { en: "Translate to Armenian: «How are you?»", hy: "Թարգմանել հայերեն", ru: "Переведи на армянский" },
        targetAnswer: "Ինչպե՞ս ես", acceptableAnswers: ["Ինչպե՞ս ես", "Ո՞նց ես", "Ինչպե՞ս եք"] },
      { id: "enhy_e3", type: "word_order",
        prompt: { en: "Arrange Armenian words: «I am fine»", hy: "Դասավորել բառերը", ru: "Составь фразу" },
        targetAnswer: "Ես լավ եմ", words: ["Ես", "լավ", "եմ"] },
      { id: "enhy_e4", type: "multiple_choice",
        prompt: { en: "«Thank you» in Armenian", hy: "«Շնորհակալություն»-ը անգլերենում", ru: "«Спасибо» по-армянски" },
        targetAnswer: "Շնորհակալություն", options: ["Շնորհակալություն", "Բարև", "Այո", "Ոչ"] },
    ]
  },
  { id: "enhy_l2", unitId: "unit_1", title: { en: "Home", hy: "Տուն", ru: "Дом" }, description: { en: "Basic home words", hy: "Տան հիմնական բառերը", ru: "Слова о доме" }, estimatedMinutes: 5, hayqTotal: 50, exercises: [] },
  { id: "enhy_l3", unitId: "unit_1", title: { en: "Food", hy: "Ուտելիք", ru: "Еда" }, description: { en: "Eating and drinking", hy: "Ուտել և խմել", ru: "Еда и напитки" }, estimatedMinutes: 6, hayqTotal: 60, exercises: [] },
  { id: "enhy_l4", unitId: "unit_2", title: { en: "I am", hy: "Ես եմ", ru: "Я" }, description: { en: "Self introduction", hy: "Ինքնաներկայացում", ru: "Представление себя" }, estimatedMinutes: 5, hayqTotal: 50, exercises: [] },
  { id: "enhy_l5", unitId: "unit_2", title: { en: "Profession", hy: "Մասնագիտություն", ru: "Профессия" }, description: { en: "Work words", hy: "Աշխատանքային բառեր", ru: "Слова о работе" }, estimatedMinutes: 5, hayqTotal: 50, exercises: [] }
];

// Helper to get lessons for a pair
export function getLessonsForPair(pair: LangPair): { units: MultiUnit[]; lessons: MultiLesson[] } {
  const map: Record<string, MultiLesson[]> = {
    "hy-en": HY_EN_LESSONS,
    "ru-hy": RU_HY_LESSONS,
    "en-hy": EN_HY_LESSONS,
    // Other pairs would follow same pattern with expanded content
    "hy-ru": RU_HY_LESSONS.map(l => ({...l, id: l.id.replace('ruhy','hyru')})), // Mock for now
    "en-ru": HY_EN_LESSONS.map(l => ({...l, id: l.id.replace('hyen','enru')})), // Mock for now
    "ru-en": HY_EN_LESSONS.map(l => ({...l, id: l.id.replace('hyen','ruen')})), // Mock for now
  };

  const lessons = map[pair] || [];
  return {
    units: MULTI_UNITS.filter(u => lessons.some(l => l.unitId === u.id)),
    lessons
  };
}

export function getLessonById(pair: LangPair, lessonId: string): MultiLesson | null {
  const { lessons } = getLessonsForPair(pair);
  return lessons.find(l => l.id === lessonId) || null;
}
