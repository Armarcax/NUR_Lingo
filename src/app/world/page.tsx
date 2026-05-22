"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  loadLangConfig, LANGUAGES, type UserLangConfig,
} from "@/lib/i18n/index";
import {
  getUnitsForPair, getLessonsForPair,
  type MultiLessonUnit, type MultiLesson,
} from "@/lib/i18n/multilingual";
import { loadRewards, getPomGrowth, type RewardState } from "@/lib/rewards/seeds";
import Nurik from "@/components/nurik/Nurik";

// ── Pomegranate SVG World ─────────────────────────────────────────────────────
function PomWorld({ growth, seeds }: { growth: number; seeds: number }) {
  const segments = 12;
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="pomGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ff4466" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8b0000" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id="seedGrad" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#F2A800" />
          <stop offset="100%" stopColor="#c07800" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer pomegranate body */}
      <circle cx="100" cy="105" r="72" fill="url(#pomGrad)" opacity="0.85" />
      <circle cx="100" cy="105" r="72" fill="none" stroke="#D90012" strokeWidth="2" opacity="0.5" />

      {/* Inner seed grid — grows with progress */}
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
        const r = 38;
        const x = 100 + r * Math.cos(angle);
        const y = 105 + r * Math.sin(angle);
        const filled = i < Math.round((growth / 100) * segments);
        return (
          <motion.ellipse key={i}
            cx={x} cy={y} rx="7" ry="9"
            fill={filled ? "url(#seedGrad)" : "rgba(255,255,255,0.08)"}
            stroke={filled ? "#F2A800" : "rgba(255,255,255,0.1)"}
            strokeWidth="0.5"
            transform={`rotate(${(i / segments) * 360}, ${x}, ${y})`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring" }}
            filter={filled ? "url(#glow)" : undefined}
          />
        );
      })}

      {/* Inner ring seeds */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const r = 18;
        const x = 100 + r * Math.cos(angle);
        const y = 105 + r * Math.sin(angle);
        const filled = seeds > i * 2;
        return (
          <motion.circle key={`inner-${i}`}
            cx={x} cy={y} r="4.5"
            fill={filled ? "#F2A800" : "rgba(255,255,255,0.06)"}
            stroke={filled ? "#fff" : "transparent"}
            strokeWidth="0.5"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.06 }}
          />
        );
      })}

      {/* Center seed count */}
      <circle cx="100" cy="105" r="11" fill="rgba(0,0,0,0.5)" />
      <text x="100" y="109" textAnchor="middle" fontSize="9" fill="#F2A800" fontWeight="bold" fontFamily="monospace">
        {seeds}
      </text>

      {/* Crown */}
      <path d="M 82 34 L 88 22 L 94 30 L 100 18 L 106 30 L 112 22 L 118 34 Z"
        fill="#2d8a4e" opacity="0.9" />
      <circle cx="100" cy="20" r="4" fill="#F2A800" />

      {/* Growth ring */}
      <circle cx="100" cy="105" r="72" fill="none"
        stroke="#F2A800" strokeWidth="2.5" opacity="0.3"
        strokeDasharray={`${growth * 4.52} 452`}
        strokeLinecap="round"
        transform="rotate(-90 100 105)" />
    </svg>
  );
}

