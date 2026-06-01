-- Phase 1: bookmarks, content reports, unlock validity window

-- Add validity window to unlocked_chapters (1-year, May->April cycle)
ALTER TABLE unlocked_chapters ADD COLUMN IF NOT EXISTS valid_from date;
ALTER TABLE unlocked_chapters ADD COLUMN IF NOT EXISTS valid_until date;

-- Bookmarks (per user, per topic)
CREATE TABLE IF NOT EXISTS bookmarks (
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
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bookmarks select" ON bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bookmarks insert" ON bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own bookmarks delete" ON bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Content reports (students flag errors)
CREATE TABLE IF NOT EXISTS content_reports (
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
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reports" ON content_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reports" ON content_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
