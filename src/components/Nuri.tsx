"use client";
import { motion } from "framer-motion";

// ── Նուռ (Nuri) — NUR Lingo's pomegranate mascot ─────────────────────────────
// Inspired by the NUR Lingo logo — a friendly pomegranate character

interface NuriProps {
  mood?: "happy" | "thinking" | "celebrating" | "sad" | "idle";
  size?: number;
  animate?: boolean;
  className?: string;
}

export default function Nuri({
  mood = "idle",
  size = 120,
  animate = true,
  className = "",
}: NuriProps) {
  const eyeY = mood === "sad" ? 52 : 48;
  const mouthPath =
    mood === "happy"       ? "M 44 62 Q 50 70 56 62"
    : mood === "celebrating" ? "M 42 60 Q 50 72 58 60"
    : mood === "sad"         ? "M 44 66 Q 50 60 56 66"
    : mood === "thinking"    ? "M 44 64 Q 50 64 56 64"
    :                          "M 44 62 Q 50 68 56 62";

  const leftPupilX  = mood === "thinking" ? 43 : 44;
  const rightPupilX = mood === "thinking" ? 57 : 56;

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      animate={animate ? { y: [0, -8, 0], rotate: [-2, 2, -2] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size }}
    >
      {/* Sparkles */}
      {mood === "celebrating" && (
        <>
          <motion.div
            className="absolute text-base sparkle-1"
            style={{ top: -8, right: -4 }}
          >⭐</motion.div>
          <motion.div
            className="absolute text-sm sparkle-2"
            style={{ top: 4, left: -8 }}
          >✨</motion.div>
          <motion.div
            className="absolute text-xs sparkle-3"
            style={{ bottom: 8, right: -6 }}
          >💫</motion.div>
        </>
      )}

      {mood === "thinking" && (
        <motion.div
          className="absolute text-base"
          style={{ top: -10, right: -2 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >💭</motion.div>
      )}

      <svg
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
      >
        {/* Crown / top leaves */}
        <g>
          <path d="M 46 20 Q 44 10 40 8 Q 44 14 50 14" fill="#2d8a4e" />
          <path d="M 50 18 Q 50 6 50 4 Q 50 6 50 18" stroke="#2d8a4e" strokeWidth="2" strokeLinecap="round"/>
          <path d="M 54 20 Q 56 10 60 8 Q 56 14 50 14" fill="#2d8a4e"/>
          <path d="M 48 16 Q 42 8 38 10 Q 43 12 48 16" fill="#3aa85e"/>
          <path d="M 52 16 Q 58 8 62 10 Q 57 12 52 16" fill="#3aa85e"/>
          {/* Crown jewel */}
          <circle cx="50" cy="15" r="3" fill="#F2A800" opacity="0.9"/>
          <circle cx="50" cy="15" r="1.5" fill="#fff" opacity="0.6"/>
        </g>

        {/* Main body — pomegranate shape */}
        <ellipse cx="50" cy="65" rx="28" ry="30" fill="#D90012"/>

        {/* Body gradient overlay */}
        <ellipse cx="44" cy="55" rx="14" ry="16" fill="#ff2233" opacity="0.4"/>

        {/* Geometric diamond pattern (like the logo) */}
        <g opacity="0.25">
          <polygon points="50,40 58,50 50,60 42,50" fill="#fff"/>
          <polygon points="36,52 44,44 44,60" fill="#fff"/>
          <polygon points="64,52 56,44 56,60" fill="#fff"/>
          <polygon points="50,68 42,60 58,60" fill="#fff"/>
        </g>

        {/* Face bg */}
        <ellipse cx="50" cy="52" rx="17" ry="15" fill="#ff2233" opacity="0.5"/>

        {/* Eyes */}
        <ellipse cx="44" cy={eyeY} rx="4" ry="4.5" fill="white"/>
        <ellipse cx="56" cy={eyeY} rx="4" ry="4.5" fill="white"/>

        {/* Pupils */}
        <motion.circle
          cx={leftPupilX}
          cy={eyeY + 0.5}
          r="2.5"
          fill="#1a0a00"
          animate={animate ? { cx: [leftPupilX, leftPupilX + 1, leftPupilX] } : {}}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.circle
          cx={rightPupilX}
          cy={eyeY + 0.5}
          r="2.5"
          fill="#1a0a00"
          animate={animate ? { cx: [rightPupilX, rightPupilX + 1, rightPupilX] } : {}}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Eye shine */}
        <circle cx={leftPupilX - 1}  cy={eyeY - 1} r="1" fill="white"/>
        <circle cx={rightPupilX - 1} cy={eyeY - 1} r="1" fill="white"/>

        {/* Eyebrows */}
        <path
          d={mood === "sad"
            ? "M 40 43 Q 44 45 47 44"
            : mood === "thinking"
            ? "M 40 42 Q 44 40 47 42"
            : "M 40 43 Q 44 41 47 43"}
          stroke="#1a0a00" strokeWidth="1.8" strokeLinecap="round" fill="none"
        />
        <path
          d={mood === "sad"
            ? "M 53 44 Q 56 45 60 43"
            : mood === "thinking"
            ? "M 53 40 Q 56 40 60 42"
            : "M 53 43 Q 56 41 60 43"}
          stroke="#1a0a00" strokeWidth="1.8" strokeLinecap="round" fill="none"
        />

        {/* Mouth */}
        <motion.path
          d={mouthPath}
          stroke="#1a0a00" strokeWidth="2" strokeLinecap="round" fill="none"
          animate={animate && mood === "celebrating"
            ? { d: ["M 42 60 Q 50 72 58 60", "M 42 58 Q 50 74 58 58", "M 42 60 Q 50 72 58 60"] }
            : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        />

        {/* Rosy cheeks */}
        <ellipse cx="40" cy="57" rx="4" ry="2.5" fill="#ff6b6b" opacity="0.5"/>
        <ellipse cx="60" cy="57" rx="4" ry="2.5" fill="#ff6b6b" opacity="0.5"/>

        {/* Small arms */}
        <motion.path
          d="M 22 60 Q 16 55 18 48"
          stroke="#D90012" strokeWidth="6" strokeLinecap="round" fill="none"
          animate={animate && (mood === "celebrating" || mood === "happy")
            ? { d: ["M 22 60 Q 12 50 16 42", "M 22 60 Q 14 48 18 40", "M 22 60 Q 12 50 16 42"] }
            : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        <motion.path
          d="M 78 60 Q 84 55 82 48"
          stroke="#D90012" strokeWidth="6" strokeLinecap="round" fill="none"
          animate={animate && (mood === "celebrating" || mood === "happy")
            ? { d: ["M 78 60 Q 88 50 84 42", "M 78 60 Q 86 48 82 40", "M 78 60 Q 88 50 84 42"] }
            : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />

        {/* Bottom */}
        <path d="M 30 88 Q 50 96 70 88" stroke="#b00010" strokeWidth="3" strokeLinecap="round" fill="none"/>

        {/* HAYQ badge on body */}
        <rect x="36" y="70" width="28" height="12" rx="6" fill="rgba(242,168,0,0.9)"/>
        <text x="50" y="79" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#07080f" fontFamily="monospace">
          HAYQ
        </text>
      </svg>
    </motion.div>
  );
}

// ── Mood selector helper ─────────────────────────────────────────────────────
export type NuriMood = "happy" | "thinking" | "celebrating" | "sad" | "idle";

export function getMoodFromScore(score: number, accepted: boolean): NuriMood {
  if (!accepted) return "sad";
  if (score >= 0.98) return "celebrating";
  if (score >= 0.80) return "happy";
  return "happy";
}

// ── Speech bubble ────────────────────────────────────────────────────────────
export function NuriSpeech({
  text,
  mood = "idle",
}: {
  text: string;
  mood?: NuriMood;
}) {
  const colors: Record<NuriMood, string> = {
    celebrating: "border-yellow-400/50 bg-yellow-950/40",
    happy:       "border-emerald-400/50 bg-emerald-950/40",
    sad:         "border-red-400/50 bg-red-950/40",
    thinking:    "border-blue-400/50 bg-blue-950/40",
    idle:        "border-white/20 bg-white/5",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm text-white/90 relative ${colors[mood]}`}>
      <div
        className="absolute -top-2 left-8 w-3 h-3 rotate-45 border-l border-t"
        style={{ background: "inherit", borderColor: "inherit" }}
      />
      {text}
    </div>
  );
}
