/*
  # Gyaan App Database Schema

  1. New Tables
    - `profiles` - User profile data (class, language preference, subjects)
    - `chapter_notes_cache` - Cached AI-generated chapter notes (generated once, reused)
    - `unlocked_chapters` - Tracks which chapters a user has paid for
    - `doubt_sessions` - Stores doubt chat history per chapter per user
    - `notes_verifications` - Stores notes verification results

  2. Security
    - RLS enabled on all tables
    - Users can only read/write their own data
    - Notes cache is readable by all authenticated users (shared cache)

  3. Notes
    - chapter_notes_cache uses a unique key (subject + chapter + language + class) so notes are generated once
    - doubt_sessions tracks usage count to enforce the 15-doubts-per-chapter limit
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  class_level text DEFAULT '10',
  preferred_language text DEFAULT 'English',
  study_style text DEFAULT 'concise',
  weak_subjects text[] DEFAULT '{}',
  streak_days integer DEFAULT 0,
  last_active_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Chapter notes cache (shared across all users)
CREATE TABLE IF NOT EXISTS chapter_notes_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  subject text NOT NULL,
  chapter_name text NOT NULL,
  class_level text NOT NULL,
  language text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chapter_notes_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read notes cache"
  ON chapter_notes_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert notes cache"
  ON chapter_notes_cache FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update notes cache"
  ON chapter_notes_cache FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Unlocked chapters
CREATE TABLE IF NOT EXISTS unlocked_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  chapter_name text NOT NULL,
  class_level text NOT NULL,
  is_free boolean DEFAULT false,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subject, chapter_name, class_level)
);

ALTER TABLE unlocked_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocked chapters"
  ON unlocked_chapters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unlocked chapters"
  ON unlocked_chapters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Doubt sessions
CREATE TABLE IF NOT EXISTS doubt_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  chapter_name text NOT NULL,
  class_level text NOT NULL,
  language text DEFAULT 'English',
  messages jsonb DEFAULT '[]',
  doubts_used integer DEFAULT 0,
  max_doubts integer DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subject, chapter_name, class_level)
);

ALTER TABLE doubt_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own doubt sessions"
  ON doubt_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own doubt sessions"
  ON doubt_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own doubt sessions"
  ON doubt_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notes verifications
CREATE TABLE IF NOT EXISTS notes_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  chapter_name text NOT NULL,
  class_level text NOT NULL,
  student_notes text NOT NULL,
  score integer NOT NULL,
  topics_covered text[] DEFAULT '{}',
  topics_missed text[] DEFAULT '{}',
  feedback text DEFAULT '',
  verified_at timestamptz DEFAULT now()
);

ALTER TABLE notes_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verifications"
  ON notes_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications"
  ON notes_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chapter_notes_cache_key ON chapter_notes_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_unlocked_chapters_user ON unlocked_chapters(user_id);
CREATE INDEX IF NOT EXISTS idx_doubt_sessions_user ON doubt_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_verifications_user ON notes_verifications(user_id);
