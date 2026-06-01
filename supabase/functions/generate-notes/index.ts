import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

function buildPrompt(subject: string, chapterName: string, classLevel: string, language: string, studyStyle: string): string {
  return `You are a brilliant CBSE teacher who writes notes that students actually love reading. Generate THE MOST DETAILED, exam-ready CBSE notes (based on the LATEST / newest NCERT syllabus) for the following:

Subject: ${subject}
Chapter: ${chapterName}
Class: ${classLevel}
Language: ${language}
Study Style: ${studyStyle}

Write in SIMPLE Indian English mixed with ${language} where appropriate. Use Gen Z terms (e.g. "no cap", "lowkey", "hits different") but IN LIMIT — a sprinkle, not every line, so it stays readable. Use Indian examples (cricket, Bollywood, street food, festivals) and funny but tasteful analogies that make concepts click.

IMPORTANT depth & coverage rules:
- Base everything strictly on the LATEST NCERT textbook for Class ${classLevel} ${subject}. Cover the full chapter, nothing skipped.
- Make it genuinely DETAILED — aim for roughly a 1.5-day read. Each detailedNotes section must be long, thorough, and self-contained (multiple paragraphs).
- Split the chapter into clear TOPICS: each detailedNotes entry is one topic that fully explains a sub-part of the chapter.
- Highlight the most important points clearly inside the content.
- For exam questions, only include questions that are genuinely likely / definitely asked in exams for this chapter.

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
    const { subject, chapterName, classLevel, language, studyStyle } = await req.json();

    if (!subject || !chapterName || !classLevel) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = language || "English";
    const style = studyStyle || "detailed";
    const cacheKey = `${classLevel}__${subject}__${chapterName}__${lang}`.toLowerCase().replace(/\s+/g, "_");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check cache first
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
      return new Response(JSON.stringify({ error: "Gemini API error", detail: errText }), {
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
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
