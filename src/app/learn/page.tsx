"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Nuri, { NuriSpeech, getMoodFromScore, type NuriMood } from "@/components/Nuri";
import BottomNav from "@/components/BottomNav";
import { loadLangConfig, UI_STRINGS, type LangCode, type LangPair } from "@/lib/i18n/index";
import { getLessonById, type MultiLesson, type MultiExercise } from "@/lib/i18n/multilingual";
import { 
  loadRewards, saveRewards, addRewards, updateStreak, addHAYQ,
  syncHearts, deductHeart, buyHeartRefill, getNextHeartCountdown,
  saveCrownLevel, earnHeartByPractice,
  type UserRewards
} from "@/lib/rewards/seeds";
import { updateQuestProgress } from "@/lib/rewards/quests";

type AnswerState = "idle" | "submitting" | "correct" | "incorrect";

interface ExState {
  index: number;
  userAnswer: string;
  state: AnswerState;
  feedback: string;
  score: number;
  hayqEarned: number;
  corrections?: string[];
  nuriMood: NuriMood;
  nuriSpeech: string;
}

const NURI_LINES: Record<string, string[]> = {
  correct_perfect: ["Կատարյալ! Հիանալի! 🌟", "Վայ, ՀԱՅՔ վաստակեցիր! 🏆", "Չեմ հավատում! 🎉"],
  correct:         ["Շատ լավ! ✅", "Այո! Հայերեն գիտես! 👍", "Ճիշտ է: Շարունակիր:"],
  incorrect:       ["Մի տխրիր! Կարող ես 💪", "Կրկնիր! Կստացվի", "Շատ մոտ էր, բայց կփորձենք նորից!"],
  thinking:        ["Մտածիր... 💭", "Հայերենը հիասքանչ է 🤔", "Ոչ այստեղ, ոչ այնտեղ..."],
  idle:            ["Բարև! Սովորենք միասին! 🍎", "Ինչպե՞ս ես: Պատրա՞ստ ես:", "Հայերեն սովորելը հաճելի է 🪙"],
};

function randomLine(key: string) {
  const arr = NURI_LINES[key] ?? NURI_LINES.idle;
  return arr[Math.floor(Math.random() * arr.length)];
}

