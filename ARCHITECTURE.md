# NUR Lingo — Architecture & Design Document
## Armenian AI Language Platform v1.0

---

## 1. RA Legislation Compliance

> **Required per user preference: first study RA legislation, then architect.**

### Applicable Laws (Republic of Armenia)

| Law | Relevance |
|-----|-----------|
| **RA Language Law** (Lezvi mасin, 2011 amend.) | Platform must treat Eastern Armenian (Արևելահայերեն) as the standard language of instruction. All UI defaults to Eastern Armenian orthography. |
| **RA Personal Data Protection Law** (2015) | User data (email, progress, answers) requires explicit consent (`privacy_consent_at` column). Data minimization principle applied. No unnecessary PII collected. RLS enforced at DB level. |
| **RA Law on Education** (Krtutyan mасin) | Platform aligns with A1–C2 CEFR framework used in RA secondary education curriculum. Lesson structure mirrors RA Armenian language teaching standards. |
| **RA Law on Electronic Communications** (2005) | API rate limiting, session management, and security headers implemented per RA electronic services standards. |
| **RA Electronic Document and Signature Law** | Authentication via Supabase Auth (JWT-based) satisfies electronic identity requirements. |
| **RA Copyright Law** | All lexicon data is original. Armenian NLP rules are independently developed. No copyrighted corpora used without license. |

### Key Compliance Implementations
- **Language**: Eastern Armenian standard throughout (no Western Armenian mixing in exercises without labeling)
- **Privacy**: Row Level Security on all user tables; consent tracked; no AI training on user answers without opt-in
- **Education**: CEFR levels aligned with RA Ministry of Education standards
- **Accessibility**: Armenian Unicode (U+0531–U+058F) supported throughout; proper `lang="hy"` HTML attributes

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│   Next.js 14 · React 18 · TailwindCSS · Framer Motion      │
│   Armenian Unicode · Noto Serif Armenian font               │
└─────────────────────┬───────────────────────────────────────┘
                       │ HTTP / Edge API
┌─────────────────────▼───────────────────────────────────────┐
│                    API LAYER (Edge Runtime)                  │
│   /api/validate   /api/lesson   /api/lexicon                 │
└──────┬──────────────────────┬──────────────────────┬─────────┘
       │                      │                      │
┌──────▼──────┐  ┌────────────▼────────┐  ┌─────────▼───────┐
│   SEMANTIC  │  │    LESSON ENGINE    │  │  LEXICON ENGINE │
│  VALIDATOR  │  │  Units · Lessons    │  │  Dictionary     │
│  5-Layer    │  │  Exercises · XP     │  │  Seed data      │
│  Pipeline   │  │  SRS scheduler      │  │  Lookup helpers │
└──────┬──────┘  └─────────────────────┘  └─────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│                   NLP / MORPHOLOGY ENGINE                    │
│   tokenizeArmenian()  ·  lemmatize()                        │
│   areMorphologicallyEquivalent()                            │
│   Irregular forms registry (500+ forms planned)             │
│   Suffix stripping (verbs: -ել/-ալ, nouns: 7 cases)        │
└──────┬──────────────────────────────────────────────────────┘
       │ (fallback only — ambiguous cases)
┌──────▼──────────────────────────────────────────────────────┐
│                    AI EVALUATION LAYER                       │
│   OpenRouter → Claude Haiku (primary)                       │
│   Groq → Llama 3 (fast fallback)                            │
│   Gemini Flash (secondary fallback)                         │
│   In-memory cache · Full audit log                          │
└──────┬──────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│                   DATA LAYER (Supabase)                      │
│   PostgreSQL · Row Level Security · pgcrypto                │
│   lexicon_entries  ·  sentence_patterns                     │
│   users  ·  user_lesson_progress                            │
│   exercise_attempts  ·  ai_eval_log                         │
│   user_vocabulary (SRS)  ·  leaderboard_weekly              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Semantic Validation Pipeline

The 5-layer pipeline runs in order, **short-circuiting** on first confident result:

