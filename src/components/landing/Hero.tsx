import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grain opacity-60 pointer-events-none" aria-hidden />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-weak/10 blur-3xl pointer-events-none" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered • Built for CBSE • 6 Indian languages
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-balance">
              Score more.
              <br />
              <span className="text-primary">Study less.</span>
              <br />
              <span className="italic font-medium text-muted-foreground text-3xl md:text-5xl">
                हिंदी में भी।
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              AI-powered CBSE notes personalised to your weak subjects. Pay
              <span className="text-foreground font-semibold"> ₹39 per chapter</span> —
              no subscription, ever. One free chapter per subject to try.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 text-base">
                <Link to="/signup">
                  Get started — it's free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-xs">
              {[
                "📚 Class 9–12 CBSE",
                "🗣️ 6 Indian languages",
                "🤖 AI doubt chat",
                "✅ One free chapter per subject",
              ].map((t) => (
                <span key={t} className="rounded-full bg-card border border-border px-3 py-1.5 text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-5">
            <PhoneMock />
          </div>
        </div>
      </div>
    </section>
  );
};

const PhoneMock = () => {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-transparent to-weak/20 blur-2xl rounded-[3rem]" aria-hidden />
      <div className="relative rounded-[2.5rem] border border-border bg-card p-3 shadow-2xl shadow-primary/10">
        <div className="rounded-[2rem] bg-background overflow-hidden">
          <div className="px-5 pt-6 pb-2">
            <div className="text-xs text-muted-foreground">Good morning,</div>
            <div className="font-display text-2xl font-extrabold">Aanya 👋</div>
            <div className="mt-1 text-xs text-weak-soft-foreground bg-weak-soft inline-block px-2 py-0.5 rounded-full">
              Boards in 87 days
            </div>
          </div>
          <div className="px-5 grid grid-cols-2 gap-2 mt-3">
            <Stat label="Day streak" value="12" tone="primary" />
            <Stat label="Unlocked" value="8" tone="strong" />
          </div>

          <div className="px-5 mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            Needs work
          </div>
          <div className="px-5 mt-2 space-y-2">
            <SubjectRow name="Social Science" tone="weak" progress={32} />
            <SubjectRow name="English" tone="weak" progress={45} />
            <SubjectRow name="Mathematics" tone="strong" progress={78} />
          </div>

          <div className="mx-5 mt-4 mb-5 rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold">Gravitation</div>
              <span className="text-[10px] bg-strong-soft text-strong px-2 py-0.5 rounded-full font-semibold">FREE</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Class 9 • Science • 10 min read
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, tone }: { label: string; value: string; tone: "primary" | "strong" }) => (
  <div className={`rounded-xl p-3 ${tone === "primary" ? "bg-primary-soft" : "bg-strong-soft"}`}>
    <div className={`text-2xl font-display font-extrabold ${tone === "primary" ? "text-primary" : "text-strong"}`}>
      {value}
    </div>
    <div className="text-[11px] text-muted-foreground">{label}</div>
  </div>
);

const SubjectRow = ({ name, tone, progress }: { name: string; tone: "weak" | "strong"; progress: number }) => (
  <div className={`rounded-xl border-l-[3px] ${tone === "weak" ? "border-weak bg-weak-soft/40" : "border-strong bg-strong-soft/40"} bg-card border-y border-r border-border p-2.5`}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold">{name}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${tone === "weak" ? "bg-weak text-weak-foreground" : "bg-strong text-strong-foreground"}`}>
        {tone === "weak" ? "Needs work" : "Strong"}
      </span>
    </div>
    <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
      <div className={`h-full ${tone === "weak" ? "bg-weak" : "bg-strong"}`} style={{ width: `${progress}%` }} />
    </div>
  </div>
);

export default Hero;
