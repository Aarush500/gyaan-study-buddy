import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

const ALLOWED_CLASS_LEVELS = ["9", "10", "11", "12"];
const ALLOWED_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Science",
  "English", "Hindi", "Sanskrit", "Social Science", "History", "Geography",
  "Civics", "Economics", "Political Science", "Computer Science",
  "Accountancy", "Business Studies",
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isAllowed(value: unknown, list: string[]) {
  return typeof value === "string" && list.some((v) => v.toLowerCase() === value.toLowerCase());
}

async function hmacSha256Hex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Validity window: 1 year from the payment date, aligned to the May 1 cycle.
function computeValidity() {
  const now = new Date();
  const year = now.getMonth() >= 4 ? now.getFullYear() : now.getFullYear() - 1;
  const validFrom = new Date(Date.UTC(year, 4, 1));
  const validUntil = new Date(Date.UTC(year + 1, 3, 30));
  const start = now > validFrom ? now : validFrom;
  return {
    valid_from: start.toISOString().slice(0, 10),
    valid_until: validUntil.toISOString().slice(0, 10),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUser = createClient(SUPABASE_URL!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const { subject, chapterName, classLevel, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body ?? {};

    if (!isAllowed(subject, ALLOWED_SUBJECTS)) return json({ error: "Invalid subject" }, 400);
    if (!isAllowed(classLevel, ALLOWED_CLASS_LEVELS)) return json({ error: "Invalid class level" }, 400);
    if (typeof chapterName !== "string" || chapterName.trim().length === 0 || chapterName.length > 200) {
      return json({ error: "Invalid chapter name" }, 400);
    }

    // A paid unlock requires a payment the server can verify. No verification,
    // no unlock — the client can never grant itself access.
    if (!RAZORPAY_KEY_SECRET) {
      return json({
        error: "payment_not_configured",
        message: "Payments are not set up yet, so paid chapters cannot be unlocked. Add your payment provider key to enable checkout.",
      }, 501);
    }

    if (
      typeof razorpayOrderId !== "string" || typeof razorpayPaymentId !== "string" ||
      typeof razorpaySignature !== "string" || razorpayOrderId.length > 100 ||
      razorpayPaymentId.length > 100 || razorpaySignature.length > 200
    ) {
      return json({ error: "Payment verification details are missing or invalid" }, 400);
    }

    const expected = await hmacSha256Hex(RAZORPAY_KEY_SECRET, `${razorpayOrderId}|${razorpayPaymentId}`);
    if (expected !== razorpaySignature.toLowerCase()) {
      console.error("Rejected unlock: payment signature mismatch", { userId: user.id });
      return json({ error: "Payment could not be verified" }, 402);
    }

    const admin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { valid_from, valid_until } = computeValidity();
    const { error } = await admin.from("unlocked_chapters").upsert({
      user_id: user.id,
      subject,
      chapter_name: chapterName,
      class_level: String(classLevel),
      is_free: false,
      valid_from,
      valid_until,
    }, { onConflict: "user_id,subject,chapter_name,class_level" });

    if (error) {
      console.error("Failed to record unlock:", error.message);
      return json({ error: "Could not record the unlock" }, 500);
    }

    return json({ unlocked: true, validUntil: valid_until });
  } catch (e) {
    console.error("unlock-chapter error:", e instanceof Error ? e.message : e);
    return json({ error: "Unexpected error" }, 500);
  }
});
