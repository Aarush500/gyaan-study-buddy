# Gyaan v2 — Build Plan

Pricing is already changed to ₹39 and Gemini AI is wired up. Below is the rest, grouped so each phase ships something usable. Tell me which phase to start (or "go in order").

## Phase 1 — Reader experience (topic-wise) + unlock + glassmorphism
The core of what you described.
- **Topic-wise chapter reader**: each chapter splits into multiple topics. Read one topic, "Next topic" button at the end, plus a **chapter sidebar** listing all topics (responsive: drawer on mobile, fixed sidebar on desktop).
- **First topic free, rest blurred** with a transparent glassmorphism unlock card → "Unlock ₹39 (less than a samosa plate)".
- **Polished glassmorphism buttons** everywhere (frosted, soft glow) in the existing purple/orange/green theme.
- **Bookmark button** that highlights/persists (saved per user, stays highlighted across reloads — "highlights when the system is shut off").
- **Doubt button** (floating) → existing Gemini doubt chat.
- **Report button** so students can flag content errors (stored in DB, reviewable).
- Detailed, simple Gen-Z language notes with diagrams (described/illustrated), highlighted key points, and "definitely-in-exam" questions per topic.

## Phase 2 — Validity & payment unlock window
- Payment unlocks content with **exactly 1-year validity**.
- Annual cycle anchored **1st May → 30th April**; after that, validity expires and must renew.
- Show validity status + countdown in the reader/dashboard.

## Phase 3 — Smooth auth
- Rebuild login/signup for a **very smooth** experience (Email + Google, instant transitions, shared background from landing → login → dashboard, optimistic UI, no jank).

## Phase 4 — Dashboard intelligence
- **Weak subjects/topics get priority** ordering and visual emphasis.
- **Board exam countdown** (10th grade) with "boards in N days".
- **Mid-term & final-term predictions** + "focus on detailed concepts near exam" mode.
- Per-topic completion tracking.

## Phase 5 — Attendance + notifications
- **Real-time attendance** system (daily check-in, streaks, stored in DB).
- **Notification system** (in-app) after finishing each topic, for weak subjects, and exam reminders.

## Phase 6 — Advanced content
- **3D models** where useful (e.g. Science) via react-three-fiber.
- Live NCERT-change awareness note (content regenerates on reload so newest syllabus is reflected).

## Technical notes
- New DB tables (Lovable Cloud): `bookmarks`, `unlocks` (with validity dates), `reports`, `attendance`, `notifications`, `topic_progress`, plus topic-level note caching.
- Notes generation upgraded to return topic-segmented content (each topic = its own section with diagrams, key points, exam questions).
- 3D via `@react-three/fiber@^8.18` + `@react-three/drei@^9.122.0`.
- All screens fully responsive to device dimensions.

## About your GitHub repo & "other version"
I can't access external GitHub repos or your other Lovable project from here, so I can't copy code/features from `github.com/Aarush500/gyaan`. If you want specific features from there, paste the feature list or the relevant code and I'll implement them in this project.

Reply with the phase to start (recommended: Phase 1), or "go in order".
