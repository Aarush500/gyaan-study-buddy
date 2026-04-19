import { Button } from "@/components/ui/button";

const Nav = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
      <nav className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-extrabold">
            ज्ञ
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">
            Gyaan
          </span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#languages" className="hover:text-foreground transition">Languages</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Log in</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Get started
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Nav;
