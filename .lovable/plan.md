# Making Gyaan feel smooth & premium

Already done: removed the "हिंदी में भी।" line from the landing hero.

This is a large spec. To keep quality high and avoid breaking the working app, I'll build it in ordered phases. Each phase is independently shippable. Tell me if you want to reorder or drop any.

## Phase 1 — Motion & loading foundation
The building blocks everything else reuses.
- Add `framer-motion` for transitions and micro-interactions.
- Global page-transition wrapper: slide-in-from-right on forward nav, slide-out-right on back, 250–300ms. Modals fade + scale 95→100%; bottom sheets spring up / slide down.
- Reusable animated primitives: pressable button (scale 97% on press), tappable card (bg change on press), animated progress bar (0→value over 600ms ease-out), pop-in badges.
- Shimmer skeleton system (left-to-right shimmer, not a spinner) with ready-made skeletons for: dashboard (greeting, metrics, subject cards, notes list) and chapter (title, tags, summary, key points).
- "Cooking up your notes" AI generation screen: smooth progress bar + rotating messages every 3s.

## Phase 2 — Auth polish
- Landing/login shows two options only: large "Continue with Google" (official logo, white bg, subtle border) first, then "Continue with Email".
- One-tap Google via the existing Lovable auth helper; auto-route new users → onboarding, returning users → dashboard, no interstitial.
- Top progress indicator if auth > 2s (non-blocking); friendly error + retry on failure.

## Phase 3 — Onboarding polish
- Spring-animated progress bar, steps slide in from right / out on back.
- Subject cards: tap pulse; strong→green / weak→orange smooth color transition.
- Summary step: staggered fade-in (name, level, language, subjects, 100ms apart).
- "Start learning" inline spinner while saving, then smooth transition to dashboard.

## Phase 4 — Content generation UX
- Always show free section instantly; skeleton for the locked section while generating; skeleton fades out / real content fades in.
- On generation failure: show free section + "AI is preparing this chapter — check back in 2 minutes" (pulsing), no error page.
- Ensure caching: never regenerate an existing chapter (verify current cache logic).

## Phase 5 — Payment flow polish
- Unlock bottom sheet slides up; "Opening payment..." inline state; Razorpay opens on top of the chapter (no navigation away).
- Success: sheet slides down, lock overlay 400ms fade-out, content 500ms fade-in, top success toast auto-dismiss 3s.
- Failure: friendly bottom sheet with retry + WhatsApp (8553012007). Payment-verified-but-error message with WhatsApp recourse.

## Phase 6 — Profile page (new)
Reachable from bottom nav. Sections: profile (inline name edit, Google picture, class/board), study preferences (language / study style / class-board change with reset warning), subject preferences (inline strong/weak/neutral picker, live dashboard reorder), purchase history (from `unlocked_chapters`, newest first, total spent, re-open button, empty state), account (sign out confirm, delete account with typed "DELETE", privacy/terms links), notification preferences (toggles saved to backend).

## Phase 7 — Error handling & performance
- try/catch on every API call; friendly Supabase/Gemini fallbacks; offline banner with readable cached content.
- React Query stale-while-revalidate for all fetching; prefetch next chapter while reading + dashboard on app open; optimize image/icon assets.

## Phase 8 — Micro-interactions
- Streak fire pulse (3s), chapter-complete confetti (1.5s), streak bounce-up, unlock lock shake+rotate, animated progress bars, pop-in badges, smooth bottom-nav sliding indicator, logo taps do nothing.

## Notes
- Backend touches are minimal: profile updates, notification preferences (may need columns), purchase history reads — all scoped per authenticated user with RLS.
- I recommend building Phase 1 first, then confirming feel before layering the rest.

Want me to start with Phase 1, or reprioritize?
