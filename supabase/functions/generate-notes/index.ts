import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const ALLOWED_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Science",
  "English", "Hindi", "Social Science", "History", "Geography",
  "Civics", "Economics", "Political Science", "Computer Science",
  "Accountancy", "Business Studies",
];
const ALLOWED_CLASS_LEVELS = ["9", "10", "11", "12"];
const ALLOWED_LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Marathi"];
const MAX_TEXT = 300;

function isAllowed(value: string, list: string[]): boolean {
  return list.some((v) => v.toLowerCase() === String(value).toLowerCase());
}

// Server-side paywall enforcement: only the overview (summary + key points) is
// free. Everything else is stripped unless the user holds a valid unlock for
// this exact chapter. This can never be bypassed from the client.
function gateNotes(notes: any, isUnlocked: boolean) {
  if (isUnlocked || !notes || typeof notes !== "object") return notes;
  return {
    ...notes,
    detailedNotes: [],
    examBox: undefined,
    mcqs: [],
    commonMistakes: [],
    shortAnswerQuestions: [],
    quickRevision: [],
    locked: true,
  };
}

async function isChapterUnlocked(
  supabase: any,
  userId: string,
  subject: string,
  chapterName: string,
  classLevel: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("unlocked_chapters")
    .select("valid_until, is_free")
    .eq("user_id", userId)
    .eq("subject", subject)
    .eq("chapter_name", chapterName)
    .eq("class_level", classLevel)
    .maybeSingle();
  if (!data) return false;
  if (data.is_free) return true;
  if (!data.valid_until) return false;
  return new Date(data.valid_until).getTime() > Date.now();
}

// Chapters removed from a class in the 2026-27 syllabus. Requests for these must
// be rejected with a clear message instead of generating outdated content.
const DELETED_CHAPTERS: Record<string, string[]> = {
  "9": ["gravitation"],
};

function findDeletedChapter(chapterName: string, classLevel: string): boolean {
  const removed = DELETED_CHAPTERS[String(classLevel)] || [];
  const name = chapterName.toLowerCase();
  return removed.some((r) => name.includes(r));
}

