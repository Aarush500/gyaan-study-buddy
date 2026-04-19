import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How is Gyaan different from free YouTube notes?", a: "Every Gyaan chapter is written around the CBSE board exam pattern with PYQs from the last 5 years embedded directly. No fluff, no 30-minute videos — full chapter in 8–12 minutes." },
  { q: "Is the content accurate?", a: "All notes are NCERT-aligned and pre-reviewed before going live. Every chapter has a 'Report an error' button — flagged content is fixed within 24 hours. The AI doubt chat is honest when unsure rather than confidently wrong." },
  { q: "What classes do you cover?", a: "Class 9, 10, 11, 12 CBSE — and college streams (Engineering, Commerce, Science, Arts). Class 9–10 and 11–12 use separate content tracks with different depth." },
  { q: "Can my parents pay for me?", a: "Yes. Tap 'Share with parent' on any chapter — it generates a WhatsApp-ready payment link. Parent pays via UPI, chapter unlocks for you instantly." },
  { q: "Do I need internet to study?", a: "Only the first time. Once you unlock a chapter, it's cached on your device — read it anywhere, even on the school bus." },
  { q: "Will there be a subscription later?", a: "No. ₹59 per chapter, one-time, forever. We hate subscriptions as much as you do." },
];

const FAQ = () => {
  return (
    <section className="bg-card/40 border-y border-border">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-24">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">FAQ</div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
            Questions, answered.
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left font-display font-bold text-base hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
