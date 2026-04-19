import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
          Pricing
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          ₹59 per chapter.<br />
          <span className="text-muted-foreground">No subscription. Ever.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Pay only for what you study. Try one chapter per subject completely free.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-border bg-card p-7">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Free forever</div>
          <div className="mt-2 font-display text-5xl font-extrabold">₹0</div>
          <div className="text-sm text-muted-foreground mt-1">No card, no signup tricks</div>
          <ul className="mt-6 space-y-3 text-sm">
            <Item>Chapter summary & key points (all chapters)</Item>
            <Item>"What will come in the exam?" box</Item>
            <Item>One full chapter per subject</Item>
            <Item>3 AI doubt questions on free chapter</Item>
          </ul>
          <Button variant="outline" className="w-full mt-6 h-11">Start free</Button>
        </div>

        <div className="rounded-2xl border-2 border-primary bg-card p-7 relative shadow-xl shadow-primary/10">
          <div className="absolute -top-3 left-7 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </div>
          <div className="text-xs uppercase tracking-wider text-primary font-semibold">Per chapter</div>
          <div className="mt-2 font-display text-5xl font-extrabold">
            ₹59 <span className="text-base text-muted-foreground font-body font-normal">one-time</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">Less than a samosa plate 🥟</div>
          <ul className="mt-6 space-y-3 text-sm">
            <Item>Full detailed notes in your study style</Item>
            <Item>5 MCQs + 2 short-answer practice questions</Item>
            <Item>15 AI doubt questions per chapter</Item>
            <Item>Previous year questions (last 5 years)</Item>
            <Item>Offline access + PDF download</Item>
            <Item>Never expires • UPI, cards, parent-pay link</Item>
          </ul>
          <Button className="w-full mt-6 h-11 bg-primary text-primary-foreground hover:bg-primary/90">
            Unlock your first chapter
          </Button>
        </div>
      </div>
    </section>
  );
};

const Item = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-2">
    <Check className="h-4 w-4 text-strong shrink-0 mt-0.5" />
    <span>{children}</span>
  </li>
);

export default Pricing;
