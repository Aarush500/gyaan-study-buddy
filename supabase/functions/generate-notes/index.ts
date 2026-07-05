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

================= COVERAGE =================
- Base everything strictly on the LATEST NCERT textbook for Class ${classLevel} ${subject}. Cover the FULL chapter, nothing skipped.
- GO DEEP. Make it genuinely EXHAUSTIVE — a full study companion the student needs no other book for. Each detailedNotes section must be VERY long (at least 5-7 rich paragraphs), self-contained, and elaborate.
- Do NOT summarize or shorten. Expand every concept with definitions, causes, step-by-step processes, real numbers/dates/names, multiple worked examples, edge cases, and comparisons. Where a topic has sub-topics, explain EACH sub-topic in full — never merge them into one line.
- Prefer thoroughness over brevity everywhere. If in doubt, write MORE, not less.

================= HOW TO FILL EACH FIELD (MAP THE STRUCTURE BELOW INTO THE JSON) =================
- twoLineSummary: Start with a HOOK — a curious question or scenario (e.g. "Ever wondered why you feel lighter in a swimming pool? That's literally today's chapter."). NEVER start with "In this chapter we will learn".
- examBox: This is "WHAT WILL COME IN THE EXAM" — show it first in the student's mind. List question types from the last 5 years of CBSE board exams with marks and how often they appeared. Fill likely1Mark, likely3Mark, likely5Mark and real previousYearQuestions (with actual year + marks).
- keyPoints: 8-10 crisp copy-worthy points, each max 2 lines — the exact points a student writes in their notebook.
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

    // Generate with Lovable AI Gateway
    const prompt = buildPrompt(subject, chapterName, classLevel, lang, style);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You output only valid JSON. No markdown, no code fences." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 32000,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      const status = aiRes.status === 429 ? 429 : aiRes.status === 402 ? 402 : 502;
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const rawText = aiData.choices?.[0]?.message?.content;

    if (!rawText) {
      return new Response(JSON.stringify({ error: "Empty response from AI" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let notes: unknown;
    try {
      notes = JSON.parse(rawText);
    } catch {
      // Try to extract JSON from text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        notes = JSON.parse(jsonMatch[0]);
      } else {
        return new Response(JSON.stringify({ error: "Could not parse AI response as JSON" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Cache the result
    await supabase.from("chapter_notes_cache").insert({
      cache_key: cacheKey,
      subject,
      chapter_name: chapterName,
      class_level: classLevel,
      language: lang,
      content: notes,
    });

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