// Anchor the AI to the CORRECT NCERT syllabus/books for the student's class and
// the 2026-27 academic year. Never mix old and new syllabus.
function buildSyllabusGuidance(subject: string, classLevel: string): string {
  const subj = subject.toLowerCase();
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
- SOURCE BOOK: "Ganita Manjari Part 1" (NEW NCF-2023). Do NOT use the OLD Class 9 Maths book — it is dead.
- New topics moved down into Class 9: Arithmetic Progression, Pair of Linear Equations in Two Variables, Areas Related to Circles, Geometric Progression (previously Class 11), and Polynomials now split into two separate chapters.
- TWO-LEVEL SYSTEM: for EVERY topic clearly state whether it is "Proficiency Level" (mandatory for all students) or "Advanced Level" (optional — JEE/Olympiad). Never omit the level.`;
    } else if (isScience) {
      book = `
- SOURCE BOOK: "Exploration" (NEW NCF-2023) — an integrated book combining Physics, Chemistry, Biology and a BRAND NEW branch "Earth Science" (natural cycles, Earth systems, radiation, environmental balance — never in Class 9 before).
- GRAVITATION has been REMOVED from Class 9 — never generate it here.
- TWO-LEVEL SYSTEM: for EVERY topic clearly state whether it is "Proficiency Level" (all students) or "Advanced Level" (NEET/JEE aspirants). Biology is expanded for early competitive prep.`;
    } else if (isSST) {
      book = `
- SOURCE BOOK: "Understanding Society: India and Beyond" (NEW NCF-2023) — ONE integrated book of 16 interconnected themes. The old 4 separate books are dead. Use an INTEGRATED thematic approach connecting History, Geography, Civics and Economics together, not 4 separate subjects.
- History runs from Early Human History up to 1200 CE (Harappan Culture, Bhakti Traditions — moved down from Class 12). Geography includes Class-11 topics: Plate Tectonics, Interior & Composition of the Earth, Ocean Relief, Biomes Distribution. Civics includes Class-11 topics: Justice, Authority, Elections. Economics focuses on PRACTICAL financial literacy — budgeting, income tax, investments, entrepreneurship — not dry theory.`;
    } else if (isEnglish) {
      book = `
- SOURCE BOOK: "Kaveri" (NEW NCF-2023), a single integrated English textbook. Beehive and Moments are GONE — never use them.
- Writing section now covers Persuasive essays, Literary Analysis, Research Writing and Creative Writing. Focus on communication skills and critical thinking, not just comprehension.`;
    } else if (isSanskrit) {
      book = `
- SOURCE BOOK: "Sharda" (NEW NCF-2023). Translation (Anuvad) removed from Writing → replaced by Dialogue and Story Completion (Samvadpurti, Kathapurti). Tatpurusha Samas added to Grammar. Ubhayapadi verbs and expanded Avyaya list included.`;
    } else {
      book = `
- Use the NEW NCF-2023 Class 9 book for this subject. Do NOT use any old (pre-2024) Class 9 book.`;
    }
    return `
CLASS 9 SYLLABUS RULE (CRITICAL — 2026-27, biggest change in 20 years under NEP 2020 / NCF-SE 2023):${book}
- Always MENTION the source book name in the notes so students can cross-check.
- All examples/contexts must be India-centric.`;
  }

  if (cls === "10") {
    return `
CLASS 10 SYLLABUS RULE (CRITICAL): Class 10 still uses the EXISTING/OLD NCERT books (new books arrive only in 2027-28). Use the standard current Class 10 syllabus. Social Science remains FOUR separate subjects (History, Geography, Political Science, Economics). Do NOT apply any Class 9 NCF-2023 changes here. All examples India-centric.`;
  }

  if (cls === "11") {
    return `
CLASS 11 SYLLABUS RULE (CRITICAL): Class 11 is transitioning to new books in 2026-27, and the rigid Science/Commerce/Arts stream system is being broken — students can mix subjects across streams. Do NOT assume a fixed stream. Cover the full chapter in maximum detail. All examples India-centric.`;
  }

  return `
CLASS ${cls} SYLLABUS RULE: Use the existing current CBSE Class ${cls} syllabus (no NCF-2023 changes yet). Cover the full chapter in maximum detail. All examples India-centric.`;
}

function buildPrompt(subject: string, chapterName: string, classLevel: string, language: string, studyStyle: string): string {
  return `You are the coolest, most experienced CBSE teacher in India — 20 years of teaching, you know EXACTLY what comes in the exam. You are sitting right next to one student, explaining this chapter from scratch. Write notes for:

Subject: ${subject}
Chapter: ${chapterName}
Class: ${classLevel}
Language: ${language}
Study Style: ${studyStyle}
${buildSyllabusGuidance(subject, classLevel)}

================= LANGUAGE RULE (CRITICAL) =================
- The chosen language is ${language}. EVERY user-visible JSON value must be written in ${language} only.
- Keep the JSON keys exactly in English as shown, but translate/write all titles, summaries, notes, questions, answers, MCQs, mistakes, exam tips, diagram descriptions and memory tricks in ${language}.
- Do not mix English unless the chosen language is English, or unless a technical NCERT term is normally written in English. If you use an English technical term in another language, explain it immediately in ${language}.
- Supported languages are exactly: English, Hindi, Tamil, Telugu, Kannada, Marathi. Never output Bengali, Hinglish, or any other language unless the selected language is English and the student-facing tone needs normal Indian English.

================= WRITING STYLE (FOLLOW EXACTLY — THIS IS THE MOST IMPORTANT RULE) =================
- Write like a real teacher talking, NOT a textbook or PDF. Talk directly to the student: "you", "your", "remember this", "listen carefully".
- Use SIMPLE student-friendly ${language}. Short, clear, punchy sentences. No passive voice. No "it is to be noted that", "aforementioned", "henceforth", "whereby".
- Use PRESENT tense for Science chapters, PAST tense for History.
- FUNNY EXAMPLES BUT IN LIMIT: exactly ONE funny relatable Indian example per major topic (cricket, chai, Bollywood, school life, mom scolding, auto rickshaw, samosa, IPL, street food, neighbourhood uncle), then back to serious explanation. Do not overdo jokes.
- End every major topic with one encouraging line ("You've got this", "That wasn't so bad right?", "One topic down — you're already ahead of half your class").
- If something is complex, say "This sounds complicated but it's actually simple — here's why" and then simplify. Never make the student feel stupid.
- GEN-Z FLAVOUR (use it, don't overdo it): sprinkle current Indian Gen-Z slang naturally — "cooked" / "we're cooked", "that's cooking", "bro", "no cap", "lowkey", "highkey", "fr", "it's giving...", "main character energy", "rent free", "understood the assignment", "sigma move", "W" and "L" (as in "that's a W"), "vibe check", "goated", "delulu", "aura", "op". Roughly ONE slang phrase every 2-3 paragraphs — enough to sound like a cool older sibling, never so much that the concept gets lost.
- Use slang for reactions and hooks, NEVER for definitions, formulas, laws, dates or exam answers — those stay clean, correct and exam-ready. Example: "Newton basically said an object is too lazy to change what it's doing — inertia is literally main character laziness. Formally: a body continues in its state of rest or uniform motion unless acted upon by an external unbalanced force."
- Good uses: "if you skip this derivation you're cooked in the board exam", "this reaction is straight up cooking", "examiners love this — free marks, that's a W", "students lowkey always mess this up".
- When the language is not English, keep the tone equally young and playful in that language; use at most 1-2 of these English slang words per section since students say them in every language anyway.

================= COVERAGE =================
- Base everything strictly on the LATEST NCERT textbook for Class ${classLevel} ${subject}. Cover the FULL chapter, nothing skipped.
- GO DEEP. Make it genuinely EXHAUSTIVE — a full study companion the student needs no other book for. Each detailedNotes section must be VERY long (at least 5-7 rich paragraphs), self-contained, and elaborate.
- Do NOT summarize or shorten. Expand every concept with definitions, causes, step-by-step processes, real numbers/dates/names, multiple worked examples, edge cases, and comparisons. Where a topic has sub-topics, explain EACH sub-topic in full — never merge them into one line.
- Prefer thoroughness over brevity everywhere. If in doubt, write MORE, not less.

================= LENGTH, DEPTH & ANTI-BORING (CRITICAL) =================
- HARD MINIMUM: 5000 words of actual flowing explanation across detailedNotes (headings, question lists and labels do NOT count). TARGET 7000-8000 words. Anything under 5000 words is a FAILED generation.
- Each detailedNotes section = 800-1000+ words of real explanation. Never fewer than 400 words for any topic. Cover every topic fully — no "refer to textbook".

================= THE 7-PART TOPIC CONTRACT (ABSOLUTELY MANDATORY) =================
Every single detailedNotes section's "content" must contain ALL 7 parts, in this order, and must be written as flowing paragraphs (not lists):
  1) HOOK (3-5 lines): a real-life scenario, surprising fact or question. NEVER start with a definition or "In this topic we will learn".
  2) SIMPLE DEFINITION (2-3 lines) written for a 13-year-old, then immediately the technical NCERT definition on a new line prefixed "📘 EXAM DEFINITION: ".
  3) FULL EXPLANATION (minimum 400 words, target 600-900): what it is, how it was discovered, why it works, what would happen without it, its significance, its India connection. Paragraphs of max 4 lines. Never more than 3 plain paragraphs in a row without a box/callout/quick check.
  4) INDIAN COMPARISON (5-8 lines) on its own line prefixed "🇮🇳 THINK OF IT LIKE THIS: " — an accurate everyday-Indian-life comparison (chai, local train, cricket, ration queue, WhatsApp group, auto rickshaw meter, tiffin, IPL auction). This is the moment the concept clicks — make it genuinely explanatory, not decoration.
  5) DIAGRAM DESCRIPTION where applicable (also fill "diagramDescription").
  6) EXAM FOCUS for THIS topic (5-8 lines) prefixed "🎯 EXAM FOCUS: " — what the examiner asks about THIS topic, typical marks, keywords the examiner hunts for, the most common mistake, and what a perfect 3-mark and 5-mark answer looks like.
  7) QUICK CHECK prefixed "❓ QUICK CHECK: " — one application (not recall) question, then on the next line "✅ ANSWER: " with the model answer.
