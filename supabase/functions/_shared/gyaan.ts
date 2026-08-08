// Shared Gyaan content rules: CORS, validation, syllabus anchoring, tone.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

export const ALLOWED_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Science",
  "English", "Hindi", "Social Science", "History", "Geography",
  "Civics", "Economics", "Political Science", "Computer Science",
  "Accountancy", "Business Studies",
];
export const ALLOWED_CLASS_LEVELS = ["9", "10", "11", "12"];
export const ALLOWED_LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Marathi"];
export const MAX_TEXT = 300;

export function isAllowed(value: string, list: string[]): boolean {
  return list.some((v) => v.toLowerCase() === String(value).toLowerCase());
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Chapters removed from a class in the 2026-27 syllabus.
const DELETED_CHAPTERS: Record<string, string[]> = { "9": ["gravitation"] };

export function findDeletedChapter(chapterName: string, classLevel: string): boolean {
  const removed = DELETED_CHAPTERS[String(classLevel)] || [];
  const name = String(chapterName).toLowerCase();
  return removed.some((r) => name.includes(r));
}

export function buildSyllabusGuidance(subject: string, classLevel: string): string {
  const subj = String(subject).toLowerCase();
  const cls = String(classLevel);
  const isMaths = subj === "mathematics" || subj === "maths" || subj === "math";
  const isScience = ["science", "physics", "chemistry", "biology"].includes(subj);
  const isSST = ["social science", "history", "geography", "civics", "political science", "economics"].includes(subj);
  const isEnglish = subj === "english";
  const isSanskrit = subj === "sanskrit";

  if (cls === "9") {
    let book = "";
    if (isMaths) {
      book = `
- SOURCE BOOK: "Ganita Manjari Part 1" (NEW NCF-2023). The OLD Class 9 Maths book is dead.
- New topics moved down into Class 9: Arithmetic Progression, Pair of Linear Equations in Two Variables, Areas Related to Circles, Geometric Progression, and Polynomials split into two chapters.
- TWO-LEVEL SYSTEM: state whether the topic is "Proficiency Level" (mandatory) or "Advanced Level" (JEE/Olympiad).`;
    } else if (isScience) {
      book = `
- SOURCE BOOK: "Exploration" (NEW NCF-2023) — integrated Physics + Chemistry + Biology + the brand new "Earth Science" branch.
- GRAVITATION has been REMOVED from Class 9 — never generate it here.
- TWO-LEVEL SYSTEM: state whether the topic is "Proficiency Level" or "Advanced Level" (NEET/JEE).`;
    } else if (isSST) {
      book = `
- SOURCE BOOK: "Understanding Society: India and Beyond" (NEW NCF-2023) — ONE integrated book of 16 themes. The old 4-book structure is dead; connect History, Geography, Civics and Economics together.
- History runs Early Human History to 1200 CE. Geography includes Plate Tectonics, Interior of the Earth, Ocean Relief, Biomes. Civics includes Justice, Authority, Elections. Economics focuses on practical financial literacy.`;
    } else if (isEnglish) {
      book = `
- SOURCE BOOK: "Kaveri" (NEW NCF-2023). Beehive and Moments are GONE.
- Writing covers Persuasive essays, Literary Analysis, Research Writing, Creative Writing.`;
    } else if (isSanskrit) {
      book = `- SOURCE BOOK: "Sharda" (NEW NCF-2023).`;
    } else {
      book = `- Use the NEW NCF-2023 Class 9 book. Never any pre-2024 Class 9 book.`;
    }
    return `
CLASS 9 SYLLABUS RULE (CRITICAL — 2026-27, NEP 2020 / NCF-SE 2023):${book}
- Mention the source book name so students can cross-check.
- All examples/contexts must be India-centric.`;
  }

  if (cls === "10") {
    return `
CLASS 10 SYLLABUS RULE (CRITICAL): Class 10 still uses the EXISTING/OLD NCERT books. Social Science remains FOUR separate subjects. Do NOT apply Class 9 NCF-2023 changes. All examples India-centric.`;
  }

  if (cls === "11") {
    return `
CLASS 11 SYLLABUS RULE (CRITICAL): Class 11 is transitioning to new books in 2026-27 and streams are flexible — do not assume a fixed stream. All examples India-centric.`;
  }

  return `
CLASS ${cls} SYLLABUS RULE: Use the existing current CBSE Class ${cls} syllabus (no NCF-2023 changes yet). All examples India-centric.`;
}

export function languageRule(language: string): string {
  return `================= LANGUAGE RULE (CRITICAL) =================
- Write EVERY user-visible value in ${language} only. JSON keys stay English.
- Supported languages: English, Hindi, Tamil, Telugu, Kannada, Marathi. Never Hinglish or any other language.
- If you must use an English technical term, explain it immediately in ${language}.`;
}

export const TONE_RULES = `================= WRITING STYLE (MOST IMPORTANT RULE) =================
- Write like a real teacher talking to ONE student, not a textbook. Use "you", "your", "listen", "remember this".
- Short punchy sentences. No passive voice. No "it is to be noted that", "aforementioned", "henceforth".
- Present tense for Science, past tense for History.
- Exactly ONE funny relatable Indian example per topic (cricket, chai, IPL, local train, mom scolding, auto meter, tiffin), then straight back to serious explanation.
- GEN-Z FLAVOUR, ~1 phrase every 2-3 paragraphs: "cooked", "that's cooking", "no cap", "lowkey", "it's giving...", "that's a W", "goated", "delulu", "sigma move". NEVER inside definitions, formulas, laws, dates or exam answers — those stay clean and exam-ready.
- Every few paragraphs drop a short encouraging line ("Most students skip this — you are not most students.").
- If something is hard, say "This sounds complicated but it's actually simple — here's why", then simplify. Never make the student feel stupid.

================= ABSOLUTELY FORBIDDEN =================
- Bullet lists as the main explanation of a concept. Explain in real paragraphs.
- One-line explanations of complex concepts, or listing topic names without explaining them.
- Copied / near-copied NCERT phrasing. Paraphrase and simplify everything.
- Generic non-Indian examples ("a ball rolling down a hill"). Every example must be specific and Indian.
- Content that stops abruptly with no exam focus or closing line.`;

export async function callGateway(
  apiKey: string,
  body: Record<string, unknown>,
  timeoutMs = 110_000,
): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error("AI gateway error", resp.status, text);
      if (resp.status === 429) throw new Error("RATE_LIMIT");
      if (resp.status === 402) throw new Error("NO_CREDITS");
      throw new Error("AI_ERROR");
    }
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments
      ?? data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error("AI_EMPTY");
    return JSON.parse(raw);
  } finally {
    clearTimeout(timer);
  }
}

export function gatewayErrorResponse(e: unknown): Response {
  const msg = e instanceof Error ? e.message : "AI_ERROR";
  if (msg === "RATE_LIMIT") return json({ error: "Too many students right now — try again in a minute." }, 429);
  if (msg === "NO_CREDITS") return json({ error: "AI credits exhausted. Please top up to keep generating notes." }, 402);
  return json({ error: "Could not generate this right now. Please try again." }, 502);
}
