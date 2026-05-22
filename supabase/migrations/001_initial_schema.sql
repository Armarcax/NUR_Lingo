-- ═══════════════════════════════════════════════════════════════════════════
-- NUR Lingo — Database Schema (Supabase / PostgreSQL)
-- Migration: 001_initial_schema.sql
--
-- Complies with RA Personal Data Protection Law (2015)
-- and RA Electronic Communications Law requirements.
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search on Armenian

-- ─── USERS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id         UUID UNIQUE,                -- Supabase Auth user ID
  username        VARCHAR(50) UNIQUE,
  email           VARCHAR(255) UNIQUE,
  display_name    VARCHAR(100),
  avatar_url      TEXT,
  native_language VARCHAR(20) DEFAULT 'hy',   -- ISO 639-1 (hy=Armenian, en=English)
  target_language VARCHAR(20) DEFAULT 'en',
  cefr_level      VARCHAR(3) DEFAULT 'A1',    -- A1, A2, B1, B2, C1, C2
  xp_total        INTEGER DEFAULT 0,
  streak_days     INTEGER DEFAULT 0,
  streak_last_date DATE,
  preferences     JSONB DEFAULT '{}',         -- UI prefs, notification settings
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  -- RA data protection compliance: consent tracking
  privacy_consent_at  TIMESTAMPTZ,
  data_processing_ok  BOOLEAN DEFAULT FALSE,
  CONSTRAINT xp_non_negative CHECK (xp_total >= 0),
  CONSTRAINT streak_non_negative CHECK (streak_days >= 0)
);

-- ─── LEXICON ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lexicon_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word            VARCHAR(200) NOT NULL,       -- Armenian word (canonical)
  english         TEXT[] NOT NULL,             -- English translations
  synonyms        TEXT[] DEFAULT '{}',         -- Armenian synonyms
  antonyms        TEXT[] DEFAULT '{}',
  grammar_type    VARCHAR(50) NOT NULL,        -- noun, verb, adj, etc.
  difficulty      SMALLINT DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  embedding_group VARCHAR(100),                -- semantic category
  lesson_tags     TEXT[] DEFAULT '{}',
  related_forms   TEXT[] DEFAULT '{}',         -- declined/conjugated forms
  notes           TEXT,
  frequency_rank  INTEGER,
  embedding_vector VECTOR(384),               -- for future semantic search (pgvector)
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lexicon_word      ON lexicon_entries(word);
CREATE INDEX idx_lexicon_group     ON lexicon_entries(embedding_group);
CREATE INDEX idx_lexicon_grammar   ON lexicon_entries(grammar_type);
CREATE INDEX idx_lexicon_trgm      ON lexicon_entries USING GIN (word gin_trgm_ops);

-- ─── EXAMPLE SENTENCES ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS example_sentences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lexicon_id      UUID REFERENCES lexicon_entries(id) ON DELETE CASCADE,
  armenian        TEXT NOT NULL,
  english         TEXT NOT NULL,
  acceptable_variants TEXT[] DEFAULT '{}',   -- other valid Armenian forms
  level           SMALLINT DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_examples_lexicon ON example_sentences(lexicon_id);

