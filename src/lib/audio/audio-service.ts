// src/lib/audio/audio-service.ts

export interface AudioOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  id?: string;               // for MP3 caching (vocabulary id)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface AudioProvider {
  type: string;
  speak(text: string, lang: string, options?: AudioOptions): Promise<void>;
  stop(): void;
  isSpeaking(): boolean;
  getVoices?(): Promise<SpeechSynthesisVoice[]>;
}

// ─── Browser TTS Provider ──────────────────────────────────────────

export class BrowserTTSProvider implements AudioProvider {
  type = 'browser';
  private speaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  async speak(text: string, lang: string, options?: AudioOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('SpeechSynthesis not supported'));
        return;
      }
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = options?.rate ?? 0.9;
      utterance.pitch = options?.pitch ?? 1;
      utterance.volume = options?.volume ?? 1;

      // Try to find a voice for the language
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(lang));
      if (voice) utterance.voice = voice;

      this.speaking = true;
      this.currentUtterance = utterance;

      utterance.onstart = () => {
        options?.onStart?.();
      };
      utterance.onend = () => {
        this.speaking = false;
        this.currentUtterance = null;
        options?.onEnd?.();
        resolve();
      };
      utterance.onerror = (event) => {
        this.speaking = false;
        this.currentUtterance = null;
        const error = new Error(`Speech synthesis error: ${event.error}`);
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
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.speaking || (window.speechSynthesis && window.speechSynthesis.speaking);
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
      // fallback after 1 second
      setTimeout(() => resolve(window.speechSynthesis.getVoices() || []), 1000);
    });
  }
}

// ─── MP3 Cache Provider ───────────────────────────────────────────

export class MP3Provider implements AudioProvider {
  type = 'mp3';
  private audioElement: HTMLAudioElement | null = null;
  private speaking = false;

  async speak(text: string, lang: string, options?: AudioOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      // If we have an id, try to play the cached MP3
      if (!options?.id) {
        reject(new Error('No audio id provided for MP3 playback'));
        return;
      }

      const audioUrl = `/audio/${lang}/${options.id}.mp3`;
      const audio = new Audio(audioUrl);
      this.audioElement = audio;
      this.speaking = true;

      audio.onplay = () => {
        options?.onStart?.();
      };
      audio.onended = () => {
        this.speaking = false;
        this.audioElement = null;
        options?.onEnd?.();
        resolve();
      };
      audio.onerror = (err) => {
        this.speaking = false;
        this.audioElement = null;
        const error = new Error(`MP3 not found or corrupted: ${audioUrl}`);
        options?.onError?.(error);
        reject(error);
      };

      // Start playing (will error if file missing)
      audio.play().catch((err) => {
        this.speaking = false;
        this.audioElement = null;
        const error = new Error(`MP3 play error: ${err.message}`);
        options?.onError?.(error);
        reject(error);
      });
    });
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.speaking = false;
      this.audioElement = null;
    }
  }

  isSpeaking(): boolean {
    return this.speaking;
  }
}

// ─── AudioService (facade) ────────────────────────────────────────

export class AudioService {
  private providers: AudioProvider[] = [];
  private activeProvider: AudioProvider | null = null;
  private fallbackChain: string[] = ['mp3', 'browser'];

  constructor() {
    // Register providers in order of preference
    this.providers = [
      new MP3Provider(),
      new BrowserTTSProvider(),
    ];
    this.activeProvider = this.selectProvider();
  }

  private selectProvider(): AudioProvider {
    // Prefer MP3 if available, otherwise fallback to browser
    const mp3 = this.providers.find(p => p.type === 'mp3');
    const browser = this.providers.find(p => p.type === 'browser');
    // For now, always try MP3 first, if it fails the caller will catch and can retry
    // but we will handle fallback in speak method.
    return mp3 || browser || this.providers[0];
  }

  async speak(text: string, lang: string, options?: AudioOptions): Promise<void> {
    const preferred = this.providers.find(p => p.type === 'mp3');
    const fallback = this.providers.find(p => p.type === 'browser');

    // Try MP3 if id is provided
    if (options?.id && preferred) {
      try {
        await preferred.speak(text, lang, options);
        return;
      } catch (err) {
        console.warn('MP3 failed, falling back to browser TTS', err);
        // Fallback to browser
        if (fallback) {
          // Remove id option to avoid retrying MP3
          const { id, ...restOptions } = options;
          await fallback.speak(text, lang, restOptions);
          return;
        }
      }
    }

    // If no id or MP3 failed, use browser TTS
    if (fallback) {
      await fallback.speak(text, lang, options);
      return;
    }

    throw new Error('No audio provider available');
  }

  stop(): void {
    // Stop all providers
    for (const p of this.providers) {
      p.stop();
    }
  }

  isSpeaking(): boolean {
    return this.providers.some(p => p.isSpeaking());
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    const browser = this.providers.find(p => p.type === 'browser');
    if (browser && browser.getVoices) {
      return await browser.getVoices();
    }
    return [];
  }
}