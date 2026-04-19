import { BookOpenCheck, Languages, MessageCircleQuestion, Target, WifiOff, ShieldCheck } from "lucide-react";

const features = [
  { icon: Target, title: "Personalised by weak subjects", desc: "Your dashboard shows what you actually need to study — not a generic list." },
  { icon: BookOpenCheck, title: "PYQs baked in", desc: "Previous year questions from the last 5 years embedded in every chapter." },
  { icon: MessageCircleQuestion, title: "AI doubt chat per chapter", desc: "Step-by-step for Math & Science. Honest when unsure. 15 doubts per chapter." },
  { icon: Languages, title: "6 Indian languages", desc: "Hindi, Tamil, Telugu, Kannada, Marathi & English — content written natively, not translated." },
  { icon: WifiOff, title: "Offline after unlocking", desc: "Read your unlocked chapters anywhere — no internet needed." },
  { icon: ShieldCheck, title: "NCERT aligned", desc: "Every note is verified against NCERT. Spot a mistake? Report it in one tap." },
];

const Features = () => {
  return (
    <section id="features" className="bg-card/40 border-y border-border">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
            What you get
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
            Everything a coaching teacher gives you.<br />
            <span className="text-muted-foreground">Minus the ₹2,000/month.</span>
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-background p-6 hover:shadow-lg hover:shadow-primary/5 transition">
              <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-display text-lg font-extrabold mt-4">{title}</div>
              <p className="text-sm text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
