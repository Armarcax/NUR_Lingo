// src/lib/audio/audio-service.ts

import { LanguageCode, AudioOptions, AudioProvider, AudioProviderType } from "./audio-types";
import { audioCache } from "./audio-cache";

// ─── MP3 Provider ──────────────────────────────────────────────────

class MP3Provider implements AudioProvider {
  readonly type = AudioProviderType.MP3;
  private playingId: string | null = null;
  private audioElement: HTMLAudioElement | null = null;

  async speak(text: string, lang: LanguageCode, options?: AudioOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioId = options?.id;
      if (!audioId) {
        reject(new Error("MP3 provider requires audioId"));
        return;
      }

      // Normalize audioId to 6 digits
      const paddedId = audioId.padStart(6, "0");
      const url = `/audio/${lang}/${paddedId}.mp3`;

      audioCache.getOrLoad(url)
        .then((audio) => {
          // Clone audio to allow multiple plays
          const clone = audio.cloneNode() as HTMLAudioElement;
          this.audioElement = clone;
          this.playingId = audioId;

          clone.onplay = () => options?.onStart?.();
          clone.onended = () => {
            this.playingId = null;
            this.audioElement = null;
            options?.onEnd?.();
            resolve();
          };
          clone.onerror = (err) => {
            this.playingId = null;
            this.audioElement = null;
            const error = new Error(`MP3 play error: ${url}`);
            options?.onError?.(error);
            reject(error);
          };

          clone.play().catch((err) => {
            this.playingId = null;
            this.audioElement = null;
            options?.onError?.(err);
            reject(err);
          });
        })
        .catch((err) => {
          // MP3 not found or corrupted – reject so fallback can handle
          options?.onError?.(err);
          reject(err);
        });
    });
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
      this.playingId = null;
    }
  }

  isSpeaking(): boolean {
    return this.playingId !== null || !!(this.audioElement && !this.audioElement.paused);
  }
}

// ─── Browser TTS Provider ──────────────────────────────────────────

class BrowserTTSProvider implements AudioProvider {
  readonly type = AudioProviderType.BROWSER;
  private speaking = false;
  private utterance: SpeechSynthesisUtterance | null = null;

  async speak(text: string, lang: LanguageCode, options?: AudioOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error("SpeechSynthesis not supported"));
        return;
      }

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: Record<LanguageCode, string> = { hy: "hy-AM", en: "en-US", ru: "ru-RU" };
      utterance.lang = langMap[lang] || "en-US";
      utterance.rate = options?.rate ?? 0.9;
      utterance.pitch = options?.pitch ?? 1;
      utterance.volume = options?.volume ?? 1;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(utterance.lang));
      if (voice) utterance.voice = voice;

      this.speaking = true;
      this.utterance = utterance;

      utterance.onstart = () => options?.onStart?.();
      utterance.onend = () => {
        this.speaking = false;
        this.utterance = null;
        options?.onEnd?.();
        resolve();
      };
      utterance.onerror = (event) => {
        this.speaking = false;
        this.utterance = null;
        const error = new Error(`TTS error: ${event.error}`);
        options?.onError?.(error);
        reject(error);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.speaking = false;
      this.utterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.speaking || !!(window.speechSynthesis && window.speechSynthesis.speaking);
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!window.speechSynthesis) return [];
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
      setTimeout(() => resolve(window.speechSynthesis.getVoices() || []), 1000);
    });
  }
}

// ─── Main AudioService ─────────────────────────────────────────────

export class AudioService {
  private providers: Map<AudioProviderType, AudioProvider>;
  private preferredProvider: AudioProviderType = AudioProviderType.MP3;
  private currentProvider: AudioProvider | null = null;
  private config = {
    fallbackChain: [
      AudioProviderType.MP3,
      AudioProviderType.BROWSER,
    ] as AudioProviderType[],
    logWarnings: true,
  };

  constructor() {
    this.providers = new Map([
      [AudioProviderType.MP3, new MP3Provider()],
      [AudioProviderType.BROWSER, new BrowserTTSProvider()],
    ]);
    this.currentProvider = this.providers.get(AudioProviderType.MP3) || null;
  }

  async speak(
    text: string,
    lang: LanguageCode,
    options?: AudioOptions
  ): Promise<void> {
    const audioId = options?.id;

    // Try each provider in fallback chain
    for (const providerType of this.config.fallbackChain) {
      const provider = this.providers.get(providerType);
      if (!provider) continue;

      // Skip MP3 if no audioId
      if (providerType === AudioProviderType.MP3 && !audioId) {
        continue;
      }

      try {
        await provider.speak(text, lang, options);
        this.currentProvider = provider;
        return;
      } catch (err) {
        if (this.config.logWarnings) {
          console.warn(`[Audio] ${providerType} failed, trying next:`, err);
        }
        // Continue to next provider
      }
    }

    // If all providers fail, throw a graceful error
    const error = new Error("All audio providers failed");
    options?.onError?.(error);
    throw error;
  }

  stop(): void {
    for (const provider of this.providers.values()) {
      provider.stop();
    }
  }

  isSpeaking(): boolean {
    for (const provider of this.providers.values()) {
      if (provider.isSpeaking()) return true;
    }
    return false;
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    const provider = this.providers.get(AudioProviderType.BROWSER);
    if (provider && provider.getVoices) {
      return await provider.getVoices();
    }
    return [];
  }

  // ─── Config ──────────────────────────────────────────────────────

  setPreferredProvider(type: AudioProviderType): void {
    this.preferredProvider = type;
    // Reorder fallback chain to put preferred first
    this.config.fallbackChain = [
      type,
      ...this.config.fallbackChain.filter((t) => t !== type),
    ];
  }

  setLogWarnings(enabled: boolean): void {
    this.config.logWarnings = enabled;
  }

  // ─── Convenience methods ────────────────────────────────────────

  playWord(wordId: string, lang: LanguageCode, text: string): Promise<void> {
    return this.speak(text, lang, { id: wordId });
  }

  playDialogue(text: string, lang: LanguageCode, dialogueId: string): Promise<void> {
    return this.speak(text, lang, { id: `d_${dialogueId}` });
  }
}

// Singleton instance
let instance: AudioService | null = null;

export function getAudioService(): AudioService {
  if (!instance) {
    instance = new AudioService();
  }
  return instance;
}