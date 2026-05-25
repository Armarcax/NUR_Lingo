"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { loadRewards } from "@/lib/rewards/seeds";
import { hayqToLevel } from "@/lib/lessons/engine";

const LEAGUES = [
  { name: "Bronze", color: "#CD7F32", icon: "🥉" },
  { name: "Silver", color: "#C0C0C0", icon: "🥈" },
  { name: "Gold", color: "#FFD700", icon: "🥇" },
  { name: "Sapphire", color: "#0F52BA", icon: "💎" },
  { name: "Ruby", color: "#E0115F", icon: "🔻" },
  { name: "Emerald", color: "#50C878", icon: "🌲" },
  { name: "Amethyst", color: "#9966CC", icon: "🔮" },
  { name: "Pearl", color: "#F0EAD6", icon: "⚪" },
  { name: "Obsidian", color: "#3B2F2F", icon: "🌑" },
  { name: "Diamond", color: "#B9F2FF", icon: "✨" },
];

export default function WorldPage() {
  const [totalHAYQ, setTotalHAYQ] = useState(0);
  const [currentLeague] = useState(LEAGUES[0]);

  useEffect(() => {
    const rewards = loadRewards();
    setTotalHAYQ(rewards.totalHAYQ);
  }, []);

  const mockLeaderboard = [
    { name: "Aram", hayq: 1250, avatar: "🦁" },
    { name: "Anahit", hayq: 1100, avatar: "👸" },
    { name: "Gevorg", hayq: 950, avatar: "⚔️" },
    { name: "Gayane", hayq: 920, avatar: "💃" },
    { name: "Tigran", hayq: 850, avatar: "👑" },
    { name: "Narek", hayq: 820, avatar: "🏔️" },
    { name: "Sona", hayq: 780, avatar: "🎻" },
    { name: "You", hayq: totalHAYQ, avatar: "🍎", isUser: true },
    { name: "Hasmik", hayq: 650, avatar: "🌸" },
    { name: "Armen", hayq: 600, avatar: "🍷" },
    { name: "Lilit", hayq: 550, avatar: "🌙" },
    { name: "Karen", hayq: 520, avatar: "♟️" },
    { name: "Mariam", hayq: 480, avatar: "💒" },
    { name: "Vardan", hayq: 450, avatar: "🐎" },
    { name: "Ani", hayq: 420, avatar: "👗" },
  ].sort((a, b) => b.hayq - a.hayq);

  return (
    <div className="min-h-screen bg-[#1a0a0a] text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{currentLeague.icon}</span>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter" style={{ color: currentLeague.color }}>
              {currentLeague.name} League
            </h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Weekly Competition</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Ends in</p>
          <p className="text-sm font-black text-[#FFA500]">4d 12h</p>
        </div>
      </div>

      {/* League Progress */}
      <div className="px-8 py-12 text-center">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex justify-between items-center px-4">
            {LEAGUES.slice(0, 5).map((l) => (
              <div key={l.name} className={`flex flex-col items-center gap-2 ${l.name === currentLeague.name ? 'opacity-100 scale-125' : 'opacity-20'}`}>
                <span className="text-xl">{l.icon}</span>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-6xl">{currentLeague.icon}</span>
            </div>
            <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Promotion Zone</p>
            <h2 className="text-2xl font-black mb-1">Top 10 players</h2>
            <p className="text-white/60 text-sm italic">Finish in the top 10 to advance to Silver!</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-6 max-w-2xl mx-auto space-y-2">
        {mockLeaderboard.map((player, i) => {
          const rank = i + 1;
          const isPromotion = rank <= 10;
          const isDemotion = rank > mockLeaderboard.length - 5;

          return (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                player.isUser
                  ? 'bg-[#D90012]/10 border-[#D90012]/40 shadow-[0_0_20px_rgba(217,0,18,0.1)]'
                  : 'bg-white/5 border-white/5'
              }`}
            >
              <div className={`w-8 font-black text-center ${
                rank === 1 ? 'text-[#FFD700]' :
                rank === 2 ? 'text-[#C0C0C0]' :
                rank === 3 ? 'text-[#CD7F32]' :
                'text-white/30'
              }`}>
                {rank}
              </div>

              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                {player.avatar}
              </div>

              <div className="flex-1">
                <p className={`font-black tracking-tight ${player.isUser ? 'text-white' : 'text-white/80'}`}>
                  {player.name}
                </p>
                {isPromotion && rank <= 10 && (
                  <p className="text-[8px] font-black uppercase text-green-400 tracking-widest">Promotion</p>
                )}
                {isDemotion && (
                  <p className="text-[8px] font-black uppercase text-red-400 tracking-widest">Demotion Zone</p>
                )}
              </div>

              <div className="text-right">
                <p className="font-black text-[#FFA500]">{player.hayq}</p>
                <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">HAYQ</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
