import { ReactNode } from 'react';
import { Sparkles, BookOpen, Languages, Trophy } from 'lucide-react';

const perks = [
  { icon: BookOpen, text: 'Most detailed NCERT notes' },
  { icon: Languages, text: 'Study in your language' },
  { icon: Trophy, text: 'Score more, study less' },
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen app-bg grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-weak/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl glass-strong grid place-items-center">
            <span className="font-display font-extrabold text-2xl text-primary">G</span>
          </div>
          <span className="font-display font-extrabold text-2xl">Gyaan</span>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            Study smarter.<br />In your language.
          </h2>
          <div className="space-y-3">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-3 text-muted-foreground">
                <div className="w-9 h-9 rounded-xl glass grid place-items-center shrink-0">
                  <p.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-foreground">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-weak" /> Just ₹39 to unlock a full chapter
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export function GoogleButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full h-11 rounded-xl glass border border-border/60 flex items-center justify-center gap-3 font-medium hover:bg-card/80 transition disabled:opacity-60"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
      </svg>
      {loading ? 'Connecting…' : 'Continue with Google'}
    </button>
  );
}