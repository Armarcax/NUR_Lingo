"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Nurik, { NurikSpeech, getMoodFromScore } from "@/components/nurik/Nurik";
import type { NurikMood } from "@/components/nurik/Nurik";
import { loadLangConfig, UI_STRINGS } from "@/lib/i18n/index";
import type { LangCode, LangPair } from "@/lib/i18n/index";
import { getLessonById } from "@/lib/i18n/multilingual";
import type { MultiLesson, MultiExercise } from "@/lib/i18n/multilingual";
import { loadRewards, saveRewards, addHAYQ, awardSeed, updateStreak } from "@/lib/rewards/seeds";

const SPEECH: Record<LangCode, Record<string, string[]>> = {
  hy: { correct_perfect:["Kataryal! 🌟","Shat lav! 🎉","+HAYQ! 🪙"], correct:["Ëntrel e! ✅","Lav e! 👍","Sharunakel!"], incorrect:["Mi aner! 💪","Karogh es!","Verakanchir!"], thinking:["Mtatsir... 💭","Inch sa..."], idle:["Barev! 🍎","Sovorel HAYQ e! 🪙","Ready?"] },
  en: { correct_perfect:["Perfect! 🌟","Amazing! 🎉","+HAYQ! 🪙"], correct:["Correct! ✅","Great job! 👍","Keep going!"], incorrect:["Try again! 💪","You can do it!","Almost!"], thinking:["Thinking... 💭","Take your time..."], idle:["Hello! 🍎","Learning = HAYQ! 🪙","Ready?"] },
  ru: { correct_perfect:["Идеально! 🌟","Отлично! 🎉","+HAYQ! 🪙"], correct:["Правильно! ✅","Молодец! 👍","Продолжай!"], incorrect:["Попробуй ещё! 💪","Ты можешь!","Почти!"], thinking:["Думаю... 💭","Подожди..."], idle:["Привет! 🍎","Учёба = HAYQ! 🪙","Готов?"] },
};
const rnd = (a: string[]) => a[Math.floor(Math.random()*a.length)];

