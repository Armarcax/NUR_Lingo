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

  // Mapping moods to our PNG assets
  const getPngPath = (m: NuriMood) => {
    switch (m) {
      case "happy":
      case "celebrating":
        return "/images/nuri/nuri-happy.png";
      case "encouraging":
      case "thinking":
      case "idle":
        return "/images/nuri/nuri-encouraging.png";
      case "sad":
        return "/images/nuri/nuri-sad.png";
      default:
        return "/images/nuri/nuri-happy.png";
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

      <Image
        src={getPngPath(mood)}
        alt={`Nuri mascot - ${mood}`}
        width={size}
        height={size}
        priority={mood === "happy" || mood === "idle"}
      />
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
