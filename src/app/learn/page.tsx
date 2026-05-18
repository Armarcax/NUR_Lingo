"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Nuri, { NuriSpeech, getMoodFromScore, type NuriMood } from "@/components/Nuri";
import {
  LESSONS, UNITS,
  type Exercise, type Lesson,
  HAYQ_REWARDS, hayqToLevel, scoreToGrade,
} from "@/lib/lessons/engine";

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
  const [complete, setComplete] = useState(false);
  const [hearts, setHearts]     = useState(3);
  const [totalHAYQ, setTotal]   = useState(0);
  const [selectedWords, setSW]  = useState<string[]>([]);
  const [availWords, setAW]     = useState<string[]>([]);

  const [ex, setEx] = useState<ExState>({
    index: 0, userAnswer: "", state: "idle",
    feedback: "", score: 0, hayqEarned: 0,
    nuriMood: "idle", nuriSpeech: randomLine("idle"),
  });

  const current = lesson?.exercises[ex.index];

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
      const res  = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer: answer,
          expectedAnswer: current.targetAnswer,
          englishOriginal: current.prompt.replace(/Translate to Armenian:|Arrange:/gi,"").replace(/"/g,"").trim(),
          allValidAnswers: current.acceptableAnswers,
          useAI: false,
          strictMode: current.type === "word_order", // Enforce strict mode for word order
        }),
      });
      const data = await res.json();
      const hayq = data.accepted ? current.hayqReward : 0;
      const mood = getMoodFromScore(data.score, data.accepted);

      if (!data.accepted) setHearts(h => Math.max(0, h - 1));
      setTotal(t => t + hayq);
      setEx(s => ({
        ...s,
        state: data.accepted ? "correct" : "incorrect",
        feedback: data.feedback,
        score: data.score,
        hayqEarned: hayq,
        corrections: data.corrections,
        nuriMood: mood,
        nuriSpeech: randomLine(
          data.score >= 0.98 ? "correct_perfect"
          : data.accepted   ? "correct"
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
    if (nextIdx >= lesson.exercises.length) { setComplete(true); return; }
    setEx({ index: nextIdx, userAnswer: "", state: "idle", feedback: "", score: 0, hayqEarned: 0, nuriMood: "happy", nuriSpeech: randomLine("idle") });
    setSW([]); setAW([]);
  }, [lesson, ex.index]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    if (ex.state === "idle") submit();
    else if (ex.state !== "submitting") next();
  }, [ex.state, submit, next]);

  if (complete && lesson)
    return <CompletionScreen lesson={lesson} totalHAYQ={totalHAYQ} hearts={hearts}
      onContinue={() => { setLesson(null); setComplete(false); setHearts(3); setTotal(0); }} />;

  if (!lesson)
    return <LessonSelector onSelect={l => { setLesson(l); setEx({ index:0, userAnswer:"", state:"idle", feedback:"", score:0, hayqEarned:0, nuriMood:"happy", nuriSpeech:"Եկեք սկսենք: 🍎" }); setHearts(3); setTotal(0); }} />;

  if (!current) return null;
  const progress = (ex.index / lesson.exercises.length) * 100;

  return (
    <div className="min-h-screen flex flex-col relative text-white">
      {/* Background with overlay */}
      <div className="fixed inset-0 z-[-1]">
        <Image
          src="/images/pomegranate-bg.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

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

        {/* HAYQ */}
        <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl flex items-center gap-2 text-sm font-bold">
          <span className="text-yellow-400">🪙</span> {totalHAYQ}
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
              {current.hint && (
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex gap-3 italic text-sm text-blue-200/70">
                  <span>💡</span>
                  <p>{current.hint}</p>
                </div>
              )}

              {/* Input */}
              <div className="mt-8">
                {current.type === "word_order" ? (
                  <WordOrderInput selected={selectedWords} available={availWords}
                    onSelect={w => { setSW(p=>[...p,w]); setAW(p=>{const i=p.indexOf(w);return[...p.slice(0,i),...p.slice(i+1)]}); }}
                    onDeselect={w => { setAW(p=>[...p,w]); setSW(p=>{const i=p.lastIndexOf(w);return[...p.slice(0,i),...p.slice(i+1)]}); }}
                    disabled={ex.state!=="idle"} />
                ) : current.type === "multiple_choice" && current.options ? (
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

function LessonSelector({ onSelect }: { onSelect:(l:Lesson)=>void }) {
  return (
    <div className="min-h-screen relative text-white">
      <div className="fixed inset-0 z-[-1]">
        <Image
          src="/images/pomegranate-bg.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1" style={{ background: "#D90012" }} />
        <div className="h-full flex-1" style={{ background: "#0033A0" }} />
        <div className="h-full flex-1" style={{ background: "#FFA500" }} />
      </div>

      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-white/5 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D90012] to-[#FFA500] flex items-center justify-center font-black text-xl shadow-lg">Ն</div>
          <span className="font-black tracking-tighter text-xl uppercase italic">NUR Lingo</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-[#FFA500]">
            <span className="text-xl">🪙</span> ՀԱՅՔ
          </div>
        </div>
      </nav>

      <div className="px-8 pt-12 pb-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 text-center md:text-left">
          <p className="text-[#FFA500] font-black uppercase tracking-widest text-xs mb-4 flex items-center justify-center md:justify-start gap-2">
            <span className="text-base">🇦🇲</span> Հայերեն • Armenian
          </p>
          <h1 className="text-5xl md:text-6xl font-black leading-none mb-6">
            Սովորիր <span className="text-[#D90012]">Հայերեն</span>
          </h1>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-white/50 font-medium">
            <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Իմաստային ուսուցում</span>
            <span className="flex items-center gap-1"><span className="text-green-500">✓</span> ՀԱՅՔ պարգևներ</span>
          </div>
        </div>
        <Nuri mood="happy" size={180} className="drop-shadow-2xl" />
      </div>

      <div className="px-8 pb-24 max-w-4xl mx-auto space-y-12 mt-12">
        {UNITS.map(unit => {
          const lessons = LESSONS.filter(l => l.unitId === unit.id);
          return (
            <div key={unit.id} className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${unit.colorFrom}, ${unit.colorTo})` }}>
                  {unit.iconEmoji}
                </div>
                <div>
                  <h2 className="text-2xl font-black">{unit.titleArmenian}</h2>
                  <p className="text-white/40 font-bold text-sm uppercase tracking-tight">{unit.title} • {unit.cefr}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessons.map((l, i) => (
                  <motion.button key={l.id} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={() => onSelect(l)}
                    className="bg-white/5 border-2 border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-white/20 transition-all text-left group">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-black mb-3 group-hover:bg-[#FFA500] group-hover:text-black transition-colors">
                          {i+1}
                        </div>
                        <h3 className="text-lg font-bold mb-1">{l.titleArmenian}</h3>
                        <p className="text-white/40 text-xs font-medium">{l.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="bg-yellow-400/10 text-yellow-500 px-2 py-1 rounded-lg text-[10px] font-black italic">🪙 {l.hayqTotal}</span>
                        <span className="text-white/20 text-[10px] font-bold">⏱ {l.estimatedMinutes} րոպե</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompletionScreen({ lesson, totalHAYQ, hearts, onContinue }:
  { lesson:Lesson; totalHAYQ:number; hearts:number; onContinue:()=>void }) {
  const level = hayqToLevel(totalHAYQ);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative text-white">
      <div className="fixed inset-0 z-[-1]">
        <Image
          src="/images/pomegranate-bg.jpg"
          alt="Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

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

        <div className="grid grid-cols-3 gap-4">
          {[
            { label:"ՀԱՅՔ", value:`+${totalHAYQ}`, color:"text-[#FFA500]" },
            { label:"Սիրտ", value:hearts > 0 ? "❤️".repeat(hearts) : "💔", color:"text-[#D90012]" },
            { label:"Մակարդակ", value:level.titleArmenian, color:level.color },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-lg">
              <div className={`text-xl font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30">{s.label}</div>
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
