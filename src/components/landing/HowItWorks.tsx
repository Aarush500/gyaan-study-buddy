const steps = [
  {
    n: "01",
    t: "Tell us your weak subjects",
    d: "5-step onboarding picks your class, subjects, language & study style. We prioritise what you actually need.",
  },
  {
    n: "02",
    t: "Read exam-pattern notes",
    d: "Every chapter has a 'What will come in the exam?' box, PYQs from last 5 years, and 1-mark vs 5-mark answer formats.",
  },
  {
    n: "03",
    t: "Ask doubts. In your language.",
    d: "AI doubt chat that knows your chapter, your class, your language. Step-by-step for Math, Physics, Chemistry.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
          How Gyaan works
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          Built for the exam,<br />not the textbook.
        </h2>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition">
            <div className="font-display text-5xl font-extrabold text-primary/20">{s.n}</div>
            <div className="font-display text-xl font-extrabold mt-3">{s.t}</div>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
