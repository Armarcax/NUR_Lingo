import { Lesson, LESSONS, Unit, UNITS } from "../lessons/engine";

export type Language = "en" | "hy" | "ru";

export interface LanguagePair {
  source: Language;
  target: Language;
}

export const MULTI_LESSONS: Record<string, { units: Unit[]; lessons: Lesson[] }> = {
  "en-hy": {
    units: UNITS,
    lessons: LESSONS,
  },
  "ru-hy": {
    units: UNITS.map(u => ({
      ...u,
      title: translateToRu(u.title),
      description: translateToRu(u.description),
    })),
    lessons: LESSONS.map(l => ({
      ...l,
      title: translateToRu(l.title),
      description: translateToRu(l.description),
      exercises: l.exercises.map(ex => ({
        ...ex,
        prompt: translateExToRu(ex.prompt),
      })),
    })),
  },
  "en-ru": {
    units: UNITS.map(u => ({
      ...u,
      titleArmenian: translateToRu(u.title),
    })),
    lessons: LESSONS.map(l => ({
      ...l,
      titleArmenian: translateToRu(l.title),
      exercises: l.exercises.map(ex => ({
        ...ex,
        promptArmenian: `Translate to Russian: "${ex.targetAnswer}"`, // Mock
      })),
    })),
  },
  "ru-en": {
    units: UNITS.map(u => ({
      ...u,
      title: translateToRu(u.title),
      titleArmenian: u.title,
    })),
    lessons: LESSONS.map(l => ({
      ...l,
      title: translateToRu(l.title),
      titleArmenian: l.title,
      exercises: l.exercises.map(ex => ({
        ...ex,
        prompt: `Переведите на английский: "${ex.targetAnswer}"`, // Mock
      })),
    })),
  },
  "hy-en": {
    units: UNITS.map(u => ({
      ...u,
      title: u.titleArmenian,
      titleArmenian: u.title,
    })),
    lessons: LESSONS.map(l => ({
      ...l,
      title: l.titleArmenian,
      titleArmenian: l.title,
      exercises: l.exercises.map(ex => ({
        ...ex,
        prompt: ex.promptArmenian || `Translate to English: ${ex.targetAnswer}`,
      })),
    })),
  },
  "hy-ru": {
    units: UNITS.map(u => ({
      ...u,
      title: u.titleArmenian,
      titleArmenian: translateToRu(u.title),
    })),
    lessons: LESSONS.map(l => ({
      ...l,
      title: l.titleArmenian,
      titleArmenian: translateToRu(l.title),
      exercises: l.exercises.map(ex => ({
        ...ex,
        prompt: ex.promptArmenian || `Переведите на русский: ${ex.targetAnswer}`,
      })),
    })),
  }
};

function translateToRu(text: string): string {
  const dict: Record<string, string> = {
    "Greetings & Basics": "Приветствия и Основы",
    "Home & Movement": "Дом и Движение",
    "Food & Drink": "Еда и Напитки",
    "Family": "Семья",
    "Education": "Образование",
    "Hello Armenia": "Привет, Армения",
    "Going Home": "Идем домой",
    "Eating & Drinking": "Еда и питье",
    "My Family": "Моя семья",
    "School & Books": "Школа и книги",
    "Ծանոթացիր, ողջունիր և ներկայացիր": "Познакомьтесь, поприветствуйте и представьтесь",
    "Նկարագրիր տունդ, խոսիր գնալ-գալու մասին": "Опишите свой дом, поговорите о движении",
    "Հայկական խոհանոց, ուտել-խմելու բառապաշար": "Армянская кухня, словарь еды и питья",
    "Ընտանիքի անդամներ, հարաբերություններ": "Члены семьи, отношения",
    "Դպրոց, գիրք, ուսուցիչ, ուսանող": "Школа, книга, учитель, студент",
    "Առաջին բառերը՝ ողջույններ և ծանոթություն": "Первые слова: приветствия и знакомство",
    "Խոսիր տան և շարժման մասին": "Поговорите о доме и движении",
    "Ուտելիքի բառապաշար և զրույցներ սեղանի շուրջ": "Словарь еды и разговоры за столом",
    "Ընտանիքի անդամներ և ստացական հոլով": "Члены семьи и притяжательный падеж",
    "Կրթական բառապաշար": "Образовательный словарь",
  };
  return dict[text] || text;
}

function translateExToRu(prompt: string): string {
  if (prompt.includes("Translate to Armenian")) {
    const english = prompt.match(/"([^"]+)"/)?.[1] || "";
    return `Переведите на армянский: "${english}"`;
  }
  if (prompt.includes("What does") && prompt.includes("mean")) {
    const word = prompt.match(/"([^"]+)"/)?.[1] || "";
    return `Что означает "${word}"?`;
  }
  if (prompt.includes("Arrange")) {
    const english = prompt.match(/"([^"]+)"/)?.[1] || "";
    return `Расположите слова: "${english}"`;
  }
  return prompt;
}

export function getLessonsForPair(source: Language, target: Language) {
  const key = `${source}-${target}`;
  if (MULTI_LESSONS[key]) return MULTI_LESSONS[key];
  return MULTI_LESSONS["en-hy"];
}