-- ─── SENTENCE PATTERNS ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sentence_patterns (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_key         VARCHAR(100) UNIQUE NOT NULL,  -- e.g. "sp_001"
  english_template    TEXT NOT NULL,
  armenian_variants   TEXT[] NOT NULL,
  grammar_note        TEXT,
  difficulty          SMALLINT DEFAULT 1,
  lesson_tags         TEXT[] DEFAULT '{}',
  semantic_group      VARCHAR(100),
  usage_count         INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patterns_english ON sentence_patterns USING GIN (english_template gin_trgm_ops);
CREATE INDEX idx_patterns_group   ON sentence_patterns(semantic_group);

-- ─── UNITS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS units (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_key        VARCHAR(50) UNIQUE NOT NULL,
  title           VARCHAR(200) NOT NULL,
  title_armenian  VARCHAR(200),
  description     TEXT,
  cefr_level      VARCHAR(3) DEFAULT 'A1',
  icon_emoji      VARCHAR(10),
  color_class     VARCHAR(100),
  sort_order      INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LESSONS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lessons (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_key            VARCHAR(50) UNIQUE NOT NULL,
  unit_id               UUID REFERENCES units(id) ON DELETE CASCADE,
  title                 VARCHAR(200) NOT NULL,
  title_armenian        VARCHAR(200),
  description           TEXT,
  cefr_level            VARCHAR(3) DEFAULT 'A1',
  difficulty            SMALLINT DEFAULT 1,
  xp_total              INTEGER DEFAULT 0,
  estimated_minutes     INTEGER DEFAULT 10,
  grammar_focus         TEXT[] DEFAULT '{}',
  vocabulary_focus      TEXT[] DEFAULT '{}',
  prerequisite_lessons  TEXT[] DEFAULT '{}',
  sort_order            INTEGER DEFAULT 0,
  is_published          BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_unit ON lessons(unit_id);

-- ─── EXERCISES ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exercises (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_key        VARCHAR(100) UNIQUE,
  lesson_id           UUID REFERENCES lessons(id) ON DELETE CASCADE,
  type                VARCHAR(50) NOT NULL,
  prompt              TEXT NOT NULL,
  prompt_armenian     TEXT,
  target_answer       TEXT NOT NULL,
  acceptable_answers  TEXT[] DEFAULT '{}',
  hint                TEXT,
  explanation         TEXT,
  options             TEXT[],          -- for multiple choice
  words               TEXT[],          -- for word order
  difficulty          SMALLINT DEFAULT 1,
  cefr_level          VARCHAR(3) DEFAULT 'A1',
  xp_reward           INTEGER DEFAULT 5,
  time_limit          INTEGER,         -- seconds
  sort_order          INTEGER DEFAULT 0,
  is_published        BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exercises_lesson ON exercises(lesson_id);
CREATE INDEX idx_exercises_type   ON exercises(type);

-- ─── USER LESSON PROGRESS ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id       UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status          VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed
  score           NUMERIC(5,2) DEFAULT 0,            -- percentage 0-100
  xp_earned       INTEGER DEFAULT 0,
  attempts        INTEGER DEFAULT 0,
  best_score      NUMERIC(5,2) DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_progress_user   ON user_lesson_progress(user_id);
CREATE INDEX idx_progress_lesson ON user_lesson_progress(lesson_id);

-- ─── EXERCISE ATTEMPTS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exercise_attempts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id         UUID REFERENCES exercises(id) ON DELETE SET NULL,
  lesson_id           UUID REFERENCES lessons(id) ON DELETE SET NULL,
  user_answer         TEXT NOT NULL,
  expected_answer     TEXT NOT NULL,
  english_original    TEXT,
  is_accepted         BOOLEAN NOT NULL,
  score               NUMERIC(4,3),                  -- 0.000 - 1.000
  validation_layer    VARCHAR(50),                    -- which layer accepted/rejected
  ai_used             BOOLEAN DEFAULT FALSE,
  feedback            TEXT,
  xp_awarded          INTEGER DEFAULT 0,
  response_time_ms    INTEGER,                        -- user response time
  session_id          UUID,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attempts_user     ON exercise_attempts(user_id);
CREATE INDEX idx_attempts_exercise ON exercise_attempts(exercise_id);
CREATE INDEX idx_attempts_date     ON exercise_attempts(created_at DESC);

-- ─── AI EVALUATION LOG ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_eval_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id          UUID REFERENCES exercise_attempts(id) ON DELETE SET NULL,
  user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
  english_sentence    TEXT NOT NULL,
  user_answer         TEXT NOT NULL,
  expected_answer     TEXT NOT NULL,
  provider            VARCHAR(50),         -- openrouter, groq, gemini
  model               VARCHAR(100),
  ai_accepted         BOOLEAN,
  ai_score            NUMERIC(4,3),
  ai_reasoning        TEXT,
  ai_issues           TEXT[],
  ai_suggestions      TEXT[],
  was_cached          BOOLEAN DEFAULT FALSE,
  latency_ms          INTEGER,
  cost_usd            NUMERIC(10,6),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_log_user ON ai_eval_log(user_id);
CREATE INDEX idx_ai_log_date ON ai_eval_log(created_at DESC);

-- ─── USER VOCABULARY (Personal word bank) ────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_vocabulary (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  lexicon_id      UUID REFERENCES lexicon_entries(id) ON DELETE CASCADE,
  status          VARCHAR(20) DEFAULT 'learning',  -- learning, known, mastered
  correct_count   INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  next_review_at  TIMESTAMPTZ DEFAULT NOW(),       -- SRS scheduling
  easiness_factor NUMERIC(4,2) DEFAULT 2.5,        -- SM-2 algorithm
  interval_days   INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lexicon_id)
);

CREATE INDEX idx_vocab_user        ON user_vocabulary(user_id);
CREATE INDEX idx_vocab_review      ON user_vocabulary(user_id, next_review_at);

-- ─── SESSIONS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS learning_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id       UUID REFERENCES lessons(id) ON DELETE SET NULL,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  duration_seconds INTEGER,
  exercises_total INTEGER DEFAULT 0,
  exercises_correct INTEGER DEFAULT 0,
  xp_earned       INTEGER DEFAULT 0,
  device_type     VARCHAR(20)   -- web, mobile, desktop
);

-- ─── LEADERBOARD (Weekly XP) ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leaderboard_weekly (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,
  xp_earned   INTEGER DEFAULT 0,
  rank        INTEGER,
  UNIQUE(user_id, week_start)
);

CREATE INDEX idx_leaderboard_week ON leaderboard_weekly(week_start, xp_earned DESC);

-- ─── Functions & Triggers ─────────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lexicon_updated_at
  BEFORE UPDATE ON lexicon_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Streak update function
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  last_date DATE;
  today DATE := CURRENT_DATE;
BEGIN
  SELECT streak_last_date INTO last_date FROM users WHERE id = p_user_id;

  IF last_date IS NULL OR last_date < today - INTERVAL '1 day' THEN
    -- Reset or start streak
    UPDATE users SET streak_days = 1, streak_last_date = today WHERE id = p_user_id;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    -- Continue streak
    UPDATE users SET streak_days = streak_days + 1, streak_last_date = today WHERE id = p_user_id;
  END IF;
  -- If last_date = today, do nothing (already counted)
END;
$$ LANGUAGE plpgsql;

-- Add XP to user
CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_xp INTEGER;
BEGIN
  UPDATE users SET xp_total = xp_total + p_xp WHERE id = p_user_id
  RETURNING xp_total INTO new_xp;
  RETURN new_xp;
END;
$$ LANGUAGE plpgsql;

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_attempts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary        ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_eval_log            ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users
  FOR ALL USING (auth.uid() = auth_id);

CREATE POLICY progress_own_data ON user_lesson_progress
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY attempts_own_data ON exercise_attempts
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY vocab_own_data ON user_vocabulary
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY sessions_own_data ON learning_sessions
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Public read on lexicon, lessons, exercises
CREATE POLICY lexicon_public_read ON lexicon_entries FOR SELECT USING (true);
CREATE POLICY patterns_public_read ON sentence_patterns FOR SELECT USING (true);
CREATE POLICY units_public_read ON units FOR SELECT USING (is_published = true);
CREATE POLICY lessons_public_read ON lessons FOR SELECT USING (is_published = true);
CREATE POLICY exercises_public_read ON exercises FOR SELECT USING (is_published = true);

-- ─── Comments (documentation) ─────────────────────────────────────────────────

COMMENT ON TABLE users IS 'User accounts — compliant with RA Personal Data Protection Law 2015';
COMMENT ON TABLE lexicon_entries IS 'Internal Armenian-English dictionary — core NLP asset';
COMMENT ON TABLE sentence_patterns IS 'Valid Armenian sentence pattern registry with all acceptable variants';
COMMENT ON TABLE exercise_attempts IS 'Individual answer submissions with semantic validation results';
COMMENT ON TABLE ai_eval_log IS 'AI LLM evaluation audit trail for semantic answer checking';
COMMENT ON TABLE user_vocabulary IS 'Personal vocabulary tracker with SM-2 spaced repetition scheduling';
