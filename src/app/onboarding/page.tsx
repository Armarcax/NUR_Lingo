"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nuri, { NuriSpeech } from "@/components/Nuri";
import { Language } from "@/lib/i18n/multilingual";
import { requestNotificationPermission } from "@/lib/notifications";

export default function Onboarding() {
  const router = useRouter();
  const [source, setSource] = useState<Language>("en");
  const [target, setTarget] = useState<Language>("hy");
  const [notifications, setNotifications] = useState(false);

  const save = async () => {
    localStorage.setItem("nur_source_lang", source);
    localStorage.setItem("nur_target_lang", target);
    if (notifications) {
      await requestNotificationPermission();
    }
    router.push("/learn");
  };

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "hy", label: "Հայերեն", flag: "🇦🇲" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
  ];

  return (
    <div className="min-h-screen bg-[#1a0a0a] text-white flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-12 text-center">

        <div className="flex flex-col items-center gap-4">
          <Nuri mood="happy" size={120} />
          <NuriSpeech text="Բարև! Let's set up your learning path." mood="happy" />
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-white/40 uppercase tracking-widest text-xs font-bold mb-4">I speak</p>
            <div className="flex gap-3 justify-center">
              {languages.map(l => (
                <button key={l.code} onClick={() => setSource(l.code as Language)}
                  className={`px-6 py-3 rounded-2xl border-2 transition-all font-bold ${source === l.code ? 'border-[#D90012] bg-[#D90012]/10' : 'border-white/10 bg-white/5 opacity-50'}`}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white/40 uppercase tracking-widest text-xs font-bold mb-4">I want to learn</p>
            <div className="flex gap-3 justify-center">
              {languages.map(l => (
                <button key={l.code} onClick={() => setTarget(l.code as Language)}
                  className={`px-6 py-3 rounded-2xl border-2 transition-all font-bold ${target === l.code ? 'border-[#0033A0] bg-[#0033A0]/10' : 'border-white/10 bg-white/5 opacity-50'}`}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white/40 uppercase tracking-widest text-xs font-bold mb-4">Retention</p>
            <button onClick={() => setNotifications(!notifications)}
              className={`w-full px-6 py-4 rounded-2xl border-2 transition-all font-bold flex items-center justify-center gap-3 ${notifications ? 'border-[#FFA500] bg-[#FFA500]/10' : 'border-white/10 bg-white/5 opacity-50'}`}>
              <span className="text-xl">🔔</span>
              {notifications ? "Reminders Enabled" : "Enable Daily Reminders"}
            </button>
          </div>
        </div>

        <button onClick={save}
          className="w-full py-5 rounded-2xl bg-white text-black font-black text-xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
          Continue →
        </button>
      </motion.div>
    </div>
  );
}
