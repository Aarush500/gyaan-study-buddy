import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ALLOWED_LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Marathi"];
const ALLOWED_CLASS_LEVELS = ["9", "10", "11", "12"];
const ALLOWED_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Science",
  "English", "Hindi", "Social Science", "History", "Geography",
  "Civics", "Economics", "Political Science", "Computer Science",
  "Accountancy", "Business Studies",
];
// Hard server-side cap — never trust a client/DB-provided max_doubts value.
const MAX_DOUBTS = 15;

function isAllowed(value: string, list: string[]): boolean {
  return list.some((v) => v.toLowerCase() === String(value).toLowerCase());
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
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

    const { subject, chapterName, classLevel, language, question, sessionId } = await req.json();

    if (!subject || !chapterName || !question) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      typeof subject !== "string" || subject.length > 300 ||
      typeof chapterName !== "string" || chapterName.length > 300 ||
      typeof question !== "string" || question.length > 500 ||
      !isAllowed(subject, ALLOWED_SUBJECTS) ||
      (classLevel && (typeof classLevel !== "string" || !isAllowed(classLevel, ALLOWED_CLASS_LEVELS))) ||
      (language && (typeof language !== "string" || language.length > 100 || !isAllowed(language, ALLOWED_LANGUAGES)))
    ) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const lang = isAllowed(language || "", ALLOWED_LANGUAGES) ? language : "English";

    // Get or create doubt session
    let session = null;
    if (sessionId) {
      const { data } = await supabase
        .from("doubt_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();
      session = data;
    }

    if (!session) {
      const { data } = await supabase
        .from("doubt_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("subject", subject)
        .eq("chapter_name", chapterName)
        .eq("class_level", classLevel)
        .maybeSingle();
      session = data;
    }

    const doubtsUsed = session?.doubts_used ?? 0;
    // Ignore any stored max_doubts — enforce the hard server-side cap only.
    const maxDoubts = MAX_DOUBTS;

    if (doubtsUsed >= maxDoubts) {
      return new Response(JSON.stringify({ error: "Doubt limit reached", doubtsUsed, maxDoubts }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isMathOrScience = ["Mathematics", "Physics", "Chemistry", "Science"].some(
      s => subject.toLowerCase().includes(s.toLowerCase())
    );

    const systemPrompt = `You are Gyaan, a friendly CBSE tutor helping a Class ${classLevel} student with ${subject} - Chapter: ${chapterName}.

Rules:
1. Answer fully in ${lang}. Do not mix English unless ${lang} is English or the term is a required NCERT technical word; if you use an English technical word, explain it immediately in ${lang}.
2. Keep answer under 150 words
3. ${isMathOrScience ? "For Math/Science: solve step by step, show each step clearly numbered" : "Give clear, concise explanation"}
4. Use Indian examples and relatable analogies
5. End with an encouraging phrase like "You've got this!" or "Bilkul samajh aaya?"
6. If you don't know something, say so honestly - never make up wrong answers
7. Be warm, friendly, like a cool older sibling helping out`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
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
    const answer = aiData.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate an answer. Try again!";

    const newMessages = [
      ...(session?.messages ?? []),
      { role: "user", content: question, timestamp: new Date().toISOString() },
      { role: "assistant", content: answer, timestamp: new Date().toISOString() },
    ];

    if (session) {
      await supabase
        .from("doubt_sessions")
        .update({ messages: newMessages, doubts_used: doubtsUsed + 1, updated_at: new Date().toISOString() })
        .eq("id", session.id);
    } else {
      const { data: newSession } = await supabase
        .from("doubt_sessions")
        .insert({
          user_id: user.id,
          subject,
          chapter_name: chapterName,
          class_level: classLevel,
          language: lang,
          messages: newMessages,
          doubts_used: 1,
          max_doubts: MAX_DOUBTS,
        })
        .select()
        .maybeSingle();
      session = newSession;
    }

    return new Response(
      JSON.stringify({
        answer,
        doubtsUsed: doubtsUsed + 1,
        maxDoubts,
        remaining: maxDoubts - doubtsUsed - 1,
        sessionId: session?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Internal error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
