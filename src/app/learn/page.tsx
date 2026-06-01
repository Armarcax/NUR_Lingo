"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Nuri, { NuriSpeech, getMoodFromScore, type NuriMood } from "@/components/Nuri";
import BottomNav from "@/components/BottomNav";
import {
  HAYQ_REWARDS, SEED_REWARDS, hayqToLevel,
} from "@/lib/lessons/engine";
import {
  loadRewards, addRewards, checkAndApplyFreeze,
  saveCrownLevel, syncHearts, deductHeart, buyHeartRefill, getNextHeartCountdown,
  checkDailyGoalBonus,
} from "@/lib/rewards/seeds";
import { getLessonById, LangPair, MultiLesson, MultiExercise } from "@/lib/i18n/multilingual";
import { loadLangConfig, UI_STRINGS, LangCode } from "@/lib/i18n/index";

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
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const pairParam = searchParams.get("pair") as LangPair | null;

  const [lesson, setLesson] = useState<MultiLesson | null>(null);
  const [native, setNative] = useState<LangCode>("en");
  const [complete, setComplete] = useState(false);
  const [hearts, setHearts] = useState(3);
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
    const config = loadLangConfig();
    const pair = pairParam ?? config?.pair ?? "en-hy";
    const nat = config?.native ?? "en";
    setNative(nat as LangCode);

    if (lessonId) {
      const l = getLessonById(pair as LangPair, lessonId);
      if (l) {
        setLesson(l);
        const rewards = syncHearts();
        setHearts(rewards.hearts);
        setTotal(rewards.totalHAYQ);
        setStreak(rewards.streak);
        const lvl = Math.min(3, (rewards.crowns[l.id] || 0) + 1);
        setSLevel(lvl);
      } else {
        router.push("/world");
      }
    } else {
      router.push("/world");
    }
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
    const answer = current.type === "word_order"
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
          englishOriginal: current.prompt["en"] ?? current.prompt[native],
          allValidAnswers: current.acceptableAnswers || [current.targetAnswer],
        }),
      });
      const data = await res.json();
      const hayq = data.accepted ? 10 : 0; // Simple reward logic for now
      const seeds = (data.accepted && data.score >= 0.98) ? 1 : 0;

      setStats(prev => ({ correct: prev.correct + (data.accepted ? 1 : 0), total: prev.total + 1 }));

      if (!data.accepted) {
        const updated = deductHeart();
        setHearts(updated.hearts);
      }

      if (data.accepted) {
        const updated = addRewards(hayq, seeds);
        setTotal(updated.totalHAYQ);
        setStreak(updated.streak);
        setSessionHAYQ(s => s + hayq);
        setSessionSeeds(s => s + seeds);
      }

      setEx(s => ({
        ...s,
        state: data.accepted ? "correct" : "incorrect",
        feedback: data.feedback,
        score: data.score,
        hayqEarned: hayq,
        nuriMood: getMoodFromScore(data.score, data.accepted, streak),
        nuriSpeech: randomLine(data.score >= 0.98 ? "correct_perfect" : data.accepted ? "correct" : "incorrect"),
      }));
    } catch {
      setEx(s => ({ ...s, state: "incorrect", feedback: "Connection error", nuriMood: "sad", nuriSpeech: "Oops! 😅" }));
    }
  }, [current, ex.userAnswer, ex.state, selectedWords, lesson, streak, native]);

  const next = useCallback(() => {
    if (!lesson) return;
    const nextIdx = ex.index + 1;
    if (nextIdx >= lesson.exercises.length) {
      addRewards(HAYQ_REWARDS.LESSON_COMPLETE, 0, lesson.estimatedMinutes);
      saveCrownLevel(lesson.id, sessionLevel);
      setComplete(true);
      return;
    }
    setEx({ index: nextIdx, userAnswer: "", state: "idle", feedback: "", score: 0, hayqEarned: 0, nuriMood: "happy", nuriSpeech: randomLine("idle") });
    setSW([]); setAW([]);
  }, [lesson, ex.index, sessionLevel]);

  if (complete && lesson)
    return <CompletionScreen lesson={lesson} totalHAYQ={sessionHAYQ} totalSeeds={sessionSeeds} hearts={hearts} stats={stats} duration={Date.now() - startTime} native={native} onContinue={() => { router.push("/world"); }} />;

  if (hearts <= 0)
    return <NoHeartsScreen countdown={countdown} totalHAYQ={totalHAYQ} onRefill={() => { buyHeartRefill(); setHearts(3); }} onBack={() => { router.push("/world"); }} />;

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

// ... WordOrderInput, NoHeartsScreen, CompletionScreen implementations ...

export default function LearnPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LearnInner />
    </Suspense>
  );
}

function WordOrderInput({ selected, available, onSelect, onDeselect, disabled }: any) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-xl min-h-[60px]">
        {selected.map((w: string, i: number) => <button key={i} onClick={() => !disabled && onDeselect(w)} className="bg-blue-600 px-3 py-1 rounded">{w}</button>)}
      </div>
      <div className="flex flex-wrap gap-2">
        {available.map((w: string, i: number) => <button key={i} onClick={() => !disabled && onSelect(w)} className="bg-white/10 px-3 py-1 rounded">{w}</button>)}
      </div>
    </div>
  );
}

function NoHeartsScreen({ countdown, totalHAYQ, onRefill, onBack }: any) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black">
      <h1 className="text-4xl font-bold mb-4">No Hearts Left</h1>
      <p className="mb-8">Wait for regeneration or refill for 100 HAYQ</p>
      <button onClick={onRefill} className="w-full max-w-xs py-4 bg-white text-black rounded-xl font-bold mb-4">Refill (100 HAYQ)</button>
      <button onClick={onBack} className="text-white/60">Go Back</button>
    </div>
  );
}

function CompletionScreen({ lesson, totalHAYQ, totalSeeds, stats, duration, native, onContinue }: any) {
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#1a0a0a]">
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
