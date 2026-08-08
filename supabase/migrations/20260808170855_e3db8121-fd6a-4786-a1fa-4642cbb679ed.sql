CREATE TABLE public.chapter_outlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cache_key TEXT NOT NULL,
  class_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter_name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  study_style TEXT NOT NULL DEFAULT 'detailed',
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, cache_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chapter_outlines TO authenticated;
GRANT ALL ON public.chapter_outlines TO service_role;

ALTER TABLE public.chapter_outlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own chapter outlines"
  ON public.chapter_outlines FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.chapter_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cache_key TEXT NOT NULL,
  class_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter_name TEXT NOT NULL,
  topic_index INTEGER NOT NULL,
  topic_title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  study_style TEXT NOT NULL DEFAULT 'detailed',
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, cache_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chapter_pages TO authenticated;
GRANT ALL ON public.chapter_pages TO service_role;

ALTER TABLE public.chapter_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own chapter pages"
  ON public.chapter_pages FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_chapter_pages_lookup ON public.chapter_pages (user_id, class_level, subject, chapter_name);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_chapter_outlines_updated_at BEFORE UPDATE ON public.chapter_outlines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapter_pages_updated_at BEFORE UPDATE ON public.chapter_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();