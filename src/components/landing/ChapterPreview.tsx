import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChapterPreview = () => {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
            A peek inside
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
            Notes that read like<br />
            <span className="text-primary">your favourite teacher.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            We don't summarise textbooks. We write each chapter the way the best
            coaching teachers in India explain — with Indian examples, exam shortcuts,
            and the exact answer formats examiners want.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Chapter summary in 2 sentences",
              "8 scannable key points",
              "'What will come in the exam?' box",
              "Common mistakes & mnemonics",
              "5 MCQs + 2 short-answer practice questions",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-strong">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="bg-strong-soft text-strong font-semibold px-2 py-0.5 rounded-full">FREE</span>
              <span className="bg-primary-soft text-primary font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AI Generated
              </span>
              <span className="bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-full">NCERT</span>
            </div>
            <h3 className="font-display text-2xl font-extrabold mt-3">
              Gravitation
            </h3>
            <div className="text-xs text-muted-foreground">Class 9 • Science • 10 min read</div>

            <p className="mt-4 text-sm text-muted-foreground">
              Why does an apple fall down but the moon doesn't? Newton answered both
              with one idea — and changed physics forever.
            </p>

            <div className="mt-4 rounded-xl bg-weak-soft p-4">
              <div className="text-xs font-bold text-weak-soft-foreground uppercase tracking-wider">
                What will come in the exam?
              </div>
              <ul className="mt-2 text-sm text-weak-soft-foreground space-y-1">
                <li>• State Newton's law of gravitation (3-mark, asked in 2023)</li>
                <li>• Derive g = GM/R² (5-mark)</li>
              </ul>
            </div>

            <div className="mt-4 relative">
              <div className="space-y-2 blur-sm select-none pointer-events-none">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-5/6" />
                <div className="h-3 bg-muted rounded w-4/6" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/6" />
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <div className="rounded-xl border border-border bg-background p-4 shadow-lg text-center w-full max-w-xs">
                  <Lock className="h-5 w-5 mx-auto text-primary" />
                  <div className="font-display font-extrabold mt-2">Unlock for ₹59</div>
                  <div className="text-xs text-muted-foreground">One-time. Never expires.</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Less than a samosa plate 🥟</div>
                  <Button size="sm" className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Unlock now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChapterPreview;
