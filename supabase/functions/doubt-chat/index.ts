import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const lang = language || "English";

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
    const maxDoubts = session?.max_doubts ?? 15;

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
1. Answer in ${lang} (mix Hindi/regional words naturally if not English)
2. Keep answer under 150 words
3. ${isMathOrScience ? "For Math/Science: solve step by step, show each step clearly numbered" : "Give clear, concise explanation"}
4. Use Indian examples and relatable analogies
5. End with an encouraging phrase like "You've got this!" or "Bilkul samajh aaya?"
6. If you don't know something, say so honestly - never make up wrong answers
7. Be warm, friendly, like a cool older sibling helping out`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt + "\n\nStudent question: " + question }],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 512,
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
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate an answer. Try again!";

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
          max_doubts: maxDoubts,
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
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
