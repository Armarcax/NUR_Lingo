import { NextRequest, NextResponse } from 'next/server';
import { generateCurriculumForPair } from '@/lib/content/generator';
import { getLessonById } from '@/lib/i18n/multilingual';
import type { LangPair } from '@/lib/i18n/index';

export async function POST(req: NextRequest) {
  try {
    const { topic, words, direction, level } = await req.json();
    const [fromLang, toLang] = (direction as LangPair).split('-');
    
    // Use the full curriculum generator or a custom function based on word list
    const curriculum = generateCurriculumForPair(direction as LangPair);
    
    // Find or create a lesson containing these words
    let lesson = curriculum.lessons.find(l => 
      l.vocabulary?.some(v => words.includes(v[fromLang as keyof typeof v]))
    );
    
    if (!lesson && words.length > 0) {
      // Create a synthetic lesson on the fly
      lesson = {
        id: `dynamic_${Date.now()}`,
        unitId: 'dynamic',
        title: { en: `Lesson on ${words.join(', ')}`, hy: `Դաս ${words.join(', ')}-ի մասին`, ru: `Урок о ${words.join(', ')}` },
        description: { en: 'Generated from your word list', hy: 'Գեներացված ձեր բառացանկից', ru: 'Сгенерировано из вашего списка' },
        estimatedMinutes: 5,
        hayqTotal: 50,
        exercises: words.map((w: string, idx: number) => ({
          id: `ex_${idx}`,
          type: 'translate',
          prompt: { [fromLang]: w, [toLang]: '' },
          targetAnswer: '',
          acceptableAnswers: [],
          hayqReward: 10,
        })),
      };
    }
    
    return NextResponse.json({ lesson });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}