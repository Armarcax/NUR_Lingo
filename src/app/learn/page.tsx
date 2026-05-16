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
  correct_perfect: ["Կataryal! Hifanali! 🌟", "Wow, HAYQ earned! 🏆", "Kchem karak! 🎉"],
  correct:         ["Shat lav! ✅", "Ayo! Hayeren gites! 👍", "Ëntrel e! Shararunak!"],
  incorrect:       ["Mի aner! Karogh es 💪", "Verakanchir! Kareli e", "Shat mots e, bayts kgas!"],
  thinking:        ["Mtatsir... 💭", "Hayeren e, inchvor jyur 🤔", "Voch stelsts, voch aystegh..."],
  idle:            ["Barev! Soverum enq! 🍎", "Inch pes es? Ready e?", "Hayeren soverl HAYQ e 🪙"],
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
      setEx(s => ({ ...s, state: "incorrect", feedback: "Connection error.", nuriMood: "sad", nuriSpeech: "Vat internet! 😅" }));
    }
  }, [current, ex.userAnswer, ex.state, selectedWords]);

  const next = useCallback(() => {
    if (!lesson) return;
    const nextIdx = ex.index + 1;
    if (nextIdx >= lesson.exercises.length) { setComplete(true); return; }
    setEx({ index: nextIdx, userAnswer: "", state: "idle", feedback: "", score: 0, hayqEarned: 0, nuriMood: "idle", nuriSpeech: randomLine("idle") });
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
    return <LessonSelector onSelect={l => { setLesson(l); setEx({ index:0, userAnswer:"", state:"idle", feedback:"", score:0, hayqEarned:0, nuriMood:"happy", nuriSpeech:"Bayc inchov skasenq! 🍎" }); setHearts(3); setTotal(0); }} />;

  if (!current) return null;
  const progress = (ex.index / lesson.exercises.length) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)", color: "white" }}>

      {/* Top flag stripe */}
      <div className="h-1 w-full flag-stripe" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
        <button onClick={() => setLesson(null)} className="text-white/40 hover:text-white text-xl transition-colors">✕</button>

        {/* Progress */}
        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,var(--hy-red),var(--hy-orange))" }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
        </div>

        {/* Hearts */}
        <div className="flex gap-0.5">
          {[0,1,2].map(i => (
            <motion.span key={i} animate={{ scale: i < hearts ? 1 : 0.6, opacity: i < hearts ? 1 : 0.25 }} className="text-lg">❤️</motion.span>
          ))}
        </div>

        {/* HAYQ */}
        <div className="hayq-chip">🪙 {totalHAYQ}</div>
      </div>

      {/* Exercise */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 px-4 py-8 max-w-4xl mx-auto w-full">

        {/* Nuri sidebar */}
        <div className="flex flex-col items-center gap-3 lg:w-48 shrink-0">
          <NuriSpeech text={ex.nuriSpeech} mood={ex.nuriMood} />
          <Nuri mood={ex.nuriMood} size={110} />
        </div>

        {/* Exercise card */}
        <div className="flex-1 w-full">
          <AnimatePresence mode="wait">
            <motion.div key={ex.index}
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}
              transition={{ duration:0.25 }}
              className="space-y-5">

              {/* Type badge */}
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest"
                style={{ color:"var(--hy-orange)" }}>
                <span>
                  {current.type === "translation_en_to_hy" ? "🔤 Translate"
                  : current.type === "word_order" ? "🔀 Arrange"
                  : "🎯 Choose"}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-white/30">{current.cefr} · +{current.hayqReward} HAYQ</span>
              </div>

              {/* Prompt */}
              <h2 className="text-xl lg:text-2xl font-light leading-relaxed">{current.prompt}</h2>

              {/* Hint */}
              {current.hint && (
                <p className="text-sm italic pl-3 border-l-2" style={{ color:"rgba(242,168,0,0.7)", borderColor:"rgba(242,168,0,0.3)" }}>
                  💡 {current.hint}
                </p>
              )}

              {/* Input */}
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
                  placeholder="Մuтqagreq hayeren..."
                  className="answer-input" dir="auto" lang="hy" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback bar */}
      <AnimatePresence>
        {(ex.state === "correct" || ex.state === "incorrect") && (
          <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
            className="border-t-2 p-5"
            style={{
              background: ex.state==="correct" ? "rgba(16,80,40,0.9)" : "rgba(80,16,16,0.9)",
              borderColor: ex.state==="correct" ? "var(--hy-orange)" : "var(--hy-red)",
            }}>
            <div className="max-w-2xl mx-auto flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-bold text-lg mb-1">
                  {ex.state==="correct" ? `✅ Ëntrel e! +${ex.hayqEarned} HAYQ 🪙` : "❌ Mтatir"}
                </p>
                <p className="text-sm text-white/60">{ex.feedback}</p>
                {ex.corrections?.[0] && ex.state==="incorrect" && (
                  <p className="text-sm mt-1">
                    <span className="text-white/40">Ëntrel pastasхan: </span>
                    <span className="font-armenian font-semibold" style={{ color:"var(--hy-orange)" }}>{ex.corrections[0]}</span>
                  </p>
                )}
              </div>
              <button onClick={next}
                className="px-6 py-3 rounded-2xl font-bold text-white shrink-0 transition-all active:scale-95"
                style={{ background: ex.state==="correct" ? "var(--hy-orange)" : "var(--hy-red)", color: ex.state==="correct" ? "#07080f" : "white" }}>
                Shаrunakel →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      {ex.state === "idle" && (
        <div className="p-4 border-t" style={{ borderColor:"var(--color-border)" }}>
          <div className="max-w-2xl mx-auto">
            <button onClick={submit}
              disabled={!ex.userAnswer.trim() && current.type !== "word_order"}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background:"linear-gradient(135deg,var(--hy-red),var(--hy-blue))", color:"white", boxShadow:"0 4px 24px rgba(217,0,18,0.25)" }}>
              Stugel → 
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Word Order ────────────────────────────────────────────────────────────────
function WordOrderInput({ selected, available, onSelect, onDeselect, disabled }:
  { selected:string[]; available:string[]; onSelect:(w:string)=>void; onDeselect:(w:string)=>void; disabled:boolean }) {
  return (
    <div className="space-y-4">
      <div className="min-h-[56px] p-3 rounded-2xl border-2 border-dashed flex flex-wrap gap-2"
        style={{ borderColor:"rgba(242,168,0,0.25)", background:"rgba(242,168,0,0.03)" }}>
        {selected.length === 0 && <span className="text-white/25 text-sm self-center">Ëntrел bardery storevin...</span>}
        {selected.map((w,i) => (
          <motion.button key={`s${i}${w}`} initial={{ scale:0.8 }} animate={{ scale:1 }}
            onClick={() => !disabled && onDeselect(w)} className="word-chip-selected">{w}</motion.button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {available.map((w,i) => (
          <motion.button key={`a${i}${w}`} initial={{ scale:0.8 }} animate={{ scale:1 }}
            onClick={() => !disabled && onSelect(w)} className="word-chip-available">{w}</motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Multiple Choice ───────────────────────────────────────────────────────────
function MultiChoice({ options, selected, onSelect, disabled, correct, showResult }:
  { options:string[]; selected:string; onSelect:(v:string)=>void; disabled:boolean; correct:string; showResult:boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(opt => {
        const isSel = selected === opt;
        const isOk  = opt === correct;
        let bg = "rgba(255,255,255,0.05)"; let border = "rgba(255,255,255,0.1)"; let color = "white";
        if (showResult) {
          if (isOk)       { bg="rgba(0,120,60,0.25)"; border="rgba(0,200,100,0.5)"; color="#6effa0"; }
          else if (isSel) { bg="rgba(120,0,0,0.25)";  border="rgba(217,0,18,0.5)";  color="#ffaaaa"; }
          else            { color="rgba(255,255,255,0.25)"; }
        } else if (isSel) { bg="rgba(242,168,0,0.1)"; border="var(--hy-orange)"; color="var(--hy-orange)"; }
        return (
          <button key={opt} onClick={() => !disabled && onSelect(opt)}
            className="p-4 rounded-2xl border-2 text-left font-medium transition-all text-sm"
            style={{ background:bg, borderColor:border, color }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ── Lesson Selector ───────────────────────────────────────────────────────────
function LessonSelector({ onSelect }: { onSelect:(l:Lesson)=>void }) {
  return (
    <div className="min-h-screen" style={{ background:"var(--color-bg)", color:"white" }}>
      <div className="h-1.5 flag-stripe" />

      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor:"var(--color-border)" }}>
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="NUR Lingo" width={34} height={34} className="rounded-xl" />
          <span className="font-bold tracking-widest text-sm uppercase" style={{ color:"var(--hy-orange)" }}>NUR Lingo</span>
        </div>
        <div className="hayq-chip">🪙 HAYQ</div>
      </div>

      {/* Hero */}
      <div className="px-6 pt-8 pb-4 max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color:"var(--hy-orange)" }}>🇦🇲 Hayeren · Armenian</p>
            <h1 className="text-3xl font-light leading-tight">
              Sovorecir<br/><span style={{ color:"var(--hy-red)" }}>Hayeren</span>
            </h1>
            <p className="text-white/40 text-sm mt-2">Semantic engine · HAYQ rewards · Nuri mascot</p>
          </div>
          <Nuri mood="happy" size={90} />
        </div>
      </div>

      {/* Units */}
      <div className="px-6 pb-16 max-w-3xl mx-auto space-y-8">
        {UNITS.map(unit => {
          const lessons = LESSONS.filter(l => l.unitId === unit.id);
          return (
            <div key={unit.id}>
              {/* Unit header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background:`linear-gradient(135deg,${unit.colorFrom},${unit.colorTo})`, boxShadow:`0 4px 16px ${unit.colorFrom}44` }}>
                  {unit.iconEmoji}
                </div>
                <div>
                  <h2 className="font-semibold">{unit.titleArmenian}</h2>
                  <p className="text-white/40 text-xs">{unit.title} · {unit.cefr}</p>
                </div>
              </div>

              {/* Lessons */}
              <div className="space-y-3 pl-1">
                {lessons.map((l, i) => (
                  <motion.button key={l.id} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                    onClick={() => onSelect(l)}
                    className="lesson-card w-full group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ background:`linear-gradient(135deg,${unit.colorFrom}33,${unit.colorTo}33)`, color:unit.colorFrom }}>
                          {i+1}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm">{l.titleArmenian}</p>
                          <p className="text-white/40 text-xs">{l.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/30">
                        <span className="hayq-chip text-xs">🪙 {l.hayqTotal}</span>
                        <span>⏱ {l.estimatedMinutes}m</span>
                        <span className="group-hover:translate-x-1 transition-transform" style={{ color:"var(--hy-orange)" }}>→</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap pl-11">
                      {l.grammarFocus.slice(0,2).map(g => (
                        <span key={g} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:"rgba(0,51,160,0.2)", color:"#a0b4ff" }}>{g}</span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 flag-stripe" />
    </div>
  );
}

// ── Completion ────────────────────────────────────────────────────────────────
function CompletionScreen({ lesson, totalHAYQ, hearts, onContinue }:
  { lesson:Lesson; totalHAYQ:number; hearts:number; onContinue:()=>void }) {
  const level = hayqToLevel(totalHAYQ);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ background:"var(--color-bg)", color:"white" }}>
      <div className="h-1.5 w-full flag-stripe fixed top-0" />

      <motion.div initial={{ scale:0.5, opacity:0 }} animate={{ scale:1, opacity:1 }}
        transition={{ type:"spring", damping:10 }} className="space-y-6 max-w-sm w-full">

        <Nuri mood="celebrating" size={150} className="mx-auto" />

        <div>
          <h1 className="text-3xl font-bold">Shnorhavor! 🎉</h1>
          <p className="text-white/50 mt-1">{lesson.titleArmenian} — complete!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:"HAYQ", value:`+${totalHAYQ}`, color:"var(--hy-orange)" },
            { label:"Hearts", value:"❤️".repeat(hearts)+"🖤".repeat(3-hearts), color:"var(--hy-red)" },
            { label:"Level", value:level.titleArmenian, color:level.color },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center border"
              style={{ background:"var(--color-card)", borderColor:"var(--color-border)" }}>
              <div className="font-bold text-lg" style={{ color:s.color }}>{s.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* HAYQ progress bar */}
        <div className="rounded-2xl p-4 border text-left space-y-2"
          style={{ background:"rgba(242,168,0,0.05)", borderColor:"rgba(242,168,0,0.2)" }}>
          <div className="flex justify-between text-xs">
            <span style={{ color:"var(--hy-orange)" }}>🪙 {level.titleArmenian}</span>
            <span className="text-white/40">{level.nextLevelHAYQ === Infinity ? "MAX" : `${level.nextLevelHAYQ} HAYQ`}</span>
          </div>
          {level.nextLevelHAYQ !== Infinity && (
            <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.08)" }}>
              <motion.div className="h-full rounded-full"
                style={{ background:"linear-gradient(90deg,var(--hy-orange),var(--hy-red))" }}
                initial={{ width:0 }}
                animate={{ width:`${Math.min((totalHAYQ/level.nextLevelHAYQ)*100,100)}%` }}
                transition={{ delay:0.5, duration:1 }} />
            </div>
          )}
        </div>

        <button onClick={onContinue} className="btn-orange w-full rounded-2xl py-4 text-lg">
          Sharуnakel →
        </button>
      </motion.div>
    </div>
  );
}