A section missing ANY of these 7 parts is incomplete and unacceptable.

================= ABSOLUTELY FORBIDDEN =================
- Bullet lists as the main explanation of a concept (allowed ONLY in keyPoints, questions and quickRevision). Explain in paragraphs.
- One-line explanations of complex concepts. Every complex concept gets 200+ words.
- Listing topic names without explaining them (a table of contents is not a chapter).
- Textbook/NCERT phrasing copied or near-copied. Paraphrase and simplify EVERYTHING.
- Content that stops abruptly with no exam focus / quick check / closing line.
- Generic non-Indian examples ("a ball rolling down a hill"). Make every example specific and Indian.
- ANTI-BORING RULE (non-negotiable): never write more than 3 plain paragraphs in a row. After every ~3 paragraphs SWITCH format inside "content" — use a numbered list, bullet list, a story box, a "Fun fact:" box, an "Examiner tip:" sidebar, a "Quick check:" question, a "Common mistake:" warning, a memory-trick line, a "Real-life connection:" box, or a before/after ("Students think X → Actually Y") comparison. Constant variety keeps the brain engaged.
- MICRO-MOTIVATION: every few paragraphs drop one short encouraging line ("Most students skip this part — you are not most students.").
- BREAK REMINDERS: after roughly every 3500 words of content, insert this EXACT line on its own inside the content (prefix with "⏸️ BREAK REMINDER: "): "🧠 You have been reading for 45 minutes. Your brain needs rest to actually store what you just learned. Close the app right now. Drink some water. Walk around for 10 minutes. Come back fresh. The chapter will still be here. Students who take breaks score higher than students who push through — this is not a suggestion, it is science." A ~7000-word chapter gets exactly 2 of these (middle and near end).

