"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LANGUAGES, type LangCode, makePair,
  saveLangConfig, VALID_PAIRS,
} from "@/lib/i18n/index";

const LANG_ORDER: LangCode[] = ["hy", "en", "ru"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]     = useState<"native" | "learning">("native");
  const [native, setNative] = useState<LangCode | null>(null);

  function selectNative(code: LangCode) {
    setNative(code);
    setStep("learning");
  }

  function selectLearning(learning: LangCode) {
    if (!native) return;
    const pair = makePair(native, learning);
    saveLangConfig({ native, learning, pair });
    router.push("/world");
  }

  const availableLearning = native
    ? LANG_ORDER.filter(
        l => l !== native && VALID_PAIRS.includes(makePair(native, l))
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)", color: "white" }}>
      <div className="h-1.5 flag-stripe" />

      {/* Logo */}
      <div className="flex justify-center pt-10 pb-2">
        <Image src="/logo.png" alt="NUR Lingo" width={72} height={72} className="rounded-2xl" />
      </div>
      <p className="text-center font-bold tracking-widest text-sm uppercase mb-8" style={{ color: "var(--hy-orange)" }}>
        NUR Lingo
      </p>

      <div className="flex-1 flex flex-col items-center justify-start px-6 max-w-lg mx-auto w-full">

        <AnimatePresence mode="wait">

          {/* Step 1 — Native language */}
          {step === "native" && (
            <motion.div key="native" initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-24 }}
              className="w-full space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-light mb-1">Ո՞ր լеzun es khosоum?</h1>
                <p className="text-white/40 text-sm">What is your native language?</p>
                <p className="text-white/30 text-xs">Какой язык твой родной?</p>
              </div>

              <div className="space-y-3">
                {LANG_ORDER.map(code => {
                  const lang = LANGUAGES[code];
                  return (
                    <motion.button key={code}
                      whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                      onClick={() => selectNative(code)}
                      className="w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all"
                      style={{ background:"var(--color-card)", borderColor:"var(--color-border)" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--hy-orange)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(242,168,0,0.05)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                        (e.currentTarget as HTMLElement).style.background = "var(--color-card)";
                      }}>
                      <span className="text-4xl">{lang.flag}</span>
                      <div className="text-left">
                        <p className="font-bold text-lg">{lang.nativeName}</p>
                        <p className="text-white/40 text-sm">{lang.name}</p>
                      </div>
                      <span className="ml-auto text-white/30 text-xl">→</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Learning language */}
          {step === "learning" && native && (
            <motion.div key="learning" initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-24 }}
              className="w-full space-y-6">

              {/* Back */}
              <button onClick={() => setStep("native")}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
                ← {LANGUAGES[native].flag} {LANGUAGES[native].nativeName}
              </button>

              <div className="text-center">
                <h1 className="text-2xl font-light mb-1">
                  {native === "hy" ? "Ի՞nch lezou es uzum sovorel" :
                   native === "ru" ? "Какой язык ты хочешь учить?" :
                   "What language do you want to learn?"}
                </h1>
                <p className="text-white/40 text-sm">Choose your learning language</p>
              </div>

              <div className="space-y-3">
                {availableLearning.map(code => {
                  const lang = LANGUAGES[code];
                  return (
                    <motion.button key={code}
                      whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                      onClick={() => selectLearning(code)}
                      className="w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all"
                      style={{ background:"var(--color-card)", borderColor:"var(--color-border)" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--hy-red)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(217,0,18,0.05)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                        (e.currentTarget as HTMLElement).style.background = "var(--color-card)";
                      }}>
                      <span className="text-4xl">{lang.flag}</span>
                      <div className="text-left flex-1">
                        <p className="font-bold text-lg">{lang.nativeName}</p>
                        <p className="text-white/40 text-sm">{lang.name}</p>
                      </div>
                      {/* Pair badge */}
                      <div className="text-xs px-3 py-1 rounded-full"
                        style={{ background:"rgba(242,168,0,0.1)", color:"var(--hy-orange)", border:"1px solid rgba(242,168,0,0.25)" }}>
                        {LANGUAGES[native].flag} → {lang.flag}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Nurik encouragement */}
              <div className="text-center pt-4 text-white/30 text-sm">
                🍎 Nuri-n spаsоum e qez!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-1.5 flag-stripe" />
    </div>
  );
}