// ── Lesson node on world map ─────────────────────────────────────────────────
function LessonNode({
  lesson, unit, index, unlocked, completed,
  native, onClick,
}: {
  lesson: MultiLesson; unit: MultiLessonUnit; index: number;
  unlocked: boolean; completed: boolean; native: string;
  onClick: () => void;
}) {
  const x = 50 + Math.sin(index * 1.4) * 35;
  const y = index * 80 + 40;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring", damping: 14 }}
      className="absolute"
      style={{ left: `${x}%`, top: y, transform: "translate(-50%, 0)" }}
    >
      {/* Connector line */}
      {index > 0 && (
        <div className="absolute bottom-full left-1/2 w-0.5 h-10 -translate-x-1/2"
          style={{ background: completed ? "var(--hy-orange)" : "rgba(255,255,255,0.1)" }} />
      )}

      <button onClick={onClick} disabled={!unlocked}
        className="relative flex flex-col items-center gap-1 group"
        title={lesson.title[native] ?? lesson.title["en"]}>

        {/* Node circle */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 transition-all
          ${completed
            ? "border-yellow-400 shadow-lg"
            : unlocked
            ? "border-white/30 hover:border-white/60 hover:scale-110"
            : "border-white/10 opacity-40 cursor-not-allowed"}`}
          style={{
            background: completed
              ? `linear-gradient(135deg, ${unit.colorFrom}, ${unit.colorTo})`
              : unlocked
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.3)",
            boxShadow: completed ? `0 0 20px ${unit.colorFrom}66` : undefined,
          }}>
          {completed ? "⭐" : unlocked ? unit.emoji : "🔒"}
        </div>

        {/* Label */}
        <span className={`text-xs text-center font-medium max-w-[80px] leading-tight
          ${unlocked ? "text-white/80" : "text-white/25"}`}>
          {lesson.title[native] ?? lesson.title["en"]}
        </span>

        {/* HAYQ badge */}
        {unlocked && !completed && (
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background:"rgba(242,168,0,0.15)", color:"var(--hy-orange)", border:"1px solid rgba(242,168,0,0.25)" }}>
            🪙{lesson.hayqTotal}
          </span>
        )}
        {completed && (
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background:"rgba(74,222,128,0.15)", color:"#4ade80" }}>✓ Done</span>
        )}
      </button>
    </motion.div>
  );
}

// ── Main World Page ───────────────────────────────────────────────────────────
export default function WorldPage() {
  const router = useRouter();
  const [config, setConfig]   = useState<UserLangConfig | null>(null);
  const [rewards, setRewards] = useState<RewardState | null>(null);
  const [units, setUnits]     = useState<MultiLessonUnit[]>([]);
  const [lessons, setLessons] = useState<MultiLesson[]>([]);
  const [tab, setTab]         = useState<"home" | "journey" | "garden">("home");
  const [completedIds]        = useState<Set<string>>(new Set(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("nur_completed") ?? "[]")
      : []
  ));

  useEffect(() => {
    const cfg = loadLangConfig();
    if (!cfg) { router.push("/onboarding"); return; }
    setConfig(cfg);
    setUnits(getUnitsForPair(cfg.pair));
    setLessons(getLessonsForPair(cfg.pair));
    setRewards(loadRewards());
  }, [router]);

  if (!config || !rewards) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"var(--color-bg)" }}>
      <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:"linear" }}
        className="w-8 h-8 border-2 border-t-transparent rounded-full"
        style={{ borderColor:"var(--hy-orange)" }} />
    </div>
  );

  const native   = LANGUAGES[config.native];
  const learning = LANGUAGES[config.learning];
  const growth   = getPomGrowth(rewards.seeds);
  const worldHeight = Math.max(lessons.length * 80 + 120, 600);

  return (
    <div className="min-h-screen flex flex-col" style={{ background:"var(--color-bg)", color:"white" }}>
      <div className="h-1 flag-stripe" />

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 z-20"
        style={{ borderColor:"var(--color-border)", background:"var(--color-bg)" }}>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="NUR Lingo" width={30} height={30} className="rounded-lg" />
          <div>
            <p className="font-bold text-xs uppercase tracking-widest" style={{ color:"var(--hy-orange)" }}>NUR Lingo</p>
            <p className="text-white/30 text-[10px]">{native.flag} → {learning.flag} {learning.nativeName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1 text-sm">
            <span>🔥</span>
            <span className="font-bold">{rewards.streak}</span>
          </div>
          {/* HAYQ */}
          <div className="hayq-chip text-xs">🪙 {rewards.hayq}</div>
          {/* Seeds */}
          <div className="flex items-center gap-1 text-sm"
            style={{ color:"var(--hy-orange)" }}>
            <span>🍎</span>
            <span className="font-bold">{rewards.seeds.length}</span>
          </div>
          {/* Change lang */}
          <button onClick={() => router.push("/onboarding")}
            className="text-white/30 hover:text-white text-sm transition-colors">⚙️</button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex border-b sticky top-[57px] z-10"
        style={{ borderColor:"var(--color-border)", background:"var(--color-bg)" }}>
        {([
          { id:"home",    label:"🗺️ Journey", labelRu:"Путь",    labelHy:"Ushghman" },
          { id:"journey", label:"🏆 Achievements", labelRu:"Достижения", labelHy:"Nashatakner" },
          { id:"garden",  label:"🍎 Garden", labelRu:"Сад",    labelHy:"Aygi" },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-3 text-xs font-medium transition-all border-b-2"
            style={{
              borderColor: tab === t.id ? "var(--hy-orange)" : "transparent",
              color: tab === t.id ? "var(--hy-orange)" : "rgba(255,255,255,0.4)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* HOME — World Map */}
        {tab === "home" && (
          <div className="flex gap-0 max-w-5xl mx-auto">

            {/* Lesson path */}
            <div className="flex-1 px-4 py-6">
              {units.map(unit => {
                const unitLessons = lessons.filter(l => l.unitId === unit.id);
                return (
                  <div key={unit.id} className="mb-12">
                    {/* Unit header */}
                    <div className="flex items-center gap-3 mb-6 px-2">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                        style={{ background:`linear-gradient(135deg,${unit.colorFrom},${unit.colorTo})` }}>
                        {unit.emoji}
                      </div>
                      <div>
                        <p className="font-semibold">{unit.title[config.native] ?? unit.title["en"]}</p>
                        <p className="text-white/40 text-xs">{unit.description[config.native] ?? unit.description["en"]}</p>
                      </div>
                    </div>

                    {/* Lesson nodes */}
                    <div className="space-y-4">
                      {unitLessons.map((lesson, idx) => {
                        const prevDone = idx === 0 || completedIds.has(unitLessons[idx-1].id);
                        const unlocked = idx === 0 || prevDone;
                        const completed = completedIds.has(lesson.id);
                        return (
                          <motion.button key={lesson.id}
                            initial={{ opacity:0, x: idx % 2 === 0 ? -20 : 20 }}
                            animate={{ opacity:1, x:0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={unlocked ? { scale:1.02 } : {}}
                            whileTap={unlocked ? { scale:0.97 } : {}}
                            disabled={!unlocked}
                            onClick={() => unlocked && router.push(`/learn?lesson=${lesson.id}&pair=${config.pair}`)}
                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all
                              ${idx % 2 === 0 ? "ml-0 mr-8" : "ml-8 mr-0"}
                              ${completed ? "border-yellow-400/50" : unlocked ? "border-white/10 hover:border-white/30" : "border-white/5 opacity-40 cursor-not-allowed"}`}
                            style={{
                              background: completed
                                ? `linear-gradient(135deg,${unit.colorFrom}22,${unit.colorTo}22)`
                                : "var(--color-card)",
                              boxShadow: completed ? `0 0 16px ${unit.colorFrom}33` : undefined,
                            }}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                  style={{ background:`linear-gradient(135deg,${unit.colorFrom},${unit.colorTo})`, opacity: unlocked ? 1 : 0.5 }}>
                                  {completed ? "⭐" : unlocked ? unit.emoji : "🔒"}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{lesson.title[config.native] ?? lesson.title["en"]}</p>
                                  <p className="text-white/40 text-xs">{lesson.cefr} · {lesson.estimatedMinutes}min</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className="hayq-chip text-xs">🪙 {lesson.hayqTotal}</span>
                                {completed && <span className="text-[10px] text-green-400">✓ Complete</span>}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Nurik at bottom */}
              <div className="flex flex-col items-center py-8 gap-3">
                <Nurik mood="idle" size={80} />
                <p className="text-white/30 text-sm text-center">
                  {config.native === "hy" ? "Arlajin qayl katarum e mets ughi!" :
                   config.native === "ru" ? "Первый шаг ведёт к великому пути!" :
                   "The first step leads to a great journey!"}
                </p>
              </div>
            </div>

            {/* Pomegranate sidebar (desktop) */}
            <div className="hidden lg:flex flex-col items-center w-64 py-8 px-4 border-l sticky top-[100px] h-fit"
              style={{ borderColor:"var(--color-border)" }}>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Your Pomegranate</p>
              <div className="w-48 h-48">
                <PomWorld growth={growth} seeds={rewards.seeds.length} />
              </div>
              <p className="text-white/40 text-xs mt-3">{growth.toFixed(0)}% full</p>

              {/* Recent seeds */}
              {rewards.seeds.length > 0 && (
                <div className="mt-6 w-full">
                  <p className="text-white/30 text-xs mb-3">Recent Seeds</p>
                  <div className="space-y-2">
                    {rewards.seeds.slice(-3).reverse().map(s => (
                      <div key={s.id} className="flex items-center gap-2 text-xs">
                        <span>{s.emoji}</span>
                        <span className="text-white/60">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* JOURNEY — Achievements */}
        {tab === "journey" && (
          <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
            <h2 className="text-2xl font-light">
              {config.native === "hy" ? "Nashataknerd" :
               config.native === "ru" ? "Твои достижения" : "Your Achievements"}
            </h2>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: config.native === "ru" ? "HAYQ" : "HAYQ", value: rewards.hayq, color:"var(--hy-orange)", icon:"🪙" },
                { label: config.native === "ru" ? "Серия" : "Streak", value: rewards.streak, color:"#f97316", icon:"🔥" },
                { label: config.native === "ru" ? "Зёрна" : "Seeds", value: rewards.seeds.length, color:"#4ade80", icon:"🍎" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 text-center border"
                  style={{ background:"var(--color-card)", borderColor:"var(--color-border)" }}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="font-bold text-xl" style={{ color:s.color }}>{s.value}</div>
                  <div className="text-xs text-white/40">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Seeds collection */}
            <div>
              <p className="text-white/40 text-sm mb-3 uppercase tracking-widest">
                {config.native === "ru" ? "Коллекция зёрен" : "Seed Collection"} ({rewards.seeds.length})
              </p>
              {rewards.seeds.length === 0 ? (
                <div className="text-center py-12 text-white/20">
                  <p className="text-4xl mb-2">🌱</p>
                  <p className="text-sm">
                    {config.native === "ru" ? "Пока нет зёрен. Учись, чтобы их получить!" :
                     config.native === "hy" ? "Dеghum chunеn. Sovorel kаreli еs аvel!" :
                     "No seeds yet. Keep learning to earn them!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {rewards.seeds.map(s => (
                    <motion.div key={s.id} initial={{ scale:0 }} animate={{ scale:1 }}
                      className="rounded-2xl p-4 border"
                      style={{ background:"var(--color-card)", borderColor:s.color+"44",
                        boxShadow:`0 0 12px ${s.glowColor}` }}>
                      <div className="text-3xl mb-2">{s.emoji}</div>
                      <p className="font-bold text-sm" style={{ color:s.color }}>{s.label}</p>
                      <p className="text-white/40 text-xs">{s.description}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* GARDEN — Pomegranate + profile */}
        {tab === "garden" && (
          <div className="max-w-sm mx-auto px-4 py-8 flex flex-col items-center gap-6">
            <h2 className="text-2xl font-light self-start">
              {config.native === "hy" ? "Qo Nury" : config.native === "ru" ? "Твой Гранат" : "Your Pomegranate"}
            </h2>

            <div className="w-64 h-64">
              <PomWorld growth={growth} seeds={rewards.seeds.length} />
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color:"var(--hy-orange)" }}>{growth.toFixed(0)}%</p>
              <p className="text-white/40 text-sm">
                {config.native === "ru" ? "рост граната" : config.native === "hy" ? "nurim ashkhatum e" : "pomegranate growth"}
              </p>
            </div>

            {/* Language pair change */}
            <div className="w-full p-4 rounded-2xl border"
              style={{ background:"var(--color-card)", borderColor:"var(--color-border)" }}>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                {config.native === "ru" ? "Текущий курс" : "Current course"}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{native.flag}</span>
                  <span className="text-white/40">→</span>
                  <span className="text-3xl">{learning.flag}</span>
                </div>
                <button onClick={() => router.push("/onboarding")}
                  className="text-xs px-4 py-2 rounded-xl transition-all"
                  style={{ background:"rgba(242,168,0,0.1)", color:"var(--hy-orange)", border:"1px solid rgba(242,168,0,0.25)" }}>
                  {config.native === "ru" ? "Сменить" : "Change"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <div className="border-t" style={{ borderColor:"var(--color-border)" }}>
        <div className="flex">
          {([
            { id:"home",    icon:"🗺️", label:"Map" },
            { id:"journey", icon:"🏆", label:"Journey" },
            { id:"garden",  icon:"🍎", label:"Garden" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-4 flex flex-col items-center gap-1 transition-all"
              style={{ color: tab === t.id ? "var(--hy-orange)" : "rgba(255,255,255,0.3)" }}>
              <span className="text-xl">{t.icon}</span>
              <span className="text-[10px]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-1 flag-stripe" />
    </div>
  );
}
