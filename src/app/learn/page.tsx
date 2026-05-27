"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Nuri, { NuriSpeech, getMoodFromScore, type NuriMood } from "@/components/Nuri";
import BottomNav from "@/components/BottomNav";
import {
  type Exercise, type Lesson, type HAYQLevel,
  HAYQ_REWARDS, SEED_REWARDS, hayqToLevel, scoreToGrade,
} from "@/lib/lessons/engine";
import {
  loadRewards, saveRewards, addRewards, checkAndApplyFreeze,
  saveCrownLevel, syncHearts, deductHeart, buyHeartRefill, getNextHeartCountdown,
  type UserRewards
} from "@/lib/rewards/seeds";
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
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const router = useRouter();
  const [complete, setComplete] = useState(false);
  const [hearts, setHearts]     = useState(3);
  const [countdown, setCountdown] = useState<number>(0);
  const [startTime] = useState(() => Date.now());
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [totalHAYQ, setTotal]   = useState(0);
  const [totalSeeds, setSeeds]  = useState(0);
  const [sessionHAYQ, setSessionHAYQ]   = useState(0);
  const [sessionSeeds, setSessionSeeds] = useState(0);
  const [streak, setStreak]     = useState(0);
  const [crowns, setCrowns]     = useState<Record<string, number>>({});
  const [sessionLevel, setSLevel] = useState(1);
  const [selectedWords, setSW]  = useState<string[]>([]);
  const [availWords, setAW]     = useState<string[]>([]);

  const [ex, setEx] = useState<ExState>({
    index: 0, userAnswer: "", state: "idle",
    feedback: "", score: 0, hayqEarned: 0,
    nuriMood: "idle", nuriSpeech: randomLine("idle"),
  });

  const current = lesson?.exercises[ex.index];

  useEffect(() => {
    const rewards = syncHearts();
    const withFreeze = checkAndApplyFreeze();
    const finalRewards = { ...rewards, ...withFreeze };

    setTotal(finalRewards.totalHAYQ);
    setSeeds(finalRewards.totalSeeds);
    setStreak(finalRewards.streak);
    setCrowns(finalRewards.crowns || {});
    setHearts(finalRewards.hearts);

    const source = (localStorage.getItem("nur_source_lang") || "en") as Language;
    const target = (localStorage.getItem("nur_target_lang") || "hy") as Language;
    const data = getLessonsForPair(source, target);
    setAllLessons(data.lessons);
  }, []);

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
      const res  = await fetch("/api/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer: answer,
          lessonId: lesson!.id,
          expectedAnswers: current.acceptableAnswers.length > 0 ? current.acceptableAnswers : [current.targetAnswer],
          sourceLanguage: localStorage.getItem("nur_source_lang") || "en",
          targetLanguage: localStorage.getItem("nur_target_lang") || "hy",
        }),
      });
      const data = await res.json();
      const hayq = data.correct ? data.hayq : 0;
      const seeds = data.correct ? data.seeds : 0;

      const mood = getMoodFromScore(data.score, data.correct, streak + (data.correct ? 1 : 0));

      setStats(prev => ({ correct: prev.correct + (data.correct ? 1 : 0), total: prev.total + 1 }));

      if (!data.correct) {
        const updated = deductHeart();
        setHearts(updated.hearts);
      }

      if (data.correct) {
        const updated = addRewards(hayq, seeds);
        setTotal(updated.totalHAYQ);
        setSeeds(updated.totalSeeds);
        setStreak(updated.streak);
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
  }, [current, ex.userAnswer, ex.state, selectedWords, lesson, streak]);

  const next = useCallback(() => {
    if (!lesson) return;
    const nextIdx = ex.index + 1;
    if (nextIdx >= lesson.exercises.length) {
      let bonusHayq = HAYQ_REWARDS.LESSON_COMPLETE;
      let bonusSeeds = hearts === 3 ? SEED_REWARDS.PERFECT_LESSON : 0;

      addRewards(bonusHayq, bonusSeeds, lesson.estimatedMinutes);
      saveCrownLevel(lesson.id, sessionLevel);

      setComplete(true);
      return;
    }
    setEx({ index: nextIdx, userAnswer: "", state: "idle", feedback: "", score: 0, hayqEarned: 0, nuriMood: "happy", nuriSpeech: randomLine("idle") });
    setSW([]); setAW([]);
  }, [lesson, ex.index, hearts, sessionLevel]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    if (ex.state === "idle") submit();
    else if (ex.state !== "submitting") next();
  }, [ex.state, submit, next]);

  const refill = () => {
    const res = buyHeartRefill();
    if (res.success) {
      setTotal(res.rewards.totalHAYQ);
      setHearts(res.rewards.hearts);
    }
  };

  useEffect(() => {
    if (!lesson && allLessons.length > 0) {
      const savedLessonId = localStorage.getItem("nur_current_lesson");
      if (savedLessonId) {
        const l = allLessons.find(x => x.id === savedLessonId);
        if (l) {
          const lvl = Math.min(3, (crowns[l.id] || 0) + 1);
          setLesson(l);
          setSLevel(lvl);
          setEx({ index: 0, userAnswer: "", state: "idle", feedback: "", score: 0, hayqEarned: 0, nuriMood: "happy", nuriSpeech: "Եկեք սկսենք: 🍎" });
          setHearts(loadRewards().hearts);
        } else {
          router.push("/world");
        }
      } else {
        router.push("/world");
      }
    }
  }, [allLessons, crowns, lesson, router]);

  if (complete && lesson)
    return <CompletionScreen
      lesson={lesson}
      totalHAYQ={sessionHAYQ}
      totalSeeds={sessionSeeds}
      hearts={hearts}
      stats={stats}
      duration={Date.now() - startTime}
      onContinue={() => { localStorage.removeItem("nur_current_lesson"); router.push("/world"); }} />;

  if (hearts <= 0)
    return <NoHeartsScreen countdown={countdown} totalHAYQ={totalHAYQ} onRefill={refill} onBack={() => { localStorage.removeItem("nur_current_lesson"); router.push("/world"); }} />;

  if (!lesson || !current) return null;
  const progress = (ex.index / lesson.exercises.length) * 100;

  return (
    <div className="min-h-screen flex flex-col relative text-white">
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1" style={{ background: "#D90012" }} />
        <div className="h-full flex-1" style={{ background: "#0033A0" }} />
        <div className="h-full flex-1" style={{ background: "#FFA500" }} />
      </div>

      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <button onClick={() => { localStorage.removeItem("nur_current_lesson"); router.push("/world"); }} className="text-white/40 hover:text-white text-2xl transition-colors">✕</button>

        <div className="flex-1 h-3 rounded-full overflow-hidden bg-white/10 mx-4">
          <motion.div className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #D90012, #FFA500)" }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
        </div>

        <div className="flex flex-col items-end mr-4">
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <motion.span key={i} animate={{ scale: i < hearts ? 1 : 0.8, opacity: i < hearts ? 1 : 0.3 }} className="text-xl">❤️</motion.span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl flex items-center gap-2 text-sm font-bold">
            <span className="text-yellow-400">🪙</span> {totalHAYQ}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="flex flex-col items-center gap-4 lg:w-56 shrink-0">
          <NuriSpeech text={ex.nuriSpeech} mood={ex.nuriMood} />
          <Nuri mood={ex.nuriMood} size={140} />
        </div>

        <div className="flex-1 w-full bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={ex.index}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              transition={{ duration:0.3 }}
              className="space-y-6">

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

              <h2 className="text-2xl lg:text-3xl font-medium leading-tight">{current.prompt}</h2>

              {current.hint && sessionLevel === 1 && (
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex gap-3 italic text-sm text-blue-200/70">
                  <span>💡</span>
                  <p>{current.hint}</p>
                </div>
              )}

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

function NoHeartsScreen({ countdown, totalHAYQ, onRefill, onBack }: { countdown: number; totalHAYQ: number; onRefill: () => void; onBack: () => void }) {
  const h = Math.floor(countdown / 3600000);
  const m = Math.floor((countdown % 3600000) / 60000);
  const s = Math.floor((countdown % 60000) / 1000);

  return (
    <div className="min-h-screen bg-[#1a0a0a] text-white flex flex-col items-center justify-center p-8 text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8 max-w-sm">
        <Nuri mood="sad" size={180} />
        <div>
          <h1 className="text-4xl font-black mb-2">Սրտեր չկան</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No hearts left</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-sm font-bold text-white/60 mb-2">Հաջորդ սիրտը`</p>
          <p className="text-3xl font-black text-[#D90012] tabular-nums">
            {h}ժ {m}ր {s}վ
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onRefill}
            disabled={totalHAYQ < 100}
            className="w-full py-5 rounded-2xl bg-white text-black font-black text-xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-20">
            Վերականգնել (100 🪙)
          </button>
          <button onClick={onBack} className="w-full py-4 text-white/40 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors">
            Վերադառնալ
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CompletionScreen({ lesson, totalHAYQ, totalSeeds, hearts, stats, duration, onContinue }:
  { lesson:Lesson; totalHAYQ:number; totalSeeds:number; hearts:number; stats: { correct:number; total:number }; duration:number; onContinue:()=>void }) {
  const level = hayqToLevel(loadRewards().totalHAYQ);
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const timeStr = `${Math.floor(duration / 60000)}ր ${Math.floor((duration % 60000) / 1000)}վ`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'NUR Lingo',
        text: `Ես ավարտեցի "${lesson.titleArmenian}" դասը ${accuracy}% ճշտությամբ NUR Lingo-ում! 🍎`,
        url: window.location.origin
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative text-white overflow-hidden">
      {/* CSS Confetti */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="confetti" style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#D90012', '#0033A0', '#FFA500'][i % 3],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }} />
        ))}
      </div>

      <style jsx>{`
        .confetti {
          position: absolute;
          width: 8px;
          height: 8px;
          top: -10px;
          opacity: 0;
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {[
            { label:"Ճշտություն", value:`${accuracy}%`, color:"text-green-400" },
            { label:"Ժամանակ", value:timeStr, color:"text-blue-400" },
            { label:"ՀԱՅՔ", value:`+${totalHAYQ}`, color:"text-[#FFA500]" },
            { label:"Սերմեր", value:`+${totalSeeds}`, color:"text-red-400" },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-lg">
              <div className={`text-lg font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-white/30">{s.label}</div>
            </div>
          ))}
        </div>

        {totalSeeds > 0 && (
          <motion.div initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.5 }}
            className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-left">
              <span className="text-4xl">🍎</span>
              <div>
                <p className="text-sm font-black text-red-400 uppercase tracking-widest">Նոր Սերմ!</p>
                <p className="text-xs text-white/60">Դուք վաստակեցիք նոր սերմ կատարյալ դասի համար:</p>
              </div>
            </div>
            <div className="text-2xl font-black text-red-400">+1</div>
          </motion.div>
        )}

        <div className="flex gap-4">
          <button onClick={handleShare}
            className="flex-1 py-5 rounded-2xl font-black text-xl border-2 border-white/20 hover:bg-white/5 transition-all">
            📤 Կիսվել
          </button>
          <button onClick={onContinue}
            className="flex-[2] py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl transition-all active:scale-95 bg-white text-black hover:bg-white/90">
            Շարունակել
          </button>
        </div>
      </motion.div>
    </div>
  );
}