================= DIAGRAM SPEC (CRITICAL) =================
- Provide at least 3 diagrams (5-6 for Science/Geography). Put each diagram's description in the relevant section's "diagramDescription" using EXACTLY this structure:
  "DIAGRAM NAME: <bold exact NCERT name>
  WHAT THIS DIAGRAM SHOWS: <one sentence>
  HOW TO DRAW IT STEP BY STEP: <obsessively specific numbered steps — give sizes, positions, and where each label goes; e.g. 'Step 1: Draw a circle of ~3cm radius in the centre.'>
  LABELS TO INCLUDE: <complete comma-separated list of every label>
  EXAMINER NOTE: <mandatory labels, required arrow directions, common mistakes, whether it carries marks>"

================= FOR CLASS 9 (2026-27 two-level system) =================
- For Class 9 Maths, label each topic "Proficiency Level" (mandatory) or "Advanced Level" (optional — JEE/Olympiad).
- For Class 9 Science, label each topic "Proficiency Level" (all students) or "Advanced Level" (NEET/JEE).
- Always state the source book name (e.g. "This chapter is from Ganita Manjari Part 1").

================= HOW TO FILL EACH FIELD (MAP THE STRUCTURE BELOW INTO THE JSON) =================
- twoLineSummary: Start with a HOOK — a curious question or scenario (e.g. "Ever wondered why you feel lighter in a swimming pool? That's literally today's chapter."). NEVER start with "In this chapter we will learn".
- examBox: This is "WHAT WILL COME IN THE EXAM" — show it first in the student's mind. List question types from the last 5 years of CBSE board exams with marks and how often they appeared. Fill likely1Mark, likely3Mark, likely5Mark and real previousYearQuestions (with actual year + marks).
- keyPoints: 8-10 points, and every single one must be FULLY ELABORATED — not one-liners. "point" = the crisp notebook line; "explanation" = a properly detailed mini-lesson of 120-200 words that fully DEFINES the term, explains why it is true, gives the formula/unit/date/example where relevant, adds one Indian real-life example, and ends with a one-line "Exam tip:" telling how it is asked. Never write a vague or half explanation — if a term is used, define it right there.

