const langs = [
  { name: "English", native: "Hello" },
  { name: "Hindi", native: "नमस्ते" },
  { name: "Tamil", native: "வணக்கம்" },
  { name: "Telugu", native: "నమస్కారం" },
  { name: "Kannada", native: "ನಮಸ್ಕಾರ" },
  { name: "Marathi", native: "नमस्कार" },
];

const Languages = () => {
  return (
    <section id="languages" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.2em] opacity-70 font-semibold mb-3">
            Your language, your notes
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
            Written natively in<br />6 Indian languages.
          </h2>
          <p className="mt-4 opacity-80 max-w-lg">
            Not Google-translated. Each chapter is generated directly in your chosen
            language so it actually reads like your teacher speaks.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {langs.map((l) => (
            <div key={l.name} className="rounded-2xl bg-primary-foreground/10 border border-primary-foreground/15 p-5 hover:bg-primary-foreground/15 transition">
              <div className="font-display text-2xl font-extrabold">{l.native}</div>
              <div className="text-xs opacity-70 mt-1">{l.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Languages;
