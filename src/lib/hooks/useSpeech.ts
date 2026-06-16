"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useSpeech() {
  const [isSupported, setIsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
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
      // Process any pending queued items
      processQueue();
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    // Load immediately if voices are already available
    const currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices.length > 0) {
      loadVoices();
    } else {
      // Fallback: try loading after a short delay
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
        if (voice) {
          utterance.voice = voice;
          console.log(`🔊 Using voice: ${voice.name} (${voice.lang})`);
        } else {
          console.warn(`🔊 No voice found for language ${lang}, using default`);
        }
      }

      setIsSpeaking(true);
      speakingRef.current = true;

      utterance.onend = () => {
        setIsSpeaking(false);
        speakingRef.current = false;
        if (onEnd) onEnd();
        // Process next in queue
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
    [isSupported, voices, processQueue]
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

      // If voices not loaded yet, queue the request
      if (!voicesLoaded) {
        console.log("🔊 Voices not loaded yet, queuing speech request");
        pendingQueue.current.push({ text, lang, onEnd });
        return;
      }

      // If currently speaking, queue this request
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

  return { speak, cancel, isSpeaking, isSupported, voices, voicesLoaded };
}