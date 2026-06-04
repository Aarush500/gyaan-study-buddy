import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      <section className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <div className="rounded-3xl bg-foreground text-background p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 grain opacity-30 pointer-events-none" aria-hidden />
          <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-balance relative">
            Your boards are coming.<br />
            <span className="opacity-70">Be ready.</span>
          </h2>
          <p className="mt-5 max-w-lg mx-auto opacity-70 relative">
            Join thousands of students who study less and score more with Gyaan.
            Your first chapter is free.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center relative">
            <Button asChild size="lg" className="h-12 px-6 bg-background text-foreground hover:bg-background/90">
              <Link to="/signup">
                Get started free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-primary text-primary-foreground grid place-items-center font-display font-extrabold text-xs">ज्ञ</span>
            <span className="font-display font-extrabold text-foreground">Gyaan</span>
            <span>· Study smarter. In your language.</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Terms</a>
            <a href="#" className="hover:text-foreground transition">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
