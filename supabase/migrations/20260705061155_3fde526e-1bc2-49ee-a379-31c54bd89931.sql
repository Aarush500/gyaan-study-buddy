DROP POLICY IF EXISTS "Users can insert own unlocked chapters" ON public.unlocked_chapters;
CREATE POLICY "Users can insert own unlocked chapters"
ON public.unlocked_chapters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND is_free = false);