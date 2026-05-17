"use client";
import { motion } from "framer-motion";
import Image from "next/image";

// ── Նուռ (Nuri) — NUR Lingo's redesigned pomegranate mascot ──────────────────
// Uses the provided SVG designs for different emotions.

interface NuriProps {
  mood?: NuriMood;
  size?: number;
  animate?: boolean;
  className?: string;
}

export type NuriMood = "happy" | "thinking" | "celebrating" | "sad" | "idle" | "encouraging";

export default function Nuri({
  mood = "idle",
  size = 120,
  animate = true,
  className = "",
}: NuriProps) {

  // Mapping moods to our SVG assets
  const getSvgPath = (m: NuriMood) => {
    switch (m) {
      case "happy":
      case "celebrating":
        return "/src/components/nuri/nuri-happy.svg";
      case "encouraging":
      case "thinking":
      case "idle":
        return "/src/components/nuri/nuri-encouraging.svg";
      case "sad":
        return "/src/components/nuri/nuri-sad.svg";
      default:
        return "/src/components/nuri/nuri-happy.svg";
    }
  };

  // Since we are in a Next.js app, we should ideally put SVGs in /public
  // or import them. But for this task, I'll render the SVG directly
  // to ensure it works without complex asset management.

  const renderSvg = (m: NuriMood) => {
    if (m === "happy" || m === "celebrating") {
      return (
        <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="60" cy="70" rx="45" ry="40" fill="#D90012"/>
          <path d="M45 35 L55 20 L65 35 L75 20 L70 40 L50 40 Z" fill="#FFA500"/>
          <circle cx="45" cy="65" r="6" fill="#0033A0"/>
          <circle cx="60" cy="60" r="7" fill="#0033A0"/>
          <circle cx="75" cy="68" r="6" fill="#0033A0"/>
          <circle cx="52" cy="80" r="5" fill="#0033A0"/>
          <circle cx="68" cy="82" r="5" fill="#0033A0"/>
          <ellipse cx="48" cy="58" rx="5" ry="7" fill="white"/>
          <ellipse cx="72" cy="58" rx="5" ry="7" fill="white"/>
          <circle cx="48" cy="60" r="3" fill="#0033A0"/>
          <circle cx="72" cy="60" r="3" fill="#0033A0"/>
          <path d="M45 75 Q60 85 75 75" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
        </svg>
      );
    } else if (m === "sad") {
      return (
        <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="60" cy="70" rx="45" ry="40" fill="#B8000E"/>
          <path d="M45 35 L55 20 L65 35 L75 20 L70 40 L50 40 Z" fill="#E59400"/>
          <circle cx="45" cy="65" r="6" fill="#002277"/>
          <circle cx="60" cy="60" r="7" fill="#002277"/>
          <circle cx="75" cy="68" r="6" fill="#002277"/>
          <ellipse cx="48" cy="60" rx="5" ry="6" fill="white"/>
          <ellipse cx="72" cy="60" rx="5" ry="6" fill="white"/>
          <circle cx="48" cy="62" r="3" fill="#0033A0"/>
          <circle cx="72" cy="62" r="3" fill="#0033A0"/>
          <ellipse cx="44" cy="70" rx="2" ry="4" fill="#6BB6FF" opacity="0.8"/>
          <path d="M50 82 Q60 77 70 82" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
        </svg>
      );
    } else {
      // Encouraging / Thinking / Idle
      return (
        <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="60" cy="70" rx="45" ry="40" fill="#D90012"/>
          <path d="M45 35 L55 20 L65 35 L75 20 L70 40 L50 40 Z" fill="#FFA500"/>
          <circle cx="45" cy="65" r="6" fill="#0033A0"/>
          <circle cx="60" cy="60" r="7" fill="#0033A0"/>
          <circle cx="75" cy="68" r="6" fill="#0033A0"/>
          <ellipse cx="48" cy="58" rx="6" ry="5" fill="white"/>
          <ellipse cx="72" cy="58" rx="6" ry="5" fill="white"/>
          <circle cx="48" cy="59" r="3" fill="#0033A0"/>
          <circle cx="72" cy="59" r="3" fill="#0033A0"/>
          <ellipse cx="60" cy="78" rx="8" ry="4" fill="white"/>
          <ellipse cx="95" cy="75" rx="8" ry="12" fill="#FFA500" transform="rotate(20 95 75)"/>
          <circle cx="98" cy="65" r="6" fill="#FFA500"/>
        </svg>
      );
    }
  };

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      animate={animate ? {
        y: mood === "happy" ? [0, -12, 0] : [0, -5, 0],
        scale: mood === "celebrating" ? [1, 1.1, 1] : 1
      } : {}}
      transition={{ duration: mood === "happy" ? 0.6 : 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size }}
    >
      {mood === "celebrating" && (
        <>
          <motion.div className="absolute text-base sparkle-1" style={{ top: -8, right: -4 }}>⭐</motion.div>
          <motion.div className="absolute text-sm sparkle-2" style={{ top: 4, left: -8 }}>✨</motion.div>
          <motion.div className="absolute text-xs sparkle-3" style={{ bottom: 8, right: -6 }}>💫</motion.div>
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

      {renderSvg(mood)}
    </motion.div>
  );
}

export function getMoodFromScore(score: number, accepted: boolean): NuriMood {
  if (!accepted) return "encouraging";
  if (score >= 0.98) return "celebrating";
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
    encouraging: "border-orange-400/50 bg-orange-950/40",
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
