// src/lib/audio/audio-types.ts

export type LanguageCode = "hy" | "en" | "ru";

export interface AudioEntry {
  id: string;          // dictionary word id
  audioId: string;     // numeric audio id (e.g., "000001")
  hy: string;
  en: string;
  ru: string;
}

export interface AudioOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface AudioProvider {
  readonly type: string;
  speak(text: string, lang: LanguageCode, options?: AudioOptions): Promise<void>;
  stop(): void;
  isSpeaking(): boolean;
  getVoices?(): Promise<SpeechSynthesisVoice[]>;
}

export enum AudioProviderType {
  MP3 = "mp3",
  BROWSER = "browser",
  GOOGLE = "google",
  AZURE = "azure",
  ELEVENLABS = "elevenlabs",
  OPENAI = "openai",
}