function LearnInner() {
  const params   = useSearchParams();
  const router   = useRouter();
  const lessonId = params.get("lesson") ?? "";
  const pairParam= params.get("pair") as LangPair | null;

  const [lesson, setLesson]   = useState<MultiLesson|null>(null);
  const [native, setNative]   = useState<LangCode>("en");
  const [idx, setIdx]         = useState(0);
  const [answer, setAnswer]   = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvail] = useState<string[]>([]);
  const [status, setStatus]   = useState<"idle"|"submitting"|"correct"|"incorrect">("idle");
  const [totalHAYQ, setTotal] = useState(0);
  const [hearts, setHearts]   = useState(3);
  const [done, setDone]       = useState(false);
  const [mood, setMood]       = useState<NurikMood>("idle");
  const [speech, setSpeech]   = useState("🍎");
  const [correction, setCorr] = useState("");

  useEffect(() => {
    const cfg = loadLangConfig();
    const p   = pairParam ?? cfg?.pair ?? "en-hy";
    const nat = cfg?.native ?? "en";
    setNative(nat as LangCode);
    const l = getLessonById(p as LangPair, lessonId);
    if (!l) { router.push("/world"); return; }
    setLesson(l);
    setSpeech(rnd(SPEECH[nat as LangCode].idle));
  }, [lessonId, pairParam, router]);

  const current: MultiExercise|undefined = lesson?.exercises[idx];
  useEffect(() => {
    if (current?.type==="word_order" && current.words) {
      setAvail([...current.words].sort(()=>Math.random()-0.5));
      setSelected([]);
    }
  }, [current]);

  const ui = UI_STRINGS[native];

  const submit = useCallback(async () => {
    if (!current || status==="submitting") return;
    const userAnswer = current.type==="word_order" ? selected.join(" ") : answer.trim();
    if (!userAnswer) return;
    setStatus("submitting"); setMood("thinking"); setSpeech(rnd(SPEECH[native].thinking));
    try {
      const res  = await fetch("/api/validate", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ userAnswer, expectedAnswer:current.targetAnswer,
          englishOriginal:current.prompt["en"]??current.prompt[native], allValidAnswers:current.acceptableAnswers, useAI:false }) });
      const data = await res.json();
      const accepted: boolean = data.accepted;
      const s: number = data.score ?? 0;
      const hayq = accepted ? current.hayqReward : 0;
      if (!accepted) setHearts(h=>Math.max(0,h-1));
      setTotal(t=>t+hayq); setCorr(data.corrections?.[0]??"");
      setStatus(accepted?"correct":"incorrect");
      const m = getMoodFromScore(s, accepted);
      setMood(m);
      setSpeech(rnd(s>=0.98 ? SPEECH[native].correct_perfect : accepted ? SPEECH[native].correct : SPEECH[native].incorrect));
      const rewards = loadRewards();
      saveRewards(addHAYQ(updateStreak(rewards), hayq));
    } catch {
      setStatus("incorrect"); setMood("sad"); setSpeech("😅");
    }
  }, [current, status, answer, selected, native]);

  const next = useCallback(() => {
    if (!lesson) return;
    if (idx+1>=lesson.exercises.length) {
      const c: string[] = JSON.parse(localStorage.getItem("nur_completed")??"[]");
      if (!c.includes(lesson.id)) { c.push(lesson.id); localStorage.setItem("nur_completed",JSON.stringify(c)); }
      const r = loadRewards();
      saveRewards(awardSeed(r,"first_lesson","Lesson complete!"));
      setDone(true); return;
    }
    setIdx(i=>i+1); setAnswer(""); setSelected([]); setStatus("idle"); setCorr(""); setMood("idle");
    setSpeech(rnd(SPEECH[native].idle));
  }, [lesson, idx, native]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key!=="Enter") return;
    if (status==="idle") submit(); else if (status!=="submitting") next();
  }, [status, submit, next]);

  if (done && lesson) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{background:"var(--color-bg)",color:"white"}}>
      <div className="h-1.5 flag-stripe fixed top-0 w-full"/>
      <motion.div initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",damping:10}} className="space-y-6 max-w-sm w-full">
        <Nurik mood="excited" size={140} className="mx-auto"/>
        <h1 className="text-3xl font-bold">{native==="hy"?"Shnorhavor! 🎉":native==="ru"?"Поздравляю! 🎉":"Congratulations! 🎉"}</h1>
        <div className="grid grid-cols-3 gap-3">
          {[{v:`+${totalHAYQ}`,l:"HAYQ",c:"var(--hy-orange)"},{v:"❤️".repeat(hearts)+"🖤".repeat(3-hearts),l:"Hearts",c:"var(--hy-red)"},{v:lesson.cefr,l:"Level",c:"#60a5fa"}].map(s=>(
            <div key={s.l} className="rounded-2xl p-3 border text-center" style={{background:"var(--color-card)",borderColor:"var(--color-border)"}}>
              <div className="font-bold text-xl" style={{color:s.c}}>{s.v}</div>
              <div className="text-xs text-white/40">{s.l}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>router.push("/world")} className="btn-orange w-full rounded-2xl py-4 text-lg">{ui.continue}</button>
      </motion.div>
    </div>
  );

  if (!lesson||!current) return <div className="min-h-screen flex items-center justify-center" style={{background:"var(--color-bg)"}}><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:"var(--hy-orange)"}}/></div>;

  const progress = (idx/lesson.exercises.length)*100;

  return (
    <div className="min-h-screen flex flex-col" style={{background:"var(--color-bg)",color:"white"}}>
      <div className="h-1 flag-stripe"/>
      <div className="flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-10" style={{borderColor:"var(--color-border)",background:"var(--color-bg)"}}>
        <button onClick={()=>router.push("/world")} className="text-white/40 hover:text-white text-xl">✕</button>
        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.08)"}}>
          <motion.div className="h-full rounded-full" style={{background:"linear-gradient(90deg,var(--hy-red),var(--hy-orange))"}} animate={{width:`${progress}%`}} transition={{duration:0.5}}/>
        </div>
        <div className="flex gap-0.5">{[0,1,2].map(i=><motion.span key={i} animate={{scale:i<hearts?1:0.5,opacity:i<hearts?1:0.2}} className="text-lg">❤️</motion.span>)}</div>
        <div className="hayq-chip text-xs">🪙 {totalHAYQ}</div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 px-4 py-8 max-w-4xl mx-auto w-full">
        <div className="flex flex-col items-center gap-3 lg:w-44 shrink-0">
          <NurikSpeech text={speech} mood={mood}/>
          <Nurik mood={mood} size={100}/>
        </div>
        <div className="flex-1 w-full">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-40}} transition={{duration:0.22}} className="space-y-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{color:"var(--hy-orange)"}}>
                <span>{current.type==="translate"?"🔤 "+ui.translate:current.type==="word_order"?"🔀 "+ui.arrange:"🎯 "+ui.choose}</span>
                <span className="text-white/20">·</span>
                <span className="text-white/30">+{current.hayqReward} HAYQ</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-light leading-relaxed">{current.prompt[native]??current.prompt["en"]}</h2>
              {current.hint?.[native] && <p className="text-sm italic pl-3 border-l-2" style={{color:"rgba(242,168,0,0.7)",borderColor:"rgba(242,168,0,0.3)"}}>💡 {current.hint[native]}</p>}
              {current.type==="word_order" ? (
                <div className="space-y-4">
                  <div className="min-h-[56px] p-3 rounded-2xl border-2 border-dashed flex flex-wrap gap-2" style={{borderColor:"rgba(242,168,0,0.2)",background:"rgba(242,168,0,0.03)"}}>
                    {!selected.length&&<span className="text-white/25 text-sm self-center">Select words below...</span>}
                    {selected.map((w,i)=><motion.button key={`s${i}`} initial={{scale:0.8}} animate={{scale:1}} onClick={()=>status==="idle"&&(setAvail(p=>{const x=p.lastIndexOf(w);return [...p.slice(0,x),...p.slice(x+1)];}),setSelected(p=>{const x=p.lastIndexOf(w);return [...p.slice(0,x),...p.slice(x+1)];}))} className="word-chip-selected">{w}</motion.button>)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {available.map((w,i)=><motion.button key={`a${i}`} initial={{scale:0.8}} animate={{scale:1}} onClick={()=>status==="idle"&&(setSelected(p=>[...p,w]),setAvail(p=>{const x=p.indexOf(w);return [...p.slice(0,x),...p.slice(x+1)];}))} className="word-chip-available">{w}</motion.button>)}
                  </div>
                </div>
              ) : current.type==="multiple_choice"&&current.options ? (
                <div className="grid grid-cols-2 gap-3">
                  {current.options.map(opt=>{
                    const isSel=answer===opt; const isOk=opt===current.targetAnswer; const show=status!=="idle"&&status!=="submitting";
                    return <button key={opt} onClick={()=>status==="idle"&&setAnswer(opt)} className="p-4 rounded-2xl border-2 text-left font-medium transition-all text-sm" style={{background:show?(isOk?"rgba(0,120,60,0.25)":isSel?"rgba(120,0,0,0.25)":"rgba(255,255,255,0.03)"):isSel?"rgba(242,168,0,0.08)":"rgba(255,255,255,0.04)",borderColor:show?(isOk?"rgba(0,200,100,0.5)":isSel?"rgba(217,0,18,0.5)":"rgba(255,255,255,0.08)"):isSel?"var(--hy-orange)":"rgba(255,255,255,0.1)",color:show?(isOk?"#6effa0":isSel?"#ffaaaa":"rgba(255,255,255,0.25)"):isSel?"var(--hy-orange)":"white"}}>{opt}</button>;
                  })}
                </div>
              ) : (
                <textarea value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={onKey} disabled={status!=="idle"}
                  placeholder={native==="hy"?"Մuтqagreq...":native==="ru"?"Введите ответ...":"Type your answer..."}
                  className="answer-input" dir="auto"/>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {(status==="correct"||status==="incorrect")&&(
          <motion.div initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}} className="border-t-2 p-5"
            style={{background:status==="correct"?"rgba(16,80,40,0.9)":"rgba(80,16,16,0.9)",borderColor:status==="correct"?"var(--hy-orange)":"var(--hy-red)"}}>
            <div className="max-w-2xl mx-auto flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-bold text-lg mb-1">{status==="correct"?`${ui.correct} +${current.hayqReward} HAYQ 🪙`:ui.wrong}</p>
                {correction&&status==="incorrect"&&<p className="text-sm mt-1"><span className="text-white/40">{native==="ru"?"Правильно: ":"Correct: "}</span><span className="font-armenian font-semibold" style={{color:"var(--hy-orange)"}}>{correction}</span></p>}
              </div>
              <button onClick={next} className="px-6 py-3 rounded-2xl font-bold shrink-0 active:scale-95"
                style={{background:status==="correct"?"var(--hy-orange)":"var(--hy-red)",color:status==="correct"?"#07080f":"white"}}>{ui.next}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {status==="idle"&&(
        <div className="p-4 border-t" style={{borderColor:"var(--color-border)"}}>
          <div className="max-w-2xl mx-auto">
            <button onClick={submit}
              disabled={!answer.trim()&&current.type!=="word_order"&&!selected.length}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-30"
              style={{background:"linear-gradient(135deg,var(--hy-red),var(--hy-blue))",color:"white",boxShadow:"0 4px 24px rgba(217,0,18,0.25)"}}>
              {ui.check}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{background:"var(--color-bg)"}}><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:"var(--hy-orange)"}}/></div>}>
      <LearnInner/>
    </Suspense>
  );
}
