import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Nav = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
      <nav className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-extrabold">
            ज्ञ
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">
            Gyaan
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#languages" className="hover:text-foreground transition">Languages</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Nav;
