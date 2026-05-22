-- Update user_lesson_progress to include hayq_earned and seeds_earned
ALTER TABLE user_lesson_progress
ADD COLUMN IF NOT EXISTS hayq_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS seeds_earned INTEGER DEFAULT 0;

-- Ensure users table has seeds_total
ALTER TABLE users
ADD COLUMN IF NOT EXISTS seeds_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hayq_total INTEGER DEFAULT 0;

-- Rename XP columns to HAYQ for consistency where appropriate
-- Note: In a real production migration we might use RENAME, but for MVP sprint ADD is safer if code still uses old names.
-- However, task says "Replace XP text with HAYQ".

ALTER TABLE lessons RENAME COLUMN xp_total TO hayq_total;
ALTER TABLE exercises RENAME COLUMN xp_reward TO hayq_reward;
ALTER TABLE exercise_attempts RENAME COLUMN xp_awarded TO hayq_awarded;