function LearnInner() {
  const router = useRouter();
  const params = useSearchParams();
  const lessonId = params.get("lesson") ?? "";
  const pairParam = params.get("pair") as LangPair | null;

  const [lesson, setLesson] = useState<MultiLesson | null>(null);
  const [native, setNative] = useState<LangCode>("en");
  const [complete, setComplete] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [countdown, setCountdown] = useState<number>(0);
  const [startTime] = useState(() => Date.now());
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [totalHAYQ, setTotal] = useState(0);
  const [sessionHAYQ, setSessionHAYQ] = useState(0);
  const [sessionSeeds, setSessionSeeds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionLevel, setSLevel] = useState(1);
  const [selectedWords, setSW] = useState<string[]>([]);
  const [availWords, setAW] = useState<string[]>([]);

  const [ex, setEx] = useState<ExState>({
    index: 0, userAnswer: "", state: "idle",
    feedback: "", score: 0, hayqEarned: 0,
    nuriMood: "idle", nuriSpeech: randomLine("idle"),
  });

  const current = lesson?.exercises[ex.index];

  useEffect(() => {
    const cfg = loadLangConfig();
    const pair = pairParam ?? cfg?.pair ?? "en-hy";
    const nat = cfg?.native ?? "en";
    setNative(nat as LangCode);
    
    const l = getLessonById(pair as LangPair, lessonId);
    if (!l) {
      if (lessonId) router.push("/world");
      return;
    }
    setLesson(l);

    const rewards = syncHearts();
    setHearts(rewards.hearts);
    setTotal(rewards.totalHAYQ);
    setStreak(rewards.streak);
    const lvl = Math.min(3, (rewards.crowns[l.id] || 0) + 1);
    setSLevel(lvl);
  }, [lessonId, pairParam, router]);

  useEffect(() => {
    if (current?.type === "word_order" && current.words) {
      setAW([...current.words]);
      setSW([]);
    }
  }, [current]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextH = syncHearts();
      if (nextH.hearts !== hearts) setHearts(nextH.hearts);
      setCountdown(getNextHeartCountdown(nextH));
    }, 1000);
    return () => clearInterval(timer);
  }, [hearts]);

  const submit = useCallback(async () => {
    if (!current || ex.state === "submitting") return;
    const answer = (current.type === "word_order" && sessionLevel < 3)
      ? selectedWords.join(" ")
      : ex.userAnswer.trim();
    if (!answer) return;

    setEx(s => ({ ...s, state: "submitting", nuriMood: "thinking", nuriSpeech: randomLine("thinking") }));

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer: answer,
          expectedAnswer: current.targetAnswer,
          englishOriginal: current.prompt["en"] ?? current.prompt[native] ?? current.targetAnswer,
          allValidAnswers: current.acceptableAnswers || [],
          sourceLanguage: native,
          targetLanguage: (loadLangConfig()?.learning || "hy"),
          useAI: false,
        }),
      });
      const data = await res.json();
      const correct = data.accepted;
      const score   = data.score ?? 0;
      const hayq = correct ? 10 : 0;
      const seeds = (correct && score >= 0.98) ? 1 : 0;

      setStats(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));

      if (!correct) {
        const updated = deductHeart();
        setHearts(updated.hearts);
      }
      
      if (correct) {
        const rewards = loadRewards();
        const updated = addHAYQ(updateStreak(rewards), hayq);
        if (seeds > 0) updated.totalSeeds += seeds;
        saveRewards(updated);
        
        setTotal(updated.totalHAYQ);
        setStreak(updated.streak);
        setSessionHAYQ(s => s + hayq);
        setSessionSeeds(s => s + seeds);
        
        // Update quest progress for earning HAYQ
        updateQuestProgress("earn_hayq", hayq);
      }

      setEx(s => ({
        ...s,
        state: correct ? "correct" : "incorrect",
        feedback: data.feedback,
        score: score,
        hayqEarned: hayq,
        corrections: data.corrections,
        nuriMood: getMoodFromScore(score, correct, streak),
        nuriSpeech: randomLine(score >= 0.98 ? "correct_perfect" : correct ? "correct" : "incorrect"),
      }));
    } catch {
      setEx(s => ({ ...s, state: "incorrect", feedback: "Connection error", nuriMood: "sad", nuriSpeech: "Oops! 😅" }));
    }
  }, [current, ex.userAnswer, ex.state, selectedWords, lesson, streak, native]);

  const next = useCallback(() => {
    if (!lesson) return;
    const nextIdx = ex.index + 1;
    if (nextIdx >= lesson.exercises.length) { 
      addRewards(40, 0, lesson.estimatedMinutes);
      saveCrownLevel(lesson.id, sessionLevel);
      // Update quest progress for completing a lesson
      updateQuestProgress("complete_lessons", 1);
      setComplete(true); 
      return; 
    }
    setEx({ index: nextIdx, userAnswer: "", state: "idle", feedback: "", score: 0, hayqEarned: 0, nuriMood: "happy", nuriSpeech: randomLine("idle") });
    setSW([]); setAW([]);
  }, [lesson, ex.index, sessionLevel]);

  const handleRefill = useCallback(() => {
    const result = buyHeartRefill();
    if (result.success) {
      setHearts(result.rewards.hearts);
      setTotal(result.rewards.totalHAYQ);
    } else {
      alert(result.error || "Refill failed");
    }
  }, []);

  const handlePractice = useCallback(() => {
    const result = earnHeartByPractice();
    if (result.success) {
      setHearts(result.rewards.hearts);
    } else {
      alert("You already have full hearts!");
    }
  }, []);

  if (complete && lesson)
    return <CompletionScreen lesson={lesson} totalHAYQ={sessionHAYQ} totalSeeds={sessionSeeds} hearts={hearts} stats={stats} duration={Date.now() - startTime} native={native} onContinue={() => { router.push("/world"); }} />;

  if (hearts <= 0)
    return <NoHeartsScreen 
      countdown={countdown} 
      totalHAYQ={totalHAYQ} 
      onRefill={handleRefill} 
      onPractice={handlePractice}
      onBack={() => { router.push("/world"); }} 
    />;

  if (!lesson || !current) return null;
  const progress = (ex.index / lesson.exercises.length) * 100;

  return (
    <div className="min-h-screen flex flex-col relative text-white">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <button onClick={() => router.push("/world")} className="text-white/40 hover:text-white text-2xl">✕</button>
        <div className="flex-1 h-3 rounded-full bg-white/10 mx-4">
          <motion.div className="h-full rounded-full bg-green-500" animate={{ width: `${progress}%` }} />
        </div>
        <div className="text-xl">❤️ {hearts}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <NuriSpeech text={ex.nuriSpeech} mood={ex.nuriMood} />
        <Nuri mood={ex.nuriMood} size={140} />
        
        <div className="w-full max-w-2xl bg-white/5 p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold mb-6">{current.prompt[native] ?? current.prompt["en"]}</h2>
          
          {current.hint && sessionLevel === 1 && current.hint[native] && (
             <p className="text-blue-300 italic mb-4">💡 {current.hint[native]}</p>
          )}

          <div className="mt-8">
            {current.type === "word_order" && sessionLevel < 3 ? (
              <WordOrderInput selected={selectedWords} available={availWords} onSelect={(w: string) => {setSW([...selectedWords, w]); setAW(availWords.filter(x => x !== w))}} onDeselect={(w: string) => {setAW([...availWords, w]); setSW(selectedWords.filter(x => x !== w))}} disabled={ex.state !== "idle"} />
            ) : current.type === "multiple_choice" && current.options && sessionLevel < 3 ? (
              <div className="grid grid-cols-2 gap-4">
                {current.options.map(opt => (
                  <button key={opt} onClick={() => setEx({...ex, userAnswer: opt})} className={`p-4 rounded-xl border-2 ${ex.userAnswer === opt ? 'border-blue-500' : 'border-white/10'}`}>{opt}</button>
                ))}
              </div>
            ) : (
              <textarea value={ex.userAnswer} onChange={e => setEx({...ex, userAnswer: e.target.value})} className="w-full bg-black/20 p-4 rounded-xl h-32" placeholder="..." />
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/10">
        {ex.state === "idle" ? (
          <button onClick={submit} className="w-full py-4 bg-blue-600 rounded-xl font-bold">Check</button>
        ) : (
          <div className={`p-4 rounded-xl mb-4 ${ex.state === 'correct' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            <p>{ex.feedback}</p>
            <button onClick={next} className="mt-4 w-full py-4 bg-white text-black rounded-xl font-bold">Continue</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#1a0a0a]"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-[#FFA500]"/></div>}>
      <LearnInner />
    </Suspense>
  );
}

interface WordOrderInputProps {
  selected: string[];
  available: string[];
  onSelect: (word: string) => void;
  onDeselect: (word: string) => void;
  disabled: boolean;
}

function WordOrderInput({ selected, available, onSelect, onDeselect, disabled }: WordOrderInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-xl min-h-[60px]">
        {selected.map((w, i) => (
          <button 
            key={`${w}-${i}`} 
            onClick={() => !disabled && onDeselect(w)} 
            className="bg-blue-600 px-3 py-1 rounded"
          >
            {w}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {available.map((w, i) => (
          <button 
            key={`${w}-${i}`} 
            onClick={() => !disabled && onSelect(w)} 
            className="bg-white/10 px-3 py-1 rounded"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

interface NoHeartsScreenProps {
  countdown: number;
  totalHAYQ: number;
  onRefill: () => void;
  onPractice: () => void;
  onBack: () => void;
}

function NoHeartsScreen({ countdown, totalHAYQ, onRefill, onPractice, onBack }: NoHeartsScreenProps) {
  const minutesLeft = Math.ceil(countdown / 60000);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">No Hearts Left</h1>
      <p className="mb-2">Next heart in: {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}</p>
      <p className="mb-8">Refill for 100 HAYQ (Current: {totalHAYQ} 🪙)</p>
      <button onClick={onPractice} className="w-full max-w-xs py-4 bg-green-600 text-white rounded-xl font-bold mb-4">Practice to earn 1 Heart (free)</button>
      <button onClick={onRefill} className="w-full max-w-xs py-4 bg-white text-black rounded-xl font-bold mb-4">Refill (100 HAYQ)</button>
      <button onClick={onBack} className="text-white/60">Go Back</button>
    </div>
  );
}

interface CompletionScreenProps {
  lesson: MultiLesson;
  totalHAYQ: number;
  totalSeeds: number;
  hearts: number;
  stats: { correct: number; total: number };
  duration: number;
  native: LangCode;
  onContinue: () => void;
}

function CompletionScreen({ lesson, totalHAYQ, totalSeeds, stats, onContinue }: CompletionScreenProps) {
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#1a0a0a] text-white">
      <h1 className="text-5xl font-black mb-4">Lesson Complete! 🎉</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-xl">
          <p className="text-2xl font-bold">{accuracy}%</p>
          <p className="text-xs uppercase opacity-50">Accuracy</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl">
          <p className="text-2xl font-bold">+{totalHAYQ}</p>
          <p className="text-xs uppercase opacity-50">HAYQ</p>
        </div>
      </div>
      <button onClick={onContinue} className="w-full max-w-xs py-5 bg-white text-black rounded-2xl font-black">CONTINUE</button>
    </div>
  );
}