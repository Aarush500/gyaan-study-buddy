-- Phase 4: per-topic completion tracking
CREATE TABLE IF NOT EXISTS topic_progress (
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
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own progress" ON topic_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON topic_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own progress" ON topic_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);
