
-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Chapter notes cache (shared across authenticated users)
CREATE TABLE IF NOT EXISTS public.chapter_notes_cache (
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
GRANT SELECT ON public.chapter_notes_cache TO authenticated;
GRANT ALL ON public.chapter_notes_cache TO service_role;
ALTER TABLE public.chapter_notes_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read notes cache" ON public.chapter_notes_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can insert notes cache" ON public.chapter_notes_cache FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update notes cache" ON public.chapter_notes_cache FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- Unlocked chapters
CREATE TABLE IF NOT EXISTS public.unlocked_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  chapter_name text NOT NULL,
  class_level text NOT NULL,
  is_free boolean DEFAULT false,
  valid_from date,
  valid_until date,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subject, chapter_name, class_level)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unlocked_chapters TO authenticated;
GRANT ALL ON public.unlocked_chapters TO service_role;
ALTER TABLE public.unlocked_chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own unlocked chapters" ON public.unlocked_chapters FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unlocked chapters" ON public.unlocked_chapters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Doubt sessions
CREATE TABLE IF NOT EXISTS public.doubt_sessions (
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doubt_sessions TO authenticated;
GRANT ALL ON public.doubt_sessions TO service_role;
ALTER TABLE public.doubt_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own doubt sessions" ON public.doubt_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own doubt sessions" ON public.doubt_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own doubt sessions" ON public.doubt_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notes verifications
CREATE TABLE IF NOT EXISTS public.notes_verifications (
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes_verifications TO authenticated;
GRANT ALL ON public.notes_verifications TO service_role;
ALTER TABLE public.notes_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verifications" ON public.notes_verifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own verifications" ON public.notes_verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  chapter_name text NOT NULL,
  topic_key text NOT NULL,
  topic_title text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subject, chapter_name, topic_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks select" ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bookmarks insert" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own bookmarks delete" ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Content reports
CREATE TABLE IF NOT EXISTS public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  chapter_name text NOT NULL,
  topic_key text DEFAULT '',
  topic_title text DEFAULT '',
  reason text NOT NULL,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.content_reports TO authenticated;
GRANT ALL ON public.content_reports TO service_role;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own reports" ON public.content_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reports" ON public.content_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Topic progress
CREATE TABLE IF NOT EXISTS public.topic_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  chapter_name text NOT NULL,
  topic_key text NOT NULL,
  topic_title text DEFAULT '',
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subject, chapter_name, topic_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topic_progress TO authenticated;
GRANT ALL ON public.topic_progress TO service_role;
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own progress" ON public.topic_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.topic_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own progress" ON public.topic_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Kolkata')::date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own attendance" ON public.attendance FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text DEFAULT '',
  link text DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chapter_notes_cache_key ON public.chapter_notes_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_unlocked_chapters_user ON public.unlocked_chapters(user_id);
CREATE INDEX IF NOT EXISTS idx_doubt_sessions_user ON public.doubt_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_verifications_user ON public.notes_verifications(user_id);