================= EXTRA CONTENT RULES (VERY IMPORTANT) =================
- SIMPLE WORDS ONLY: never use heavy or unexplained vocabulary. If a technical term is unavoidable, define it in brackets immediately in simple words the first time. No exam-word soup, no unnecessarily hard English.
- NOTES BETWEEN PARAGRAPHS: between paragraphs inside "content", drop short standalone lines starting with "📝 Note:" (a crucial fact or clarification) and "💡 Tip:" (a shortcut, a way to remember, or a smarter way to write it in the exam). At least 3 "📝 Note:" and 3 "💡 Tip:" lines per section.
- MOST IMPORTANT QUESTION PER TOPIC: every detailedNotes section must end with a block starting "⭐ MOST IMPORTANT QUESTION (will definitely come in the exam):" — the question, its marks, and the complete model answer written exactly as the student should write it in the answer sheet.
- NUMERICALS (Physics, Chemistry, Mathematics, and any Science topic with formulas): every such section must include at least 2 fully solved numericals under "🔢 SOLVED NUMERICAL:" with Given → Formula → Substitution → Calculation → Answer with unit, plus one "🔢 MOST IMPORTANT NUMERICAL:" that is the exam-favourite type for that topic, solved step by step, followed by one similar unsolved practice question with the final answer in brackets.
- NEW & INTERESTING CONCEPTS: in each section add one "🚀 Beyond the textbook:" box — a genuinely interesting modern or Indian connection (ISRO, UPI, cricket physics, monsoon, chandrayaan, EV batteries, AI, everyday gadgets) that links the concept to the real world. Keep it short and mind-blowing, and mark clearly that it is extra (not asked in exam).
- detailedNotes: 6-10 TOPIC sections covering the full chapter. For EACH topic's "content", write minimum 3-4 paragraphs in this exact order:
    1) WHAT is it (define simply)
    2) WHY does it happen / why did it happen (cause)
    3) HOW does it work / how did it happen (process/events with specific names, dates, facts)
    4) WHY does it matter (significance/impact)
    5) one funny Indian example
    6) sprinkle sidebar callouts INSIDE the content using these exact labels where relevant: "Examiner tip:", "Don't confuse:", "Fun fact:", "Common mistake:"
    7) a model answer guide for this topic: "FOR 1 MARK:" one crisp sentence; "FOR 2-3 MARKS:" define + brief explain + one example (4-5 lines); "FOR 5 MARKS:" full structure — INTRODUCTION (2-3 lines: define + context + one big-picture line), BODY 1 causes/background using connectors (Firstly, Moreover, In addition, Furthermore), BODY 2 main events/explanation with specific facts and dates, BODY 3 impact/significance, CONCLUSION (2 lines connecting to today or India). Add "Diagram:" if a diagram helps.
    8) end with the encouraging line.
  - diagramDescription: describe the diagram STEP BY STEP in plain text so a student can draw it (e.g. "Draw a rectangle ABCD, put a circle O in the centre, draw 4 arrows from O labelled N/S/E/W..."). Provide this for at least 2-3 topics.
  - memoryTrick: a funny, Indian, easy-to-remember mnemonic for that topic.
- shortAnswerQuestions: include all the IMPORTANT QUESTIONS — at least 10 one-mark style (definitions/names/dates/fill-in-blank), 8 two-to-three-mark, and 5 five-mark questions. For every 5-mark question put the FULL model answer (intro-body-conclusion) inside its "answer". Make the FIRST entry the "MOST IMPORTANT QUESTION OF THE CHAPTER" (prefix the question with "⭐ MOST IMPORTANT — ") with the most detailed fully-written model answer of the whole chapter.
- commonMistakes: 3-4 real "students write X but correct is Y" items.
- mcqs: exactly 5.
- quickRevision: 6-8 bullets, AND make the LAST 3-5 bullets MEMORY TRICKS / mnemonics (funny, Indian where possible) for the hardest things to remember.
- Only include exam questions that are genuinely likely / definitely asked for this chapter.

Return a JSON object with EXACTLY this structure (no markdown, pure JSON):
{
  "title": "chapter title",
  "subject": "${subject}",
  "classLevel": "${classLevel}",
  "language": "${language}",
  "twoLineSummary": "2-sentence summary that a student can memorize",
  "keyPoints": [
    {"point": "key concept", "explanation": "clear explanation with Indian example"}
  ],
  "examBox": {
    "title": "What will come in the exam? (No cap, fr fr)",
    "likely1Mark": ["list of 1-mark topics"],
    "likely3Mark": ["list of 3-mark topics"],
    "likely5Mark": ["list of 5-mark topics"],
    "previousYearQuestions": [
      {"year": 2023, "question": "actual style PYQ", "marks": 3}
    ]
  },
  "detailedNotes": [
    {
      "heading": "section heading",
      "content": "detailed explanation with analogies, Indian examples, Gen Z language",
      "diagramDescription": "describe any diagram here if applicable",
      "memoryTrick": "mnemonic or trick to remember this"
    }
  ],
  "commonMistakes": [
    {"mistake": "what students get wrong", "correct": "the right way"}
  ],
  "mcqs": [
    {
      "question": "MCQ question",
      "options": ["A. option", "B. option", "C. option", "D. option"],
      "correct": "A",
      "explanation": "why this is correct"
    }
  ],
  "shortAnswerQuestions": [
    {"question": "2-3 mark question", "answer": "model answer"}
  ],
  "quickRevision": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4", "bullet point 5"]
}

