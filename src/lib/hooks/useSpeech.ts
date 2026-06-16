"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useSpeech() {
  const [isSupported, setIsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const speakingRef = useRef(false);
  const pendingQueue = useRef<Array<{ text: string; lang: string; onEnd?: () => void }>>([]);

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
      console.log(`🔊 Loaded ${available.length} voices:`, available.map(v => v.lang).join(", "));
      setVoices(available);
      setVoicesLoaded(true);
      
      // Try to set default voice to Russian for Armenian
      const ruVoice = available.find(v => v.lang.startsWith("ru"));
      if (ruVoice) {
        setSelectedVoice(ruVoice.name);
        console.log(`🔊 Default voice set to: ${ruVoice.name} (${ruVoice.lang})`);
      }
      processQueue();
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    const currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices.length > 0) {
      loadVoices();
    } else {
      setTimeout(loadVoices, 500);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const processQueue = useCallback(() => {
    while (pendingQueue.current.length > 0 && !speakingRef.current) {
      const item = pendingQueue.current.shift();
      if (item) {
        speakInternal(item.text, item.lang, item.onEnd);
      }
    }
  }, []);

  const speakInternal = useCallback(
    (text: string, lang: string, onEnd?: () => void) => {
      if (!isSupported || !text) {
        if (onEnd) onEnd();
        return;
      }

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Voice selection with fallback
      let voice = null;
      if (selectedVoice) {
        voice = voices.find(v => v.name === selectedVoice);
      }
      if (!voice && lang === "hy") {
        // Fallback to Russian for Armenian
        voice = voices.find(v => v.lang.startsWith("ru"));
        if (voice) {
          console.log(`🔊 Using Russian fallback for Armenian: ${voice.name}`);
        }
      }
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith(lang));
      }
      if (voice) {
        utterance.voice = voice;
        console.log(`🔊 Using voice: ${voice.name} (${voice.lang})`);
      } else {
        console.warn(`🔊 No voice found for ${lang}, using default`);
      }

      setIsSpeaking(true);
      speakingRef.current = true;

      utterance.onend = () => {
        setIsSpeaking(false);
        speakingRef.current = false;
        if (onEnd) onEnd();
        processQueue();
      };

      utterance.onerror = (event) => {
        console.warn("Speech synthesis error:", event);
        setIsSpeaking(false);
        speakingRef.current = false;
        if (onEnd) onEnd();
        processQueue();
      };

      console.log(`🔊 Speaking: "${text}" (${lang})`);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voices, selectedVoice, processQueue]
  );

  const speak = useCallback(
    (text: string, lang: string, onEnd?: () => void) => {
      if (!isSupported) {
        console.warn("Speech synthesis not supported");
        if (onEnd) onEnd();
        return;
      }
      if (!text) {
        console.warn("Empty text, skipping speech");
        if (onEnd) onEnd();
        return;
      }

      if (!voicesLoaded) {
        console.log("🔊 Voices not loaded yet, queuing speech request");
        pendingQueue.current.push({ text, lang, onEnd });
        return;
      }

      if (speakingRef.current) {
        console.log("🔊 Already speaking, queuing next");
        pendingQueue.current.push({ text, lang, onEnd });
        return;
      }

      speakInternal(text, lang, onEnd);
    },
    [isSupported, voicesLoaded, speakInternal]
  );

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      speakingRef.current = false;
      pendingQueue.current = [];
    }
  }, []);

  return { speak, cancel, isSpeaking, isSupported, voices, voicesLoaded, selectedVoice, setSelectedVoice };
}