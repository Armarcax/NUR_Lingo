# 🍎 NUR Lingo v4

AI-native multilingual language learning platform.
Armenian · English · Russian — all 6 directions.

---

## What's New in v4

| Feature | Description |
|---------|-------------|
| 🌍 **6 Language Directions** | HY↔EN, HY↔RU, EN↔RU — full bidirectional support |
| 🍎 **Pomegranate World Map** | Living world with lesson seeds, journey path |
| 🎭 **Nurik Mascot v2** | 7 emotional states — reacts to every answer |
| 🪙 **Dual Rewards** | HAYQ Points (frequent) + Pomegranate Seeds (rare) |
| 🏆 **Journey Tab** | Achievements, seed collection, progress tracking |
| 🌱 **Garden Tab** | Pomegranate growth visualization |
| 🔀 **All Exercise Types** | Translate, Multiple Choice, Word Order |
| 🧠 **Semantic Engine** | 5-layer validation — meaning, not exact text |

---

## Language Pairs

```
Armenian (HY) → English (EN)   ✅
Armenian (HY) → Russian (RU)   ✅
English (EN)  → Armenian (HY)  ✅
English (EN)  → Russian (RU)   ✅
Russian (RU)  → Armenian (HY)  ✅
Russian (RU)  → English (EN)   ✅
```

---

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000
→ Select your native language
→ Select what you want to learn
→ Start earning HAYQ! 🪙

---

## App Flow

```
/ (root)
  ↓ (no config)
/onboarding       ← Choose native + learning language
  ↓
/world            ← Pomegranate World Map
  ├── Home tab    ← Lesson journey path
  ├── Journey tab ← Achievements + seed collection
  └── Garden tab  ← Pomegranate growth visualization
  ↓ (tap lesson)
/learn?lesson=X&pair=en-hy  ← Exercise session
  ↓ (complete)
/world            ← Back with HAYQ earned
```

---

## Reward System

**HAYQ Points** — earned every exercise
- Correct answer: +hayqReward per exercise
- Perfect lesson: bonus HAYQ

**Pomegranate Seeds** 🍎 — rare, symbolic
- First lesson: 🌱 Normal seed
- Perfect lesson: ⭐ Golden seed
- 7-day streak: 💎 Crystal seed
- Unit complete: 🎯 Golden seed
- 30-day streak: 🏆 Crystal seed
- 100 words: 📚 Crystal seed
- Polyglot: 🌍 Legendary seed

*NUR Lingo · Yerevan, Armenia 🇦🇲*
