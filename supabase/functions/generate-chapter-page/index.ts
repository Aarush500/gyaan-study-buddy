import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  ALLOWED_CLASS_LEVELS, ALLOWED_LANGUAGES, ALLOWED_SUBJECTS, MAX_TEXT,
  TONE_RULES, buildSyllabusGuidance, callGateway, corsHeaders, findDeletedChapter,
  gatewayErrorResponse, isAllowed, json, languageRule,
} from "../_shared/gyaan.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const MODEL = "google/gemini-3-flash-preview";

const PAGE_TOOL = {
  type: "function",
  function: {
    name: "emit_page",
    description: "Emit one fully taught topic page",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        level: { type: "string" },
        hook: { type: "string" },
        simpleDefinition: { type: "string" },
        examDefinition: { type: "string" },
        bodyMarkdown: { type: "string" },
        indianComparison: { type: "string" },
        keyTerms: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: { term: { type: "string" }, meaning: { type: "string" } },
            required: ["term", "meaning"],
          },
        },
        workedProblems: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              question: { type: "string" },
              solution: { type: "string" },
              marks: { type: "number" },
            },
            required: ["question", "solution", "marks"],
          },
        },
        examFocus: { type: "string" },
        commonMistake: { type: "string" },
        memoryTrick: { type: "string" },
        quickCheck: {
          type: "object",
          additionalProperties: false,
          properties: { question: { type: "string" }, answer: { type: "string" } },
          required: ["question", "answer"],
        },
        diagram: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            shows: { type: "string" },
            svg: { type: "string" },
            howToDraw: { type: "string" },
          },
          required: ["name", "shows", "svg", "howToDraw"],
        },
        closingLine: { type: "string" },
      },
      required: [
        "title", "level", "hook", "simpleDefinition", "examDefinition", "bodyMarkdown",
        "indianComparison", "keyTerms", "workedProblems", "examFocus", "commonMistake",
        "memoryTrick", "quickCheck", "diagram", "closingLine",
      ],
    },
  },
};

function needsNumericals(subject: string) {
  return ["mathematics", "maths", "math", "physics", "chemistry", "science"].includes(subject.toLowerCase());
}

function buildPrompt(o: {
  subject: string; chapterName: string; classLevel: string; language: string;
  studyStyle: string; topicTitle: string; topicIndex: number; allTopics: string[];
}) {
  return `You are the coolest, most experienced CBSE teacher in India, teaching ONE topic of a chapter to ONE student sitting next to you.

Subject: ${o.subject}
Chapter: ${o.chapterName}
Class: ${o.classLevel}
Study style: ${o.studyStyle}
THIS PAGE'S TOPIC (teach ONLY this): "${o.topicTitle}" (topic ${o.topicIndex + 1} of ${o.allTopics.length})
Full chapter topic order for context (do NOT teach the others): ${o.allTopics.join(" | ")}
${buildSyllabusGuidance(o.subject, o.classLevel)}

${languageRule(o.language)}

${TONE_RULES}

================= LENGTH (HARD RULE) =================
- "bodyMarkdown" must be 1000-1500 words of real flowing explanation for THIS topic alone. Under 900 words is a FAILED page.
- Cover every sub-part of this topic: what it is, how it was discovered, why it works, how it is used, what breaks without it, its India connection, edge cases and comparisons.

================= bodyMarkdown FORMAT =================
- Real markdown: "## " sub-headings, short paragraphs (max 4 lines), tables where a comparison helps, "> " quote blocks for the big idea.
- ANTI-BORING RULE: never more than 3 plain paragraphs in a row. After every ~3 paragraphs switch format — a numbered process, a "**Fun fact:**" box, a "**Examiner tip:**" line, a "**Common mistake:**" warning, a "**Real-life connection:**" box, or a "Students think X → Actually Y" comparison.
- Insert "**📝 NOTE:**" lines between paragraphs wherever a student would need a caution or a shortcut, and at least two "**🎯 MOST IMPORTANT — this WILL come in the exam:**" lines on the exact points examiners repeat.
- Include at least one genuinely NEW or interesting concept/extension beyond the plain textbook line, clearly marked "**🚀 GOING BEYOND:**".
- Maths must be written in LaTeX: $inline$ and $$display$$. Never put LaTeX inside code fences.
- No hard unexplained jargon. Every technical word gets a plain-English meaning right after it.

================= OTHER FIELDS =================
- hook: 3-5 lines, a real Indian scenario or surprising fact. Never a definition.
- simpleDefinition: 2-3 lines a 13-year-old understands. examDefinition: the precise NCERT-style definition to write in the exam.
- indianComparison: 5-8 lines of an accurate everyday-Indian-life comparison that makes the concept click.
- keyTerms: 4-8 terms with student-friendly meanings.
- workedProblems: ${needsNumericals(o.subject)
    ? "2-3 of the MOST important exam problems for this topic (numericals where applicable), each solved step by step showing every step and the final answer with units."
    : "2-3 of the most important exam questions for this topic, each with a full model answer written the way an examiner wants it."}
- examFocus: 5-8 lines — what is asked from THIS topic, typical marks, keywords examiners hunt for, what a perfect 3-mark and 5-mark answer looks like.
- commonMistake: the mistake students actually make here, and the correct version.
- memoryTrick: one mnemonic or trick that genuinely helps.
- quickCheck: one APPLICATION question (not recall) plus its model answer.
- diagram: "svg" must be a complete inline <svg viewBox="0 0 400 280"> ... </svg> with stroke="currentColor" and fill="none" (use currentColor for text too) so it themes correctly — clean, labelled, hand-drawable, no external images, no CSS classes, no scripts. If this topic truly has no diagram, still draw a simple labelled concept map of the topic.
- closingLine: one short encouraging line.
- level: "Proficiency" or "Advanced".`;
}

