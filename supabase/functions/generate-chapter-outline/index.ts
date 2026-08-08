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

const OUTLINE_TOOL = {
  type: "function",
  function: {
    name: "emit_outline",
    description: "Emit the chapter outline",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        hook: { type: "string" },
        twoLineSummary: { type: "string" },
        estimatedMinutes: { type: "number" },
        keyPoints: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: { point: { type: "string" }, explanation: { type: "string" } },
            required: ["point", "explanation"],
          },
        },
        examBox: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            likely1Mark: { type: "array", items: { type: "string" } },
            likely3Mark: { type: "array", items: { type: "string" } },
            likely5Mark: { type: "array", items: { type: "string" } },
          },
          required: ["title", "likely1Mark", "likely3Mark", "likely5Mark"],
        },
        topics: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              blurb: { type: "string" },
              level: { type: "string" },
            },
            required: ["title", "blurb", "level"],
          },
        },
      },
      required: ["title", "hook", "twoLineSummary", "estimatedMinutes", "keyPoints", "examBox", "topics"],
    },
  },
};

function buildPrompt(subject: string, chapterName: string, classLevel: string, language: string, studyStyle: string) {
  return `You are the coolest, most experienced CBSE teacher in India. Plan the chapter "${chapterName}" (Class ${classLevel} ${subject}) for one student. Study style: ${studyStyle}.
${buildSyllabusGuidance(subject, classLevel)}

${languageRule(language)}

${TONE_RULES}

================= WHAT TO PRODUCE =================
1) hook: 4-6 lines. A real-life Indian scenario, surprising fact or question that makes the student WANT to read. Never start with a definition.
2) twoLineSummary: exactly 2 sentences on what this chapter is really about.
3) keyPoints: 8-10 points. Each "point" is one line; each "explanation" is 3-5 real sentences (not a fragment) that actually teaches the idea.
4) examBox: the questions the examiner genuinely asks from this chapter — 4+ one-mark, 4+ three-mark, 3+ five-mark, phrased like real CBSE board questions.
5) topics: the COMPLETE topic-by-topic breakdown of the chapter in teaching order — 6 to 12 topics, covering every sub-topic in the NCERT chapter, nothing skipped and nothing invented. Each topic has a full descriptive title (as a student would see in the textbook), a one-line blurb, and "level" = "Proficiency" or "Advanced" (use "Proficiency" when the class has no two-level system).
Set estimatedMinutes to a realistic total reading time.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Server not configured" }, 500);
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const subject = String(body.subject ?? "").slice(0, MAX_TEXT);
    const chapterName = String(body.chapterName ?? "").slice(0, MAX_TEXT);
    const classLevel = String(body.classLevel ?? "9");
    const language = String(body.language ?? "English");
    const studyStyle = String(body.studyStyle ?? "detailed").slice(0, 40);
    const forceRefresh = body.forceRefresh === true;

    if (!chapterName) return json({ error: "Chapter name is required" }, 400);
    if (!isAllowed(subject, ALLOWED_SUBJECTS)) return json({ error: "Unsupported subject" }, 400);
    if (!isAllowed(classLevel, ALLOWED_CLASS_LEVELS)) return json({ error: "Unsupported class" }, 400);
    if (!isAllowed(language, ALLOWED_LANGUAGES)) return json({ error: "Unsupported language" }, 400);
    if (findDeletedChapter(chapterName, classLevel)) {
      return json({ error: `"${chapterName}" is no longer part of the Class ${classLevel} 2026-27 syllabus.` }, 400);
    }

    const cacheKey = `v3::${classLevel}::${subject}::${chapterName}::${language}::${studyStyle}`.toLowerCase();

    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("chapter_outlines").select("content")
        .eq("user_id", user.id).eq("cache_key", cacheKey).maybeSingle();
      if (cached?.content) return json({ outline: cached.content, cached: true });
    }

    const outline = await callGateway(LOVABLE_API_KEY, {
      model: MODEL,
      messages: [{ role: "user", content: buildPrompt(subject, chapterName, classLevel, language, studyStyle) }],
      tools: [OUTLINE_TOOL],
      tool_choice: { type: "function", function: { name: "emit_outline" } },
      max_tokens: 8000,
    }, 100_000);

    await supabase.from("chapter_outlines").upsert({
      user_id: user.id, cache_key: cacheKey, class_level: classLevel,
      subject, chapter_name: chapterName, language, study_style: studyStyle,
      content: outline,
    }, { onConflict: "user_id,cache_key" });

    return json({ outline, cached: false });
  } catch (e) {
    console.error("generate-chapter-outline failed", e);
    return gatewayErrorResponse(e);
  }
});
