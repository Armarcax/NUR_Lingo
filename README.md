# 🇦🇲 NUR Lingo

**AI-native Armenian ↔ English language learning platform**  
Semantic understanding. Not just translation matching.

---

## What Makes NUR Lingo Different

Most language apps compare exact text. NUR Lingo understands **meaning**.

```
"I am going home" → correct Armenian answers:
  ✅ Ես գնում եմ տուն      (SOV — standard)
  ✅ Ես տուն եմ գնում      (SVO — equally valid)
  ✅ Տուն եմ գնում          (subject dropped — natural speech)
  ❌ Ես տնից եմ գնում      (wrong case — ablative ≠ directional)
```

This is powered by a 5-layer semantic validation pipeline:
1. Exact match
2. Pattern registry (pre-mapped valid variants)
3. Armenian morphological analysis (lemmatization + Jaccard)
4. Synonym expansion
5. AI semantic evaluation (Claude / Llama3 fallback)

---

## Tech Stack

- **Next.js 14** (App Router, Edge Runtime)
- **React 18** + **Framer Motion**
- **TailwindCSS** + Noto Serif Armenian font
- **Supabase** (PostgreSQL + Auth + RLS)
- **OpenRouter / Groq / Gemini** for AI evaluation

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo>
cd nur-lingo
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in your Supabase and AI API keys

# 3. Run database migrations
npx supabase db push

# 4. Seed the lexicon
npx tsx scripts/seed-lexicon.ts

# 5. Start development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Reference

### `POST /api/validate`
Validate an Armenian answer against the semantic engine.

```json
{
  "userAnswer": "Ես տուն եմ գնում",
  "expectedAnswer": "Ես գնում եմ տուն",
  "englishOriginal": "I am going home",
  "useAI": false
}
```

**Response:**
```json
{
  "accepted": true,
  "score": 0.98,
  "grade": "excellent",
  "emoji": "✅",
  "layer": "pattern_registry",
  "feedback": "Ճիշտ է։ Ճշգրիտ ձևակերպում!"
}
```

### `GET /api/lexicon?word=տուն`
Look up an Armenian word.

### `GET /api/lexicon?lemma=գնացի`
Lemmatize an Armenian word/form → get canonical root.

### `GET /api/lexicon?tokens=Ես գնում եմ տուն`
Tokenize + lemmatize an Armenian sentence.

### `GET /api/lesson?id=lesson_2`
Get lesson with full exercises.

### `GET /api/lesson?all=1`
Get all units and lessons (list view).

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system design, RA legislation compliance, NLP engine specification, and roadmap.

---

## RA Legislation

This platform complies with:
- RA Language Law (Eastern Armenian standard)
- RA Personal Data Protection Law (2015)
- RA Law on Education (CEFR alignment)
- RA Electronic Communications Law

---

## Roadmap

- [ ] 500+ lexicon entries
- [ ] Full verb paradigm coverage (100+ verbs)
- [ ] Audio/TTS integration
- [ ] Spaced repetition (SM-2)
- [ ] Mobile app (Expo)
- [ ] Open-source `nur-nlp` npm package
- [ ] Armenian NLP corpus publication

---

*NUR Lingo · Yerevan, Armenia 🇦🇲*
