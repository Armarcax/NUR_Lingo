"use client";
import { motion } from "framer-motion";

export type NurikMood = "happy" | "sad" | "excited" | "thinking" | "encouraging" | "surprised" | "idle";

interface NurikProps {
  mood?: NurikMood;
  size?: number;
  animate?: boolean;
  className?: string;
}

export default function Nurik({ mood = "idle", size = 120, animate = true, className = "" }: NurikProps) {

  // Eye expressions per mood
  const eyes: Record<NurikMood, { shape: string; pupils: boolean }> = {
    happy:       { shape: "arc-up",   pupils: true  },
    sad:         { shape: "arc-down", pupils: true  },
    excited:     { shape: "wide",     pupils: true  },
    thinking:    { shape: "half",     pupils: true  },
    encouraging: { shape: "arc-up",   pupils: true  },
    surprised:   { shape: "wide",     pupils: false },
    idle:        { shape: "normal",   pupils: true  },
  };

  // Mouth per mood
  const mouths: Record<NurikMood, string> = {
    happy:       "M 42 62 Q 50 72 58 62",
    sad:         "M 42 67 Q 50 59 58 67",
    excited:     "M 40 60 Q 50 76 60 60",
    thinking:    "M 44 64 Q 50 64 56 64",
    encouraging: "M 42 62 Q 50 70 58 62",
    surprised:   "M 47 60 Q 50 68 53 60",
    idle:        "M 43 63 Q 50 69 57 63",
  };

  // Body glow per mood
  const glows: Record<NurikMood, string> = {
    happy:       "rgba(242,168,0,0.5)",
    sad:         "rgba(0,51,160,0.4)",
    excited:     "rgba(217,0,18,0.6)",
    thinking:    "rgba(96,165,250,0.4)",
    encouraging: "rgba(74,222,128,0.4)",
    surprised:   "rgba(168,85,247,0.5)",
    idle:        "rgba(242,168,0,0.2)",
  };

  const eyeY = mood === "sad" ? 52 : 48;
  const bounce = mood === "excited" ? [-4, -14, -4] : mood === "sad" ? [0, 2, 0] : [0, -6, 0];
  const rotation = mood === "thinking" ? [-5, 5, -5] : mood === "surprised" ? [-3, 3, -3] : [-2, 2, -2];

  function renderEyes() {
    if (mood === "happy" || mood === "encouraging") {
      return <>
        <path d="M 40 47 Q 44 42 48 47" stroke="#1a0a00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M 52 47 Q 56 42 60 47" stroke="#1a0a00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>;
    }
    if (mood === "sad") {
      return <>
        <ellipse cx="44" cy={eyeY} rx="4" ry="4" fill="white"/>
        <ellipse cx="56" cy={eyeY} rx="4" ry="4" fill="white"/>
        <circle cx="44" cy={eyeY + 1} r="2.5" fill="#1a0a00"/>
        <circle cx="56" cy={eyeY + 1} r="2.5" fill="#1a0a00"/>
        <circle cx="43" cy={eyeY - 1} r="1" fill="white"/>
        <circle cx="55" cy={eyeY - 1} r="1" fill="white"/>
      </>;
    }
    if (mood === "surprised") {
      return <>
        <ellipse cx="44" cy={eyeY} rx="5.5" ry="5.5" fill="white" stroke="#1a0a00" strokeWidth="0.5"/>
        <ellipse cx="56" cy={eyeY} rx="5.5" ry="5.5" fill="white" stroke="#1a0a00" strokeWidth="0.5"/>
        <circle cx="44" cy={eyeY} r="3" fill="#1a0a00"/>
        <circle cx="56" cy={eyeY} r="3" fill="#1a0a00"/>
        <circle cx="43" cy={eyeY - 1} r="1.2" fill="white"/>
        <circle cx="55" cy={eyeY - 1} r="1.2" fill="white"/>
      </>;
    }
    if (mood === "thinking") {
      return <>
        <ellipse cx="44" cy={eyeY} rx="4" ry="3.5" fill="white"/>
        <ellipse cx="56" cy={eyeY} rx="4" ry="3.5" fill="white"/>
        <circle cx="45" cy={eyeY} r="2.5" fill="#1a0a00"/>
        <circle cx="57" cy={eyeY} r="2.5" fill="#1a0a00"/>
        <circle cx="44" cy={eyeY - 1} r="1" fill="white"/>
      </>;
    }
    // normal / excited / idle
    return <>
      <ellipse cx="44" cy={eyeY} rx="4" ry={mood === "excited" ? 5 : 4} fill="white"/>
      <ellipse cx="56" cy={eyeY} rx="4" ry={mood === "excited" ? 5 : 4} fill="white"/>
      <circle cx="44" cy={eyeY + 0.5} r="2.5" fill="#1a0a00"/>
      <circle cx="56" cy={eyeY + 0.5} r="2.5" fill="#1a0a00"/>
      <circle cx="43" cy={eyeY - 1} r="1" fill="white"/>
      <circle cx="55" cy={eyeY - 1} r="1" fill="white"/>
    </>;
  }

  return (
    <motion.div className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size }}
      animate={animate ? { y: bounce, rotate: rotation } : {}}
      transition={{ duration: mood === "excited" ? 0.5 : 3, repeat: Infinity, ease: "easeInOut" }}>

      {/* Mood particles */}
      {mood === "excited" && <>
        <motion.div className="absolute text-sm" style={{ top:-8, right:-4 }}
          animate={{ y:[-2,-10,-2], opacity:[0,1,0] }} transition={{ duration:1, repeat:Infinity }}>⭐</motion.div>
        <motion.div className="absolute text-xs" style={{ top:4, left:-8 }}
          animate={{ y:[-2,-8,-2], opacity:[0,1,0] }} transition={{ duration:1, repeat:Infinity, delay:0.3 }}>✨</motion.div>
        <motion.div className="absolute text-xs" style={{ bottom:8, right:-6 }}
          animate={{ y:[-2,-8,-2], opacity:[0,1,0] }} transition={{ duration:1, repeat:Infinity, delay:0.6 }}>💫</motion.div>
      </>}
      {mood === "thinking" && (
        <motion.div className="absolute text-base" style={{ top:-10, right:-4 }}
          animate={{ opacity:[0,1,0], scale:[0.5,1,0.5] }} transition={{ duration:2, repeat:Infinity }}>💭</motion.div>
      )}
      {mood === "sad" && (
        <motion.div className="absolute text-xs" style={{ top:55, left:18 }}
          animate={{ y:[0,6,0], opacity:[0,0.7,0] }} transition={{ duration:2, repeat:Infinity }}>💧</motion.div>
      )}
      {mood === "encouraging" && <>
        <motion.div className="absolute text-sm" style={{ top:-4, right:-8 }}
          animate={{ y:[-2,-8,-2], rotate:[0,20,0] }} transition={{ duration:1.5, repeat:Infinity }}>💪</motion.div>
      </>}
      {mood === "surprised" && (
        <motion.div className="absolute text-base" style={{ top:-12, left:"50%", transform:"translateX(-50%)" }}
          animate={{ scale:[0.8,1.2,0.8] }} transition={{ duration:0.8, repeat:Infinity }}>❗</motion.div>
      )}

      <svg viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
        <defs>
          <radialGradient id={`bodyGrad_${mood}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#ff3355" />
            <stop offset="100%" stopColor="#b00020" />
          </radialGradient>
          <filter id="bodyGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Glow halo */}
        <circle cx="50" cy="66" r="34"
          fill={glows[mood]}
          style={{ filter:"blur(12px)" }} />

        {/* Crown leaves */}
        <path d="M 46 21 Q 44 11 40 9 Q 44 15 50 15" fill="#2d8a4e"/>
        <path d="M 50 20 Q 50 7 50 5 Q 50 7 50 20" stroke="#2d8a4e" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        <path d="M 54 21 Q 56 11 60 9 Q 56 15 50 15" fill="#2d8a4e"/>
        <path d="M 47 17 Q 41 9 37 11 Q 42 13 47 17" fill="#3aa85e"/>
        <path d="M 53 17 Q 59 9 63 11 Q 58 13 53 17" fill="#3aa85e"/>
        {/* Crown gem */}
        <circle cx="50" cy="15" r="3.5" fill="#F2A800" opacity="0.95"/>
        <circle cx="50" cy="15" r="1.8" fill="white" opacity="0.5"/>

        {/* Body */}
        <ellipse cx="50" cy="66" rx="29" ry="31" fill={`url(#bodyGrad_${mood})`} />
        <ellipse cx="44" cy="55" rx="15" ry="17" fill="#ff2244" opacity="0.35"/>

        {/* Geometric seed pattern */}
        <g opacity="0.2">
          <polygon points="50,42 59,52 50,62 41,52" fill="white"/>
          <polygon points="35,54 43,46 43,62" fill="white"/>
          <polygon points="65,54 57,46 57,62" fill="white"/>
        </g>

        {/* HAYQ badge */}
        <rect x="35" y="72" width="30" height="13" rx="6.5" fill="rgba(242,168,0,0.9)"/>
        <text x="50" y="81.5" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#0a0a0f" fontFamily="monospace">HAYQ</text>

        {/* Eyes */}
        {renderEyes()}

        {/* Eyebrows */}
        <path
          d={mood === "sad"
            ? "M 40 43 Q 44 45 47 44"
            : mood === "surprised" || mood === "excited"
            ? "M 40 40 Q 44 38 47 40"
            : "M 40 43 Q 44 41 47 43"}
          stroke="#1a0a00" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <path
          d={mood === "sad"
            ? "M 53 44 Q 56 45 60 43"
            : mood === "surprised" || mood === "excited"
            ? "M 53 40 Q 56 38 60 40"
            : "M 53 43 Q 56 41 60 43"}
          stroke="#1a0a00" strokeWidth="1.8" strokeLinecap="round" fill="none"/>

        {/* Mouth */}
        <path d={mouths[mood]} stroke="#1a0a00" strokeWidth="2.2" strokeLinecap="round" fill="none"/>

        {/* Rosy cheeks */}
        <ellipse cx="40" cy={eyeY + 10} rx="4.5" ry="2.5" fill="#ff6b6b" opacity={mood === "sad" ? 0.2 : 0.45}/>
        <ellipse cx="60" cy={eyeY + 10} rx="4.5" ry="2.5" fill="#ff6b6b" opacity={mood === "sad" ? 0.2 : 0.45}/>

        {/* Arms */}
        <motion.path
          d={mood === "excited" || mood === "encouraging"
            ? "M 21 60 Q 12 48 17 38"
            : mood === "sad"
            ? "M 21 62 Q 18 68 20 72"
            : "M 21 60 Q 15 55 18 48"}
          stroke="#D90012" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <motion.path
          d={mood === "excited" || mood === "encouraging"
            ? "M 79 60 Q 88 48 83 38"
            : mood === "sad"
            ? "M 79 62 Q 82 68 80 72"
            : "M 79 60 Q 85 55 82 48"}
          stroke="#D90012" strokeWidth="7" strokeLinecap="round" fill="none"/>

        {/* Bottom */}
        <path d="M 29 88 Q 50 97 71 88" stroke="#900010" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
    </motion.div>
  );
}