async function isChapterUnlocked(supabase: any, userId: string, subject: string, chapterName: string, classLevel: string) {
  const { data } = await supabase
    .from("unlocked_chapters").select("valid_until, is_free")
    .eq("user_id", userId).eq("subject", subject)
    .eq("chapter_name", chapterName).eq("class_level", classLevel).maybeSingle();
  if (!data) return false;
  if (data.is_free) return true;
  if (!data.valid_until) return false;
  return new Date(data.valid_until).getTime() > Date.now();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Server not configured" }, 500);
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const subject = String(body.subject ?? "").slice(0, MAX_TEXT);
    const chapterName = String(body.chapterName ?? "").slice(0, MAX_TEXT);
    const classLevel = String(body.classLevel ?? "9");
    const language = String(body.language ?? "English");
    const studyStyle = String(body.studyStyle ?? "detailed").slice(0, 40);
    const topicTitle = String(body.topicTitle ?? "").slice(0, MAX_TEXT);
    const topicIndex = Number.isInteger(body.topicIndex) ? Number(body.topicIndex) : -1;
    const allTopics = Array.isArray(body.allTopics)
      ? body.allTopics.slice(0, 20).map((t: unknown) => String(t).slice(0, MAX_TEXT))
      : [];
    const forceRefresh = body.forceRefresh === true;

    if (!chapterName || !topicTitle) return json({ error: "Chapter and topic are required" }, 400);
    if (topicIndex < 0 || topicIndex > 19) return json({ error: "Invalid topic" }, 400);
    if (!isAllowed(subject, ALLOWED_SUBJECTS)) return json({ error: "Unsupported subject" }, 400);
    if (!isAllowed(classLevel, ALLOWED_CLASS_LEVELS)) return json({ error: "Unsupported class" }, 400);
    if (!isAllowed(language, ALLOWED_LANGUAGES)) return json({ error: "Unsupported language" }, 400);
    if (findDeletedChapter(chapterName, classLevel)) {
      return json({ error: `"${chapterName}" is no longer part of the Class ${classLevel} 2026-27 syllabus.` }, 400);
    }

    // Server-side paywall: only the first topic is readable without an unlock.
    const unlocked = await isChapterUnlocked(supabase, user.id, subject, chapterName, classLevel);
    if (!unlocked && topicIndex > 0) {
      return json({ locked: true, error: "This topic is locked. Unlock the chapter to continue." }, 403);
    }

    const cacheKey = `v3::${classLevel}::${subject}::${chapterName}::${topicIndex}::${topicTitle}::${language}::${studyStyle}`.toLowerCase();

    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("chapter_pages").select("content")
        .eq("user_id", user.id).eq("cache_key", cacheKey).maybeSingle();
      if (cached?.content) return json({ page: cached.content, cached: true });
    }

    const page = await callGateway(LOVABLE_API_KEY, {
      model: MODEL,
      messages: [{
        role: "user",
        content: buildPrompt({ subject, chapterName, classLevel, language, studyStyle, topicTitle, topicIndex, allTopics }),
      }],
      tools: [PAGE_TOOL],
      tool_choice: { type: "function", function: { name: "emit_page" } },
      max_tokens: 12000,
    }, 110_000);

    await supabase.from("chapter_pages").upsert({
      user_id: user.id, cache_key: cacheKey, class_level: classLevel,
      subject, chapter_name: chapterName, topic_index: topicIndex, topic_title: topicTitle,
      language, study_style: studyStyle, content: page,
    }, { onConflict: "user_id,cache_key" });

    return json({ page, cached: false });
  } catch (e) {
    console.error("generate-chapter-page failed", e);
    return gatewayErrorResponse(e);
  }
});
