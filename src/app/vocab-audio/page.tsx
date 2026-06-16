"use client";

import { useState, useEffect, useMemo } from "react";
import BottomNav from "@/components/BottomNav";
import { CONTENT_LESSONS, type VocabItem } from "@/lib/content/database";

export default function VocabAudioPage() {
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [audioSupported, setAudioSupported] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLang, setFilterLang] = useState<"all" | "hy" | "en" | "ru">("all");

  useEffect(() => {
    const all: VocabItem[] = [];
    for (const lesson of CONTENT_LESSONS) {
      if (lesson.vocabulary) all.push(...lesson.vocabulary);
    }
    const unique = Array.from(new Map(all.map(v => [v.id, v])).values());
    setVocab(unique);
    if (typeof window !== "undefined" && !window.speechSynthesis) {
      setAudioSupported(false);
    }
  }, []);

  const filteredVocab = useMemo(() => {
    return vocab.filter(item => {
      const matchesSearch =
        item.hy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ru.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [vocab, searchQuery]);

  const speak = (text: string, lang: string, id: string) => {
    if (!audioSupported) {
      alert("Ձեր բրաուզերը չի աջակցում ձայնային արտասանությանը");
      return;
    }
    if (playing) window.speechSynthesis.cancel();
    setPlaying(id);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.onend = () => setPlaying(null);
    utterance.onerror = () => setPlaying(null);
    window.speechSynthesis.speak(utterance);
  };

  if (!audioSupported) {
    return (
      <div className="min-h-screen bg-[#1a0a0a] flex items-center justify-center p-4 pb-20">
        <div className="bg-red-900/30 p-6 rounded-xl text-center border border-red-500/30">
          <p className="text-red-300">⚠️ Ձեր բրաուզերը չի աջակցում ձայնային արտասանությանը:</p>
          <p className="text-sm mt-2 text-gray-400">Խնդրում ենք օգտագործել Chrome, Edge կամ Safari:</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0a0a] text-white pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">🔊 Բառապաշար (աուդիո)</h1>
        <p className="text-sm text-gray-400 mb-4">
          {vocab.length} բառ. հպեք 🔊 կոճակին՝ լսելու արտասանությունը
        </p>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Փնտրել բառեր..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredVocab.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Բառեր չեն գտնվել</div>
          ) : (
            filteredVocab.map(item => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-white/10 transition"
              >
                <div>
                  <div className="text-lg font-bold">{item.hy}</div>
                  <div className="text-sm text-gray-400">
                    {item.en} / {item.ru}
                  </div>
                </div>
                <button
                  onClick={() => speak(item.hy, "hy", item.id)}
                  disabled={playing === item.id}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                    playing === item.id
                      ? "bg-green-600 text-white cursor-wait"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {playing === item.id ? "🔊 ..." : "🔊 Լսել"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}