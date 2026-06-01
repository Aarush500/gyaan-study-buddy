const TrustBar = () => {
  const items = [
    { k: "10–12 min", v: "to finish a chapter" },
    { k: "5 yrs", v: "of PYQs in every note" },
    { k: "6", v: "Indian languages" },
    { k: "₹39", v: "per chapter, forever" },
  ];
  return (
    <section className="border-y border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-5 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((i) => (
          <div key={i.k} className="text-center md:text-left">
            <div className="font-display text-3xl font-extrabold tracking-tight">{i.k}</div>
            <div className="text-xs text-muted-foreground mt-1">{i.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustBar;
