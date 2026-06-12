"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Nuri, { NuriSpeech } from "@/components/Nuri";

export default function Home() {
  return (
    <main className="min-h-screen text-white">
      <div className="h-1.5 w-full flag-stripe" />

      {/* Navigation */}
      <nav className="flex items-center justify-between py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D90012] to-[#FFA500] flex items-center justify-center font-black text-xl shadow-lg">
            Ն
          </div>
          <span className="font-black tracking-tighter text-xl uppercase italic bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            NUR Lingo
          </span>
        </div>
        <Link
          href="/onboarding"
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 bg-[#D90012] text-white shadow-lg"
        >
          Սկսել →
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between pt-12 pb-8 gap-12">
        <div className="flex-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-[#D90012]/25 bg-[#D90012]/10 text-[#ff8899]"
          >
            🇦🇲 Հայկական AI Լեզվի Հարթակ
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-6xl font-light leading-tight"
          >
            Սովորիր<br />
            <span className="text-[#D90012] font-bold">Հայերեն</span><br />
            <span className="text-3xl text-white/40">the smart way.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg leading-relaxed max-w-md"
          >
            Semantic engine-ը հասկանում է <span className="text-white font-medium">իմաստ</span>,
            ոչ թե ճշգրիտ բառ։ Ազատ բառակարգ, հոմանիշ, ձևաբանություն։
          </motion.p>

          {/* Rewards Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-[#F2A800]/20 bg-[#F2A800]/5"
            >
              <span className="text-3xl">🪙</span>
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-white/30">Layer 1</p>
                <p className="font-bold text-[#F2A800]">HAYQ Points</p>
                <p className="text-white/40 text-[10px]">Daily activity tokens</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-[#D90012]/20 bg-[#D90012]/5"
            >
              <span className="text-3xl">🍎</span>
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-white/30">Layer 2</p>
                <p className="font-bold text-[#D90012]">Seeds</p>
                <p className="text-white/40 text-[10px]">Rare organic rewards</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            <Link href="/onboarding" className="btn-primary">
              Սկսել ուսուցումը →
            </Link>
            <a
              href="#demo"
              className="px-6 py-3 rounded-xl font-medium text-white/50 hover:text-white transition-colors border border-white/10"
            >
              Demo ↓
            </a>
          </motion.div>
        </div>

        {/* Mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", damping: 12 }}
          className="flex flex-col items-center gap-4"
        >
          <NuriSpeech text="Բարև! Ես Նուռն եմ 🍎 Կսովորեցնեմ հայերեն!" mood="happy" />
          <Nuri mood="happy" size={170} />
          <p className="text-white/25 text-xs">Նուռ — NUR Lingo-ի կերպար</p>
        </motion.div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-12">
        <h2 className="text-2xl font-light text-center mb-8">
          <span className="text-[#F2A800]">Semantic</span> Engine Demo
        </h2>
        <div className="rounded-3xl border border-white/10 bg-[#11111a] p-6 space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
            Translate: "I am going home"
          </p>
          {[
            { text: "Ես գնում եմ տուն", ok: true, note: "SOV — կատարյալ", hayq: "+20 HAYQ" },
            { text: "Ես տուն եմ գնում", ok: true, note: "SVO — ճիշտ", hayq: "+18 HAYQ" },
            { text: "Տուն եմ գնում", ok: true, note: "Subject dropped", hayq: "+16 HAYQ" },
            { text: "Ես տնից եմ", ok: false, note: "Սխալ հոլով", hayq: "0" },
          ].map((r) => (
            <div
              key={r.text}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                r.ok
                  ? "bg-emerald-950/25 border-emerald-800/25"
                  : "bg-red-950/25 border-red-800/25"
              }`}
            >
              <div className="flex items-center gap-3">
                <span>{r.ok ? "✅" : "❌"}</span>
                <span className="font-armenian text-sm">{r.text}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-white/30 hidden sm:block">{r.note}</span>
                {r.ok && <span className="hayq-chip text-xs">{r.hayq}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: "🧠",
              color: "#D90012",
              title: "Semantic NLP",
              desc: "5-layer validation. Հասկանում է իմաստ, ոչ ճշգրիտ տեքստ։ Ազատ բառակարգ, հոմանիշ, ձևաբանություն",
            },
            {
              icon: "🪙",
              color: "#F2A800",
              title: "HAYQ Token",
              desc: "Ճիշտ պատասխան = HAYQ։ Streak bonuses, leaderboard, level rewards։ Հայկական լեզվի ուժ",
            },
            {
              icon: "🍎",
              color: "#0033A0",
              title: "Նուռ Mascot",
              desc: "Քո հայերեն ուղեկիցը։ Celebrating հաջողության, thinking դժվար հարցի, sad սխալ պատասխանի ժամանակ",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-white/10 bg-[#11111a]"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold mb-2" style={{ color: f.color }}>
                {f.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-1.5 w-full flag-stripe" />
      <footer className="py-6 text-center text-white/20 text-xs">
        NUR Lingo · Երևան, Հայաստան 🇦🇲 · Հայկական AI Լեզվի Հարթակ
      </footer>
    </main>
  );
}