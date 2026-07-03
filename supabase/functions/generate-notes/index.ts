import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
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

// Class 9 (2024+ revised NCERT) uses new textbooks and a refreshed syllabus.
// Anchor the AI to the correct book + maximum-depth coverage for Class 9.
function buildSyllabusGuidance(subject: string, classLevel: string): string {
  if (String(classLevel) !== "9") return "";
  const subj = subject.toLowerCase();

  if (subj === "english") {
    return `
CLASS 9 SYLLABUS RULE (CRITICAL):
- Use the LATEST revised NCERT Class 9 English textbook "Kaveri" as the ONLY source. Base the entire chapter strictly on "Kaveri" — its prose, poems, characters, themes and exact text.
- Do NOT use old Beehive / Moments content. Everything must come from "Kaveri".
- Cover the full chapter from "Kaveri": summary, theme, characters, important lines/quotes, literary devices, value points, and all in-book questions.`;
  }

  if (subj === "mathematics" || subj === "maths" || subj === "math") {
    return `
CLASS 9 SYLLABUS RULE (CRITICAL):
- Use the LATEST revised NCERT Class 9 Maths textbook "Ganita Manjari" (Ganit Manjari) as the ONLY source. Base the entire chapter strictly on "Ganita Manjari".
- Do NOT use the old Class 9 maths book content. Follow the topics, order and examples of "Ganita Manjari".
- Cover every concept, theorem, formula, solved example and exercise type from the chapter, with full step-by-step worked solutions.`;
  }

  if (subj === "science" || subj === "physics" || subj === "chemistry" || subj === "biology") {
    return `
CLASS 9 SYLLABUS RULE (CRITICAL):
- Use the LATEST revised NCERT Class 9 Science syllabus. Cover the ENTIRE chapter — every topic, sub-topic and sub-sub-topic — nothing skipped.
- Explain in the MOST DETAILED form possible: every definition, principle, derivation, diagram, activity, example and numerical type from the chapter.
- Break each topic into sub-topics and explain each one thoroughly so a student needs no other resource.`;
  }

  return `
CLASS 9 SYLLABUS RULE: Use the LATEST revised NCERT Class 9 syllabus and cover the full chapter in maximum detail.`;
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
- Make it genuinely DETAILED — roughly a 1.5-day read. Each detailedNotes section must be long and self-contained.

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

    // Check cache first (skip when client requests the latest NCERT-aligned regeneration)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("chapter_notes_cache")
        .select("*")
        .eq("cache_key", cacheKey)
        .maybeSingle();

      if (cached) {
        return new Response(JSON.stringify({ notes: cached.content, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Clear stale cache so the freshly generated notes are stored
      await supabase.from("chapter_notes_cache").delete().eq("cache_key", cacheKey);
    }

    // Generate with Gemini
    const prompt = buildPrompt(subject, chapterName, classLevel, lang, style);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return new Response(JSON.stringify({ error: "Empty response from Gemini" }), {
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
        return new Response(JSON.stringify({ error: "Could not parse Gemini response as JSON" }), {
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

    return new Response(JSON.stringify({ notes, cached: false }), {
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
