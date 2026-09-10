import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface Props {
  step: number;
  total?: number;
  back?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function OnboardingLayout({ step, total = 5, back, title, subtitle, children, footer }: Props) {
  return (
    <div className="min-h-screen app-bg flex flex-col">
      <header className="px-5 pt-6 pb-4 max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-3 mb-5">
          {back ? (
            <Link
              to={back}
              aria-label="Go back"
              className="w-9 h-9 rounded-xl glass grid place-items-center hover:bg-card/80 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          ) : (
            <div className="w-9 h-9" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Step {step} of {total}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-border/70 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 px-5 pb-8 max-w-2xl w-full mx-auto">
        <h1 className="font-display text-3xl font-extrabold mt-6">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        <div className="mt-7">{children}</div>
      </main>

      {footer && (
        <footer className="sticky bottom-0 border-t border-border/60 bg-background/85 backdrop-blur-md">
          <div className="max-w-2xl mx-auto px-5 py-4">{footer}</div>
        </footer>
      )}
    </div>
  );
}
