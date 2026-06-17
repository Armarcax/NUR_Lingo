// src/lib/hooks/useAudioRecorder.ts
"use client";

import { useState, useRef, useCallback } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Խնդրում ենք թույլատրել միկրոֆոնի հասանելիությունը:");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const saveRecording = useCallback((key: string) => {
    if (audioURL) {
      fetch(audioURL)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            const recordings = JSON.parse(localStorage.getItem("userAudioRecordings") || "{}");
            recordings[key] = base64;
            localStorage.setItem("userAudioRecordings", JSON.stringify(recordings));
            setAudioURL(null);
            alert("Ձայնագրությունը պահպանված է:");
          };
          reader.readAsDataURL(blob);
        });
    }
  }, [audioURL]);

  const getRecording = useCallback((key: string): string | null => {
    const recordings = JSON.parse(localStorage.getItem("userAudioRecordings") || "{}");
    return recordings[key] || null;
  }, []);

  const playRecording = useCallback((key: string) => {
    const base64 = getRecording(key);
    if (!base64) return;
    const audio = new Audio(base64);
    audio.play();
  }, [getRecording]);

  const deleteRecording = useCallback((key: string) => {
    const recordings = JSON.parse(localStorage.getItem("userAudioRecordings") || "{}");
    delete recordings[key];
    localStorage.setItem("userAudioRecordings", JSON.stringify(recordings));
  }, []);

  return {
    isRecording,
    audioURL,
    startRecording,
    stopRecording,
    saveRecording,
    getRecording,
    playRecording,
    deleteRecording,
  };
}