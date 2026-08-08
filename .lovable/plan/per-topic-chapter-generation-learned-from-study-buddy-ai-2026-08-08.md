# Per-topic chapter generation (learned from Study Buddy AI)

Adopting the page-at-a-time engine from your other project, but keeping Gyaan's own syllabus rules, 3D models, paywall and per-user caching. Nothing outside content generation and the chapter reader changes.

## What changes

### 1. Two-stage generation instead of one giant call
Today `generate-notes` writes the entire 5000-8000 word chapter in a single AI call — that is what keeps hitting the 150s timeout.

New flow:
- **Stage A — outline (fast, ~5s).** A small call returns the chapter's topic list plus the free intro material: hook, two-line summary, 8 key points, exam box. This is what loads instantly when a chapter opens, and it is also exactly what a locked chapter shows.
- **Stage B — one page per topic (~15-25s each).** When the reader opens topic N, a new `generate-chapter-page` function writes just that topic: 1000-1500 words. No call is ever long enough to time out.

Pages are fetched for the current topic and the next one is prefetched in the background while reading, so moving forward feels instant.

### 2. Richer page shape
Each topic page returns, via a structured tool-call schema:
- `intro` — one-line hook
- `body_markdown` — 1000-1500 words of real markdown (headings, bold, tables, numbered steps, block quotes) instead of a plain content string
- `key_terms` — 3-6 terms with one-line definitions
- `remember` — memory tricks / mnemonics
- `exam_tip` — the board-exam angle
- `numericals` — worked problems for Maths / Physics / Chemistry
- `svg_diagram` — a topic-specific inline SVG (`viewBox="0 0 400 280"`, `stroke="currentColor"` so it themes correctly)

The 7-part contract you already specified (Hook, Simple Definition, Full Explanation, Indian Comparison, Diagram, Exam Focus, Quick Check) stays — it is enforced per page now, where the model has room to actually deliver it.

### 3. Reader upgrades
- Markdown + LaTeX rendering: `$...$` and `$$...$$` render as real maths instead of raw dollar signs.
- Inline SVG diagram on every page, shown alongside the existing Three.js 3D model when one exists for that topic — the 3D models stay exactly as they are.
- Per-page loading uses the existing "Cooking up your notes" screen; the rest of the chapter shell (sidebar, progress, resume) stays visible while a page generates.

### 4. Caching (per-user, as you chose)
New table `chapter_pages` keyed to `user_id + class + subject + chapter + topic index + language + style`, with RLS so each student only reads their own pages. A page is generated once and never regenerated unless refreshed. Outline is cached the same way.

## What does NOT change
Dashboard, subject tiles, syllabus data, paywall/unlock flow, Razorpay, doubt chat, streaks, notifications, i18n, 3D models.

## Technical notes
- New edge functions: `generate-chapter-outline`, `generate-chapter-page`. `generate-notes` is retired once the reader is switched over.
- Model: `google/gemini-3.6-flash` through the Lovable AI Gateway with a forced tool call for a guaranteed JSON shape.
- Server-side paywall check stays: page index 0 is free, later pages require a valid unlock row.
- New deps: `react-markdown`, `remark-math`, `rehype-katex`.
- Existing `chapter_notes` cache rows are left untouched.

## Order of work
1. Table + edge functions, deployed and tested with one real chapter.
2. Reader switched to per-page loading with prefetch.
3. Markdown/LaTeX/SVG rendering polish.
