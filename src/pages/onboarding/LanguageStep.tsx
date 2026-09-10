import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { useOnboardingDraft } from '@/lib/onboarding';
import { LANGUAGES } from '@/types';

const NATIVE: Record<string, string> = {
  English: 'English',
  Hindi: 'हिंदी',
  Tamil: 'தமிழ்',
  Telugu: 'తెలుగు',
  Kannada: 'ಕನ್ನಡ',
  Marathi: 'मराठी',
};

export default function LanguageStep() {
  const navigate = useNavigate();
  const { draft, update } = useOnboardingDraft();

  return (
    <OnboardingLayout
      step={3}
      back="/onboarding/subjects"
      title="Pick your study language"
      subtitle="All notes and doubt answers will be written in this language."
      footer={
        <Button
          size="lg"
          disabled={!draft.language}
          onClick={() => navigate('/onboarding/style')}
          className="w-full h-12 rounded-xl font-semibold glass-btn text-primary-foreground"
        >
          Continue
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map((l) => {
          const selected = draft.language === l;
          return (
            <button
              key={l}
              type="button"
              onClick={() => update({ language: l })}
              className={`rounded-2xl border p-4 text-left transition ${
                selected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'border-border/70 bg-card/60 hover:bg-card'
              }`}
            >
              <div className="font-display text-lg font-extrabold">{NATIVE[l] || l}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{l}</div>
            </button>
          );
        })}
      </div>
    </OnboardingLayout>
  );
}
