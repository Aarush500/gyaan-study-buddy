ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS strong_subjects text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false;