Make keyPoints have 8-10 items. Make detailedNotes have 6-10 detailed topic sections covering the FULL chapter, each with a clear diagramDescription where a diagram helps and a memoryTrick. Make mcqs have exactly 5 questions. Make commonMistakes have 3-4 items. Make quickRevision have 6-8 items. Make it so detailed and engaging that students actually enjoy studying this chapter.`;
}

const SYSTEM_PROMPT = `You are the best CBSE teacher in India with 25 years of experience. You know exactly what comes in board exams, exactly where students struggle, and exactly how to explain a concept so a student who has never seen it before understands it completely in one reading.

Your job is NOT to summarise. Your job is NOT to list topics. Your job is to TEACH — completely, thoroughly, engagingly.

Minimum 5000 words of actual explanatory content. Every topic needs a hook, a simple definition, a 400+ word explanation, an Indian comparison, a diagram description where applicable, an exam focus section and a quick check question. Short paragraphs (max 4 lines). Never more than 3 plain paragraphs in a row. Indian examples only — cricket, chai, biryani, Bollywood, IPL, auto rickshaw, street food, mom scolding, report card anxiety, school canteen, competitive cousin. If a sentence sounds like it belongs in an NCERT book, rewrite it.

The student is paying ₹39 for this chapter. It must be better than BYJU'S, better than Vedantu, better than their school teacher's notes and better than the NCERT textbook itself.

You output ONLY valid JSON. No markdown, no code fences, no preamble.`;

async function callAI(messages: { role: string; content: string }[]) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 32000,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(body) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function parseNotes(raw: string): any | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try { return JSON.parse(m[0]); } catch { return null; }
  }
}

const words = (s: string) => (s || "").trim().split(/\s+/).filter(Boolean).length;

// Depth verification — the content must actually teach, not list.
function verifyNotes(notes: any): string[] {
  const issues: string[] = [];
  const sections: any[] = Array.isArray(notes?.detailedNotes) ? notes.detailedNotes : [];

  if (sections.length < 5) {
    issues.push(`Only ${sections.length} topic sections. Produce at least 6 full topic sections covering the whole chapter.`);
  }

  const total = sections.reduce((n, s) => n + words(s?.content), 0);
  if (total < 4000) {
    issues.push(`Total explanation is only ~${total} words. It MUST be at least 5000 words. Expand EVERY topic explanation substantially — do not add new topics, deepen the existing ones.`);
  }

  sections.forEach((s, i) => {
    const c: string = s?.content || "";
    const name = s?.heading || `Topic ${i + 1}`;
    if (words(c) < 400) issues.push(`Topic "${name}" has only ~${words(c)} words — expand it to at least 500 words of real explanation.`);
    if (!/🇮🇳|THINK OF IT LIKE THIS/i.test(c)) issues.push(`Topic "${name}" is missing its "🇮🇳 THINK OF IT LIKE THIS:" Indian comparison — add it.`);
    if (!/🎯|EXAM FOCUS/i.test(c)) issues.push(`Topic "${name}" is missing its "🎯 EXAM FOCUS:" section — add it.`);
    if (!/❓|QUICK CHECK/i.test(c)) issues.push(`Topic "${name}" is missing its "❓ QUICK CHECK:" question with a "✅ ANSWER:" — add it.`);
    // Bullet points used as the main explanation
    const lines = c.split("\n").filter((l) => l.trim());
    const bullets = lines.filter((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l)).length;
    if (lines.length > 6 && bullets / lines.length > 0.4) {
      issues.push(`Topic "${name}" is mostly bullet points. Rewrite the explanation as flowing paragraphs; bullets are only allowed for key points and question lists.`);
    }
  });

  const kp: any[] = Array.isArray(notes?.keyPoints) ? notes.keyPoints : [];
  if (kp.length < 8) issues.push("Provide 8-10 keyPoints, each with a 120-200 word elaborated explanation.");
  if (kp.some((k) => words(k?.explanation) < 80)) issues.push("Some keyPoints have thin explanations — every keyPoint explanation must be a 120-200 word mini-lesson.");

  return issues.slice(0, 25);
}

function buildRepairPrompt(issues: string[]): string {
  return `Your previous generation FAILED the quality check. Fix every problem below and return the COMPLETE corrected chapter as the same JSON structure (all fields, nothing dropped, nothing shortened):