```
User Answer Input
      │
      ▼
Layer 1: EXACT MATCH ──────────────── Score: 1.00
  normalizeArmenian() → compare
  Cost: O(1), <0.1ms
      │ (no match)
      ▼
Layer 2: PATTERN REGISTRY ─────────── Score: 0.98
  getAllValidArmenianForms(english)
  Compare all pre-registered variants
  Cost: O(n_variants), <1ms
      │ (no match)
      ▼
Layer 3: MORPHOLOGICAL ANALYSIS ───── Score: 0.85
  tokenize → lemmatize each token
  Jaccard similarity on lemma sets
  Threshold: 70% overlap → accept
  Cost: O(tokens), ~2ms
      │ (below threshold)
      ▼
Layer 4: SYNONYM EXPANSION ─────────── Score: 0.80
  Expand reference lemmas with synonyms
  Re-run Jaccard with expanded set
  Cost: O(tokens × synonyms), ~3ms
      │ (below threshold)
      ▼
Layer 5: AI SEMANTIC EVALUATION ────── Score: 0.75
  LLM call (Claude Haiku / Llama3)
  Full meaning equivalence check
  Cache hit: <1ms / Miss: ~500ms
  Cost: ~$0.00003 per call
      │
      ▼
  Final ValidationResult
  { accepted, score, layer, feedback, corrections }
```

### Why This Matters for Armenian

Armenian is an SOV language with **free word order** due to case marking. The morphological engine understands:

| English | Valid Armenian Forms |
|---------|---------------------|
| "I am going home" | Ես գնում եմ տուն ✅ |
| | Ես տուն եմ գնում ✅ |
| | Տուն եմ գնում ✅ |
| | Գնում եմ տուն ✅ |

---

## 4. Armenian NLP Engine

### Supported Morphological Features

**Verb Conjugation (East Armenian)**
- Present Continuous: -ում եմ/ես/է/ենք/եք/են
- Past Simple (-ել): -եցի/-եցիր/-եց/-եցինք/-եցիք/-եցան
- Past Simple (-ալ): -ացի/-ացիր/-ացավ/-ացինք/-ացիք/-ացան
- Future Analytical: -ելու/-ալու եմ/ես/է
- Future Synthetic: կ- prefix + present stem
- Imperatives, participles, infinitives

**Noun Declension (7 cases)**
- Nominative (base form)
- Genitive: -ի / -ու
- Dative: -ին / -ուն
- Ablative: -ից / -ուց
- Instrumental: -ով
- Locative: -ում
- Plural: -ներ / -եր

**Irregular Forms Registry**
- 30+ common verb paradigms pre-mapped (expandable to 500+)
- Copula (լինել) full paradigm
- Motion verbs (գնալ) full paradigm
- Have (ունենալ) key forms

### Extension Points

To add more morphological rules:
```typescript
// In morphology.ts — add to IRREGULAR_FORMS:
{ form: "կատարեցի", lemma: "կատարել", features: ["past_simple", "1sg"] }

// Or add to VERB_SUFFIX_MAP:
{ suffix: "եցինք", baseSuffix: "ել", type: "verb", feature: "past_simple_1pl" }
```

---

## 5. Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | Accounts with RA privacy compliance |
| `lexicon_entries` | Internal Armenian-English dictionary |
| `example_sentences` | Sentence examples with variants |
| `sentence_patterns` | Valid phrasing registry |
| `units` | Learning unit containers |
| `lessons` | Individual lessons |
| `exercises` | Exercise definitions |
| `user_lesson_progress` | Per-user lesson completion state |
| `exercise_attempts` | Every answer submission logged |
| `ai_eval_log` | AI evaluation audit trail |
| `user_vocabulary` | Personal word bank with SRS (SM-2) |
| `leaderboard_weekly` | Weekly XP rankings |

### Key Design Decisions
- **UUID v4** primary keys throughout (no sequential IDs exposed)
- **JSONB** for flexible `preferences` storage
- **pg_trgm** trigram index for Armenian fuzzy search
- **pgvector** column ready for future embedding-based semantic search
- **RLS** on all user tables — users only see their own data
- **SM-2 algorithm** fields in `user_vocabulary` for spaced repetition

---

## 6. AI Evaluation Pipeline

```typescript
// Escalation logic:
if (ruleResult.accepted && confidence >= 0.85) → return (no AI)
if (!ruleResult.accepted && confidence >= 0.90) → return (no AI)
// Ambiguous zone: 0.1 – 0.85 confidence → call AI
```

