// src/lib/hooks/useAudio.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { AudioService, AudioOptions } from "@/lib/audio";

let audioServiceInstance: AudioService | null = null;

function getAudioService(): AudioService {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
}

export function useAudio() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const service = useRef(getAudioService());

  useEffect(() => {
    return () => {
      service.current.stop();
    };
  }, []);

  const speak = async (text: string, lang: string, options?: AudioOptions) => {
    setIsSpeaking(true);
    try {
      await service.current.speak(text, lang, options);
    } catch (error) {
      console.error("Audio playback error:", error);
      options?.onError?.(error as Error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stop = () => {
    service.current.stop();
    setIsSpeaking(false);
  };

  const getVoices = () => service.current.getVoices();

  return { speak, stop, isSpeaking, getVoices };
}