${issues.map((i, n) => `${n + 1}. ${i}`).join("\n")}

Rules for the fix: keep everything that was already good, only expand and add. Every topic must have all 7 parts (hook, simple definition + 📘 EXAM DEFINITION, 400+ word explanation, 🇮🇳 THINK OF IT LIKE THIS, diagram description where applicable, 🎯 EXAM FOCUS, ❓ QUICK CHECK + ✅ ANSWER). Write paragraphs, not bullet lists. Minimum 5000 words total. Return pure JSON only.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(SUPABASE_URL!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, chapterName, classLevel, language, studyStyle, forceRefresh } = await req.json();

    if (!subject || !chapterName || !classLevel) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate inputs to prevent prompt injection and cost abuse
    if (
      typeof subject !== "string" || typeof chapterName !== "string" ||
      typeof classLevel !== "string" ||
      chapterName.length > MAX_TEXT ||
      (language && (typeof language !== "string" || language.length > MAX_TEXT)) ||
      (studyStyle && (typeof studyStyle !== "string" || studyStyle.length > MAX_TEXT)) ||
      !isAllowed(subject, ALLOWED_SUBJECTS) ||
      !isAllowed(classLevel, ALLOWED_CLASS_LEVELS) ||
      (language && !isAllowed(language, ALLOWED_LANGUAGES))
    ) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = isAllowed(language || "", ALLOWED_LANGUAGES) ? language : "English";
    const style = studyStyle || "detailed";

    // Reject chapters removed from this class in the 2026-27 syllabus.
    if (findDeletedChapter(chapterName, classLevel)) {
      return new Response(
        JSON.stringify({
          error: "chapter_removed",
          message: `This chapter has been removed from Class ${classLevel} in the 2026-27 syllabus. It is now taught in higher classes.`,
        }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cacheKey = `${classLevel}__${subject}__${chapterName}__${lang}`.toLowerCase().replace(/\s+/g, "_");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const unlocked = await isChapterUnlocked(supabase, user.id, subject, chapterName, classLevel);

    // Check cache first (skip when client requests the latest NCERT-aligned regeneration)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("chapter_notes_cache")
        .select("*")
        .eq("cache_key", cacheKey)
        .maybeSingle();

      if (cached) {
        return new Response(JSON.stringify({ notes: gateNotes(cached.content, unlocked), cached: true, locked: !unlocked }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Clear stale cache so the freshly generated notes are stored
      await supabase.from("chapter_notes_cache").delete().eq("cache_key", cacheKey);
    }

    // Generate with Lovable AI Gateway, then verify depth and repair if too thin.
    const prompt = buildPrompt(subject, chapterName, classLevel, lang, style);

    let notes: any = null;
    let issues: string[] = [];
    const messages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ];

    for (let attempt = 0; attempt < 3; attempt++) {
      let result;
      try {
        result = await callAI(messages);
      } catch (e) {
        const status = (e as any)?.status;
        console.error("AI gateway error:", status, (e as any)?.message);
        if (notes) break; // keep what we already have
        return new Response(JSON.stringify({ error: "AI service unavailable" }), {
          status: status === 429 ? 429 : status === 402 ? 402 : 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const parsed = parseNotes(result);
      if (!parsed) {
        if (notes) break;
        return new Response(JSON.stringify({ error: "Could not parse AI response as JSON" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      notes = parsed;
      issues = verifyNotes(parsed);
      if (issues.length === 0) break;

      console.log(`Depth check failed (attempt ${attempt + 1}):`, issues.join(" | "));
      messages.push({ role: "assistant", content: JSON.stringify(parsed).slice(0, 12000) });
      messages.push({ role: "user", content: buildRepairPrompt(issues) });
    }

    // Only cache content that passed every depth check — thin content is never stored.
    if (issues.length === 0) {
      await supabase.from("chapter_notes_cache").insert({
      cache_key: cacheKey,
      subject,
      chapter_name: chapterName,
      class_level: classLevel,
      language: lang,
      content: notes,
      });
    } else {
      console.warn("Serving unverified notes after 3 attempts:", issues.slice(0, 5).join(" | "));
    }

    return new Response(JSON.stringify({ notes: gateNotes(notes, unlocked), cached: false, locked: !unlocked }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Internal error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
