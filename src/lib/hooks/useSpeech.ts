"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useSpeech() {
  const [isSupported, setIsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const speakingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsSupported(false);
      return;
    }
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      setVoicesLoaded(true);
    };

    // Chrome-ում voices-ը բեռնվում է asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, lang: string, onEnd?: () => void): Promise<void> => {
      return new Promise((resolve) => {
        if (!isSupported || !text) {
          if (onEnd) onEnd();
          resolve();
          return;
        }

        // Cancel any ongoing speech
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to find a voice for the language
        if (voices.length > 0) {
          const voice = voices.find((v) => v.lang.startsWith(lang));
          if (voice) utterance.voice = voice;
        }

        setIsSpeaking(true);
        speakingRef.current = true;

        utterance.onend = () => {
          setIsSpeaking(false);
          speakingRef.current = false;
          if (onEnd) onEnd();
          resolve();
        };

        utterance.onerror = (event) => {
          console.warn("Speech synthesis error:", event);
          setIsSpeaking(false);
          speakingRef.current = false;
          if (onEnd) onEnd();
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [isSupported, voices]
  );

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      speakingRef.current = false;
    }
  }, []);

  return { speak, cancel, isSpeaking, isSupported, voices, voicesLoaded };
}