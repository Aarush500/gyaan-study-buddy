-- 1. Paywall: only the server (service role) may create unlocks
DROP POLICY IF EXISTS "Users can insert own unlocked chapters" ON public.unlocked_chapters;
REVOKE INSERT, UPDATE, DELETE ON public.unlocked_chapters FROM authenticated;
GRANT SELECT ON public.unlocked_chapters TO authenticated;
GRANT ALL ON public.unlocked_chapters TO service_role;

-- 2. Doubt sessions: quota columns cannot be inflated by the client
DROP POLICY IF EXISTS "Users can insert own doubt sessions" ON public.doubt_sessions;
CREATE POLICY "Users can insert own doubt sessions"
ON public.doubt_sessions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND coalesce(max_doubts, 15) = 15 AND coalesce(doubts_used, 0) = 0);

DROP POLICY IF EXISTS "Users can update own doubt sessions" ON public.doubt_sessions;
CREATE POLICY "Users can update own doubt sessions"
ON public.doubt_sessions FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND coalesce(max_doubts, 15) = 15 AND coalesce(doubts_used, 0) BETWEEN 0 AND 15);

-- 3. Notifications: no arbitrary self-inserts; go through a validated function
DROP POLICY IF EXISTS "Users insert own notifications" ON public.notifications;
REVOKE INSERT ON public.notifications FROM authenticated;
GRANT ALL ON public.notifications TO service_role;

CREATE OR REPLACE FUNCTION public.create_notification(
  p_type text,
  p_title text,
  p_body text DEFAULT '',
  p_link text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_type text;
  v_link text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_type := coalesce(p_type, 'info');
  IF v_type NOT IN ('info', 'exam', 'streak', 'progress', 'validity') THEN
    v_type := 'info';
  END IF;

  v_link := coalesce(p_link, '');
  -- only same-app relative links; anything else is dropped
  IF v_link <> '' AND v_link !~ '^/[A-Za-z0-9/_%\-\.]*$' THEN
    v_link := '';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (
    auth.uid(),
    v_type,
    left(coalesce(p_title, ''), 120),
    left(coalesce(p_body, ''), 400),
    left(v_link, 200)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notification(text, text, text, text) TO authenticated;