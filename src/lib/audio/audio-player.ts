// src/lib/audio/audio-player.tsx
"use client";

import { useState, useEffect } from "react";
import { getAudioService } from "./audio-service";
import { LanguageCode } from "./audio-types";

interface AudioPlayerProps {
  text: string;
  lang: LanguageCode;
  audioId?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AudioPlayer({ text, lang, audioId, className = "", size = "md" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const service = getAudioService();

  useEffect(() => {
    return () => service.stop();
  }, [service]);

  const handlePlay = async () => {
    if (isPlaying) {
      service.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      await service.speak(text, lang, { id: audioId });
    } catch {
      // Silently handle – fallback already works
    } finally {
      setIsPlaying(false);
    }
  };

  const sizeClasses = {
    sm: "p-1 text-sm",
    md: "p-2 text-base",
    lg: "p-3 text-lg",
  };

  return (
    <button
      onClick={handlePlay}
      className={`${sizeClasses[size]} ${className} rounded-full transition hover:bg-white/10 disabled:opacity-50`}
      disabled={isPlaying}
      aria-label={isPlaying ? "Նվագարկվում է..." : "Լսել"}
    >
      {isPlaying ? "⏹" : "🔊"}
    </button>
  );
}