export function NurikSpeech({ text, mood = "idle" }: { text: string; mood?: NurikMood }) {
  const colors: Record<NurikMood, { bg: string; border: string }> = {
    excited:     { bg:"rgba(217,0,18,0.15)",   border:"rgba(217,0,18,0.4)"   },
    happy:       { bg:"rgba(74,222,128,0.12)",  border:"rgba(74,222,128,0.4)" },
    encouraging: { bg:"rgba(74,222,128,0.12)",  border:"rgba(74,222,128,0.4)" },
    sad:         { bg:"rgba(0,51,160,0.15)",    border:"rgba(0,51,160,0.4)"   },
    thinking:    { bg:"rgba(96,165,250,0.12)",  border:"rgba(96,165,250,0.35)"},
    surprised:   { bg:"rgba(168,85,247,0.12)",  border:"rgba(168,85,247,0.4)" },
    idle:        { bg:"rgba(255,255,255,0.05)", border:"rgba(255,255,255,0.15)"},
  };
  const c = colors[mood];
  return (
    <div className="relative rounded-2xl border px-4 py-3 text-sm text-white/90 max-w-[180px] text-center"
      style={{ background:c.bg, borderColor:c.border }}>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b"
        style={{ background:c.bg, borderColor:c.border }} />
      {text}
    </div>
  );
}

export function getMoodFromScore(score: number, accepted: boolean): NurikMood {
  if (!accepted) return score < 0.2 ? "sad" : "sad";
  if (score >= 0.98) return "excited";
  if (score >= 0.80) return "happy";
  return "encouraging";
}
