"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Nuri, { NuriSpeech, getMoodFromScore, type NuriMood } from "@/components/Nuri";
import BottomNav from "@/components/BottomNav";
import {
  type Exercise, type Lesson, type HAYQLevel,
  HAYQ_REWARDS, SEED_REWARDS, hayqToLevel, scoreToGrade,
} from "@/lib/lessons/engine";
import { loadRewards, saveRewards, addRewards, checkAndApplyFreeze, saveCrownLevel } from "@/lib/rewards/seeds";
import { getLessonsForPair, Language } from "@/lib/i18n/multilingual";

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

export default function LearnPage() {
  const [lesson, setLesson]     = useState<Lesson | null>(null);
  const [units, setUnits]       = useState<any[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [complete, setComplete] = useState(false);
  const [hearts, setHearts]     = useState(3);
  const [totalHAYQ, setTotal]   = useState(0);
  const [totalSeeds, setSeeds]  = useState(0);
  const [sessionHAYQ, setSessionHAYQ]   = useState(0);
  const [sessionSeeds, setSessionSeeds] = useState(0);
  const [showLevelUp, setShowLevelUp]   = useState<HAYQLevel | null>(null);
  const [streak, setStreak]     = useState(0);
  const [hasFreeze, setHasFreeze] = useState(false);
  const [sessionLevel, setSLevel] = useState(1);
  const [crowns, setCrowns]     = useState<Record<string, number>>({});
  const [selectedWords, setSW]  = useState<string[]>([]);
  const [availWords, setAW]     = useState<string[]>([]);

  const [ex, setEx] = useState<ExState>({
    index: 0, userAnswer: "", state: "idle",
    feedback: "", score: 0, hayqEarned: 0,
    nuriMood: "idle", nuriSpeech: randomLine("idle"),
  });

  const current = lesson?.exercises[ex.index];

  useEffect(() => {
    const rewards = checkAndApplyFreeze();
    setTotal(rewards.totalHAYQ);
    setSeeds(rewards.totalSeeds);
    setStreak(rewards.streak);
    setHasFreeze(rewards.streakFreeze > 0);
    setCrowns(rewards.crowns || {});

    const source = (localStorage.getItem("nur_source_lang") || "en") as Language;
    const target = (localStorage.getItem("nur_target_lang") || "hy") as Language;
    const data = getLessonsForPair(source, target);
    setUnits(data.units);
    setAllLessons(data.lessons);
  }, []);

  useEffect(() => {
    if (current?.type === "word_order" && current.words) {
      setAW([...current.words]);
      setSW([]);
    }
  }, [current]);

  const submit = useCallback(async () => {
    if (!current || ex.state === "submitting") return;
    const answer = current.type === "word_order"
      ? selectedWords.join(" ")
      : ex.userAnswer.trim();
    if (!answer) return;

    setEx(s => ({ ...s, state: "submitting", nuriMood: "thinking", nuriSpeech: randomLine("thinking") }));

    try {
      const res  = await fetch("/api/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer: answer,
          lessonId: lesson.id,
          expectedAnswers: current.acceptableAnswers.length > 0 ? current.acceptableAnswers : [current.targetAnswer],
          sourceLanguage: localStorage.getItem("nur_source_lang") || "en",
          targetLanguage: localStorage.getItem("nur_target_lang") || "hy",
        }),
      });
      const data = await res.json();
      const hayq = data.correct ? data.hayq : 0;
      const seeds = data.correct ? data.seeds : 0;

      const mood = getMoodFromScore(data.score, data.correct, streak + (data.correct ? 1 : 0));

      if (!data.correct) setHearts(h => Math.max(0, h - 1));

      if (data.correct) {
        const prevLevel = hayqToLevel(totalHAYQ);
        const updated = addRewards(hayq, seeds);
        const nextLevel = hayqToLevel(updated.totalHAYQ);

        if (nextLevel.level > prevLevel.level) {
          setShowLevelUp(nextLevel);
        }

        setTotal(updated.totalHAYQ);
        setSeeds(updated.totalSeeds);
        setStreak(updated.streak);
        setHasFreeze(updated.streakFreeze > 0);
        setSessionHAYQ(s => s + hayq);
        setSessionSeeds(s => s + seeds);
      }

      setEx(s => ({
        ...s,
        state: data.correct ? "correct" : "incorrect",
        feedback: data.feedback,
        score: data.score,
        hayqEarned: hayq,
        nuriMood: mood,
        nuriSpeech: randomLine(
          data.score >= 0.98 ? "correct_perfect"
          : data.correct   ? "correct"
          : "incorrect"
        ),
      }));
    } catch {
      setEx(s => ({ ...s, state: "incorrect", feedback: "Կապի սխալ:", nuriMood: "sad", nuriSpeech: "Վատ ինտերնետ! 😅" }));
    }
  }, [current, ex.userAnswer, ex.state, selectedWords]);

  const next = useCallback(() => {
    if (!lesson) return;
    const nextIdx = ex.index + 1;
    if (nextIdx >= lesson.exercises.length) {
      // Award seed for perfect lesson & lesson completion bonus
      let bonusHayq = HAYQ_REWARDS.LESSON_COMPLETE;
      let bonusSeeds = hearts === 3 ? SEED_REWARDS.PERFECT_LESSON : 0;

      const updated = addRewards(bonusHayq, bonusSeeds);
      const withCrowns = saveCrownLevel(lesson.id, sessionLevel);

      setTotal(updated.totalHAYQ);
      setSeeds(updated.totalSeeds);
      setCrowns(withCrowns.crowns);
      setSessionHAYQ(s => s + bonusHayq);
      setSessionSeeds(s => s + bonusSeeds);

      setComplete(true);
      return;
    }
    setEx({ index: nextIdx, userAnswer: "", state: "idle", feedback: "", score: 0, hayqEarned: 0, nuriMood: "happy", nuriSpeech: randomLine("idle") });
    setSW([]); setAW([]);
  }, [lesson, ex.index, hearts]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    if (ex.state === "idle") submit();
    else if (ex.state !== "submitting") next();
  }, [ex.state, submit, next]);

  if (complete && lesson)
    return <CompletionScreen lesson={lesson} totalHAYQ={sessionHAYQ} totalSeeds={sessionSeeds} hearts={hearts}
      onContinue={() => { setLesson(null); setComplete(false); setHearts(3); setSessionHAYQ(0); setSessionSeeds(0); setStreak(0); }} />;

  if (!lesson)
    return (
      <>
        <LessonSelector totalHAYQ={totalHAYQ} totalSeeds={totalSeeds} units={units} allLessons={allLessons} streak={streak} hasFreeze={hasFreeze} crowns={crowns} onSelect={(l, lvl) => { setLesson(l); setSLevel(lvl); setEx({ index:0, userAnswer:"", state:"idle", feedback:"", score:0, hayqEarned:0, nuriMood:"happy", nuriSpeech:"Եկեք սկսենք: 🍎" }); setHearts(3); setSessionHAYQ(0); setSessionSeeds(0); }} />
        <AnimatePresence>
          {showLevelUp && (
            <LevelUpModal level={showLevelUp} onClose={() => setShowLevelUp(null)} />
          )}
        </AnimatePresence>
        <BottomNav />
      </>
    );

  if (!current) return null;
  const progress = (ex.index / lesson.exercises.length) * 100;

  return (
    <div className="min-h-screen flex flex-col relative text-white">
      {/* Top flag stripe */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1" style={{ background: "#D90012" }} />
        <div className="h-full flex-1" style={{ background: "#0033A0" }} />
        <div className="h-full flex-1" style={{ background: "#FFA500" }} />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <button onClick={() => setLesson(null)} className="text-white/40 hover:text-white text-2xl transition-colors">✕</button>

        {/* Progress */}
        <div className="flex-1 h-3 rounded-full overflow-hidden bg-white/10 mx-4">
          <motion.div className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #D90012, #FFA500)" }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
        </div>

        {/* Hearts */}
        <div className="flex gap-1 mr-4">
          {[0,1,2].map(i => (
            <motion.span key={i} animate={{ scale: i < hearts ? 1 : 0.8, opacity: i < hearts ? 1 : 0.3 }} className="text-xl">❤️</motion.span>
          ))}
        </div>

        {/* HAYQ & Seeds */}
        <div className="flex gap-2">
          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl flex items-center gap-2 text-sm font-bold">
            <span className="text-yellow-400">🪙</span> {totalHAYQ}
          </div>
          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl flex items-center gap-2 text-sm font-bold">
            <span className="text-red-400">🍎</span> {totalSeeds}
          </div>
        </div>
      </div>

      {/* Exercise */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-12 max-w-5xl mx-auto w-full">

        {/* Nuri sidebar */}
        <div className="flex flex-col items-center gap-4 lg:w-56 shrink-0">
          <NuriSpeech text={ex.nuriSpeech} mood={ex.nuriMood} />
          <Nuri mood={ex.nuriMood} size={140} />
        </div>

        {/* Exercise card */}
        <div className="flex-1 w-full bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={ex.index}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              transition={{ duration:0.3 }}
              className="space-y-6">

              {/* Type badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FFA500]/10 border border-[#FFA500]/20 text-[10px] font-bold uppercase tracking-wider text-[#FFA500]">
                <span>
                  {current.type === "translation_en_to_hy" ? "🔤 Թարգմանություն"
                  : current.type === "word_order" ? "🔀 Դասավորիր"
                  : "🎯 Ընտրություն"}
                </span>
                <span className="opacity-30">•</span>
                <span>{current.cefr}</span>
                <span className="opacity-30">•</span>
                <span>+{current.hayqReward} ՀԱՅՔ</span>
              </div>

              {/* Prompt */}
              <h2 className="text-2xl lg:text-3xl font-medium leading-tight">{current.prompt}</h2>

              {/* Hint */}
              {current.hint && sessionLevel === 1 && (
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex gap-3 italic text-sm text-blue-200/70">
                  <span>💡</span>
                  <p>{current.hint}</p>
                </div>
              )}

              {/* Input */}
              <div className="mt-8">
                {current.type === "word_order" && sessionLevel < 3 ? (
                  <WordOrderInput selected={selectedWords} available={availWords}
                    onSelect={w => { setSW(p=>[...p,w]); setAW(p=>{const i=p.indexOf(w);return[...p.slice(0,i),...p.slice(i+1)]}); }}
                    onDeselect={w => { setAW(p=>[...p,w]); setSW(p=>{const i=p.lastIndexOf(w);return[...p.slice(0,i),...p.slice(i+1)]}); }}
                    disabled={ex.state!=="idle"} />
                ) : current.type === "multiple_choice" && current.options && sessionLevel < 3 ? (
                  <MultiChoice options={current.options} selected={ex.userAnswer}
                    onSelect={v => setEx(s=>({...s,userAnswer:v}))}
                    disabled={ex.state!=="idle"} correct={current.targetAnswer} showResult={ex.state!=="idle"} />
                ) : (
                  <textarea value={ex.userAnswer}
                    onChange={e => setEx(s=>({...s,userAnswer:e.target.value}))}
                    onKeyDown={onKey} disabled={ex.state!=="idle"}
                    placeholder="Մուտքագրեք հայերեն..."
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-6 text-xl focus:border-[#0033A0] outline-none transition-all resize-none min-h-[160px]"
                    dir="auto" lang="hy" autoFocus />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback bar */}
      <AnimatePresence>
        {(ex.state === "correct" || ex.state === "incorrect") && (
          <motion.div initial={{ y:100 }} animate={{ y:0 }} exit={{ y:100 }}
            className="fixed bottom-0 left-0 right-0 p-6 lg:p-10 border-t-4"
            style={{
              background: ex.state==="correct" ? "#132d1b" : "#311414",
              borderColor: ex.state==="correct" ? "#22c55e" : "#D90012",
            }}>
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${ex.state==='correct'?'bg-green-500':'bg-red-500'}`}>
                  {ex.state==="correct" ? "✓" : "✕"}
                </div>
                <div>
                  <p className={`text-xl font-bold ${ex.state==='correct'?'text-green-400':'text-red-400'}`}>
                    {ex.state==="correct" ? `Ճիշտ է! +${ex.hayqEarned} ՀԱՅՔ 🪙` : "Սխալ է"}
                  </p>
                  {ex.corrections?.[0] && ex.state==="incorrect" && (
                    <p className="text-white/70 mt-1 italic">
                      Ճիշտ պատասխանը՝ <span className="font-bold text-white not-italic ml-1">{ex.corrections[0]}</span>
                    </p>
                  )}
                </div>
              </div>
              <button onClick={next}
                className="w-full md:w-auto px-12 py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all active:scale-95 shadow-lg"
                style={{
                  background: ex.state==="correct" ? "#22c55e" : "#D90012",
                  color: "white"
                }}>
                Շարունակել
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      {ex.state === "idle" && (
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="max-w-2xl mx-auto">
            <button onClick={submit}
              disabled={!ex.userAnswer.trim() && current.type !== "word_order"}
              className="w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale"
              style={{ background: "linear-gradient(135deg, #D90012, #0033A0)", color: "white", boxShadow: "0 8px 32px rgba(217,0,18,0.3)" }}>
              Ստուգել
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LevelUpModal({ level, onClose }: { level: HAYQLevel; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5, y: 100 }}
        className="bg-white/10 border border-white/20 rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">

        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-[#FFA500]/10 to-transparent animate-pulse" />

        <Nuri mood="excited" size={180} className="mx-auto mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" />

        <h2 className="text-4xl font-black text-white mb-2 leading-tight">Նոր Մակարդակ!</h2>
        <p className="text-white/50 font-bold uppercase tracking-widest text-xs mb-8">Level Up Achievement</p>

        <div className="inline-block px-8 py-4 rounded-3xl mb-8 border-2 shadow-xl"
          style={{ borderColor: level.color, backgroundColor: `${level.color}20` }}>
          <p className="text-sm font-black uppercase tracking-widest mb-1 opacity-50" style={{ color: level.color }}>Rank</p>
          <p className="text-3xl font-black" style={{ color: level.color }}>{level.titleArmenian}</p>
        </div>

        <button onClick={onClose}
          className="w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all active:scale-95 bg-white text-black shadow-lg hover:shadow-white/10">
          Հիանալի է!
        </button>
      </motion.div>
    </motion.div>
  );
}

function WordOrderInput({ selected, available, onSelect, onDeselect, disabled }:
  { selected:string[]; available:string[]; onSelect:(w:string)=>void; onDeselect:(w:string)=>void; disabled:boolean }) {
  return (
    <div className="space-y-6">
      <div className="min-h-[80px] p-4 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-wrap gap-3">
        {selected.length === 0 && <span className="text-white/20 text-sm self-center italic">Ընտրեք բառերը...</span>}
        {selected.map((w,i) => (
          <motion.button key={`s${i}${w}`} initial={{ scale:0.8 }} animate={{ scale:1 }}
            onClick={() => !disabled && onDeselect(w)}
            className="px-5 py-2 rounded-xl bg-[#0033A0] border-b-4 border-blue-900 text-white font-bold hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all">
            {w}
          </motion.button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {available.map((w,i) => (
          <motion.button key={`a${i}${w}`} initial={{ scale:0.8 }} animate={{ scale:1 }}
            onClick={() => !disabled && onSelect(w)}
            className="px-5 py-2 rounded-xl bg-white/10 border-b-4 border-white/5 text-white font-bold hover:bg-white/20 active:border-b-0 active:translate-y-1 transition-all">
            {w}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function MultiChoice({ options, selected, onSelect, disabled, correct, showResult }:
  { options:string[]; selected:string; onSelect:(v:string)=>void; disabled:boolean; correct:string; showResult:boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map(opt => {
        const isSel = selected === opt;
        const isOk  = opt === correct;
        let bg = "bg-white/5"; let border = "border-white/10"; let color = "text-white";
        if (showResult) {
          if (isOk)       { bg="bg-green-500/20"; border="border-green-500"; color="text-green-400"; }
          else if (isSel) { bg="bg-red-500/20";  border="border-red-500";  color="text-red-400"; }
          else            { bg="bg-white/5"; border="border-white/5"; color="opacity-20"; }
        } else if (isSel) { bg="bg-[#0033A0]/20"; border="border-[#0033A0]"; color="text-[#60a5fa]"; }
        return (
          <button key={opt} onClick={() => !disabled && onSelect(opt)}
            className={`p-6 rounded-2xl border-2 text-left font-bold transition-all ${bg} ${border} ${color} ${!disabled && 'hover:bg-white/10'}`}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function LessonSelector({ totalHAYQ, totalSeeds, units, allLessons, onSelect, streak, hasFreeze, crowns }: { totalHAYQ:number; totalSeeds:number; units: any[]; allLessons: Lesson[]; onSelect:(l:Lesson, level:number)=>void; streak:number; hasFreeze:boolean; crowns: Record<string, number> }) {
  const level = hayqToLevel(totalHAYQ);
  const [bgSeeds] = useState(() => Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 10,
    duration: Math.random() * 20 + 20,
  })));

  return (
    <div className="min-h-screen relative text-white overflow-hidden bg-[#1a0a0a]">
      {/* Pomegranate Texture Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #D90012 1px, transparent 0)", backgroundSize: "40px 40px" }} />

      {/* Floating Seeds */}
      {bgSeeds.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full opacity-20 blur-sm"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            background: "radial-gradient(circle, #ff4d4d, #800000)"
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            rotate: [0, 360],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: s.duration, repeat: Infinity, ease: "linear" }}
        />
      ))}

      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D90012] to-[#FFA500] flex items-center justify-center font-black text-xl shadow-lg border border-white/20">Ն</div>
            <span className="font-black tracking-tighter text-xl uppercase italic bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">NUR Lingo</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Level Info */}
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Մակարդակ</p>
              <p className="text-sm font-black" style={{ color: level.color }}>{level.titleArmenian}</p>
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-[#FFA500] bg-white/5 px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                <span className="text-xl">🪙</span> {totalHAYQ}
              </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-lg">
                <span className="text-xl">🍎</span> {totalSeeds}
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1">
            <span className="text-xl">🔥</span> {streak} {hasFreeze && "🛡️"}
              </div>
            </div>
          </div>
        </nav>

        <div className="px-8 pt-16 pb-8 max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full -z-10" />
          <h1 className="text-6xl md:text-8xl font-black leading-none mb-4 tracking-tighter italic">
            Seed <span className="text-[#D90012] drop-shadow-[0_0_15px_rgba(217,0,18,0.5)]">World</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-sm mb-8">Organic learning path — Armenian Soul</p>

          {/* Global Progress Bar */}
          <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex justify-between items-end mb-4">
              <div className="text-left">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Ընդհանուր առաջընթաց</p>
                <p className="text-xl font-black" style={{ color: level.color }}>{level.titleArmenian}</p>
              </div>
              <p className="text-xs font-bold text-white/40">{level.nextLevelHAYQ === Infinity ? "MAX" : `${totalHAYQ} / ${level.nextLevelHAYQ} ՀԱՅՔ`}</p>
            </div>
            {level.nextLevelHAYQ !== Infinity && (
              <div className="h-3 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#D90012] via-[#0033A0] to-[#FFA500]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalHAYQ / level.nextLevelHAYQ) * 100, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }} />
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 pb-32 relative flex-1">
          <div className="flex flex-col items-center gap-20 mt-20 relative">

            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-visible">
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D90012" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#FFA500" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <motion.path
                d="M 400 0 Q 450 200 400 400 T 400 800 T 400 1200 T 400 1600"
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            </svg>

            {units.map((unit, uIdx) => {
              const lessons = allLessons.filter(l => l.unitId === unit.id);
              return (
                <div key={unit.id} className="w-full space-y-16">
                  <div className="flex flex-col items-center relative">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/20 backdrop-blur-md shadow-2xl relative z-10">
                      <h2 className="text-2xl font-black text-[#FFA500] tracking-tight">{unit.titleArmenian}</h2>
                      <p className="text-[10px] text-center text-white/40 font-bold uppercase mt-1">{unit.title}</p>
                    </motion.div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent -z-10" />
                  </div>

                  <div className="relative flex flex-col items-center gap-12">
                    {lessons.map((l, i) => {
                      const xOffset = (i % 2 === 0 ? 60 : -60) * (Math.sin(i + uIdx + 1));
                      return (
                        <motion.button
                          key={l.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onSelect(l, Math.min(3, (crowns[l.id] || 0) + 1))}
                          className="relative group z-20"
                          style={{ x: xOffset }}
                        >
                          {/* Crown Badges */}
                          <div className="absolute -top-4 -right-4 flex flex-col gap-1 z-30">
                            {[1, 2, 3].map(crownLvl => (
                              <motion.div
                                key={crownLvl}
                                initial={{ scale: 0 }}
                                animate={{ scale: (crowns[l.id] || 0) >= crownLvl ? 1 : 0 }}
                                className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] shadow-lg border border-yellow-600"
                              >
                                ⭐
                              </motion.div>
                            ))}
                          </div>

                          {/* Animated Glow */}
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 blur-2xl rounded-full -z-10"
                            style={{ background: `linear-gradient(135deg, ${unit.colorFrom}, ${unit.colorTo})` }}
                          />

                          {/* Lesson Seed (Pomegranate Seed) */}
                          <div className={`w-24 h-24 rounded-[35%_65%_70%_30%/30%_30%_70%_70%] flex items-center justify-center text-4xl shadow-2xl transition-all border-4 relative overflow-hidden
                            ${(crowns[l.id] || 0) > 0 ? 'border-yellow-400' : 'border-white/20'}`}
                            style={{ background: `linear-gradient(135deg, ${unit.colorFrom}, ${unit.colorTo})` }}>

                            {/* Inner shine */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />

                            <span className="relative z-10 drop-shadow-lg">{unit.iconEmoji}</span>
                          </div>

                          {/* Tooltip */}
                          <div className="absolute top-1/2 left-full ml-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 pointer-events-none z-30">
                            <div className="bg-black/90 border border-white/20 backdrop-blur-xl p-5 rounded-3xl whitespace-nowrap shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-8 rounded-full" style={{ background: unit.colorFrom }} />
                                <div>
                                  <p className="font-black text-lg leading-none">{l.titleArmenian}</p>
                                  <p className="text-[10px] text-white/40 font-bold uppercase mt-1">{l.title}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <span className="bg-white/10 px-2 py-1 rounded-lg text-[10px] font-bold">{l.cefr}</span>
                                <span className="bg-[#FFA500]/20 text-[#FFA500] px-2 py-1 rounded-lg text-[10px] font-bold">+{l.hayqTotal} HAYQ</span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletionScreen({ lesson, totalHAYQ, totalSeeds, hearts, onContinue }:
  { lesson:Lesson; totalHAYQ:number; totalSeeds:number; hearts:number; onContinue:()=>void }) {
  const level = hayqToLevel(totalHAYQ);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative text-white">
      <div className="h-1.5 w-full flex fixed top-0 left-0 right-0">
        <div className="h-full flex-1" style={{ background: "#D90012" }} />
        <div className="h-full flex-1" style={{ background: "#0033A0" }} />
        <div className="h-full flex-1" style={{ background: "#FFA500" }} />
      </div>

      <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
        className="space-y-8 max-w-md w-full">

        <Nuri mood="celebrating" size={200} className="mx-auto drop-shadow-2xl" />

        <div>
          <h1 className="text-5xl font-black text-white mb-2">Շնորհավոր! 🎉</h1>
          <p className="text-xl text-white/50 font-medium italic">Դասն ավարտված է:</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label:"ՀԱՅՔ", value:`+${totalHAYQ}`, color:"text-[#FFA500]" },
            { label:"Սերմեր", value:`+${totalSeeds}`, color:"text-red-400" },
            { label:"Սիրտ", value:hearts > 0 ? "❤️".repeat(hearts) : "💔", color:"text-[#D90012]" },
            { label:"Մակարդակ", value:level.titleArmenian, color:level.color },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-lg">
              <div className={`text-sm font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-white/30">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-end">
            <div className="text-left">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Հաջորդ մակարդակը</p>
              <p className="text-lg font-black" style={{ color: level.color }}>{level.titleArmenian}</p>
            </div>
            <p className="text-sm font-bold text-white/40">{level.nextLevelHAYQ === Infinity ? "ԱՌԱՎԵԼԱԳՈՒՅՆ" : `${totalHAYQ} / ${level.nextLevelHAYQ} ՀԱՅՔ`}</p>
          </div>
          {level.nextLevelHAYQ !== Infinity && (
            <div className="h-4 rounded-full bg-white/5 overflow-hidden p-1 border border-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#D90012] via-[#0033A0] to-[#FFA500]"
                initial={{ width:0 }}
                animate={{ width:`${Math.min((totalHAYQ/level.nextLevelHAYQ)*100,100)}%` }}
                transition={{ delay:0.5, duration:1.5, ease: "easeOut" }} />
            </div>
          )}
        </div>

        <button onClick={onContinue}
          className="w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl transition-all active:scale-95 bg-white text-black hover:bg-white/90">
          Շարունակել
        </button>
      </motion.div>
    </div>
  );
}