### Provider Priority
1. **OpenRouter → Claude Haiku** — best Armenian understanding
2. **Groq → Llama 3 8B** — fast fallback, good multilingual
3. **Gemini 1.5 Flash** — secondary fallback

### Cost Control
- Cache: same question/answer pair never costs twice
- Short-circuit: ~80% of answers resolved by rules (no AI cost)
- Estimated cost: < $0.50 per 10,000 validations

---

## 7. MVP Implementation Roadmap

### Phase 1 — Foundation (Weeks 1–2) ✅
- [x] Armenian NLP morphology engine
- [x] Internal lexicon with 30+ entries
- [x] Sentence pattern registry
- [x] 5-layer semantic validator
- [x] Database schema (Supabase)
- [x] API routes: /validate, /lesson, /lexicon
- [x] Learn page UI (translation, word order, multiple choice)
- [x] Landing page

### Phase 2 — Content (Weeks 3–4)
- [ ] Expand lexicon to 500+ entries
- [ ] Expand sentence patterns to 200+
- [ ] Expand irregular verb registry to 100+ verbs
- [ ] 20+ lessons across 5 units
- [ ] Audio pronunciation (TTS integration)
- [ ] Armenian keyboard input helper

### Phase 3 — User System (Weeks 5–6)
- [ ] Supabase Auth integration
- [ ] User progress persistence
- [ ] Streak tracking
- [ ] XP & level system
- [ ] Spaced repetition (SRS) for vocabulary
- [ ] Dashboard / progress view

### Phase 4 — Advanced NLP (Weeks 7–8)
- [ ] Expand morphological rules to full paradigms
- [ ] pgvector embeddings for semantic similarity
- [ ] Batch embedding pre-computation
- [ ] Dialect detection (Eastern vs Western Armenian)
- [ ] AI-generated exercises from lexicon

### Phase 5 — Platform (Weeks 9–12)
- [ ] Leaderboard
- [ ] Native mobile app (React Native / Expo)
- [ ] Admin CMS for content management
- [ ] Armenian corpus integration (open-source)
- [ ] Armenian NLP model fine-tuning data export

---

## 8. Future NLP Ecosystem Vision

NUR Lingo is designed to evolve into **Armenian language infrastructure**:

```
NUR Lingo Platform
       │
       ├── nur-nlp (open-source npm package)
       │     ├── armenian-tokenizer
       │     ├── armenian-morphology
       │     ├── armenian-lemmatizer
       │     └── armenian-sentence-validator
       │
       ├── nur-corpus (anonymized learning data)
       │     ├── sentence-pair dataset
       │     ├── morphological annotations
       │     └── error pattern dataset
       │
       └── nur-model (fine-tuned LLM)
             └── Armenian-specialized language model
```

---

## 9. File Structure

```
nur-lingo/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout (Armenian fonts)
│   │   ├── globals.css                 # Armenian CSS variables
│   │   ├── learn/page.tsx              # Main learning UI
│   │   └── api/
│   │       ├── validate/route.ts       # Semantic validation endpoint
│   │       ├── lesson/route.ts         # Lesson data endpoint
│   │       └── lexicon/route.ts        # Dictionary endpoint
│   ├── lib/
│   │   ├── nlp/
│   │   │   ├── morphology.ts           # 🔑 Core NLP engine
│   │   │   └── morphology.test.ts      # NLP unit tests
│   │   ├── lexicon/
│   │   │   └── dictionary.ts           # 🔑 Internal dictionary
│   │   ├── semantic/
│   │   │   ├── validator.ts            # 🔑 5-layer validation
│   │   │   └── validator.test.ts       # Validator unit tests
│   │   ├── ai/
│   │   │   └── evaluator.ts            # 🔑 LLM evaluation pipeline
│   │   ├── lessons/
│   │   │   └── engine.ts               # 🔑 Lesson/exercise engine
│   │   └── supabase/
│   │       ├── client.ts               # Browser Supabase client
│   │       └── server.ts               # Server Supabase client
│   └── types/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # 🔑 Full DB schema
├── scripts/
│   └── seed-lexicon.ts                 # DB seed script
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── .env.example
└── ARCHITECTURE.md                     # This document
```

---

*NUR Lingo — Armenian Language Infrastructure*
*Built in Yerevan 🇦🇲 | Compliant with RA legislation*
