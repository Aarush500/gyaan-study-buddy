import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { useOnboardingDraft } from '@/lib/onboarding';
import { CLASSES } from '@/types';

const BLURBS: Record<string, string> = {
  '9': 'New NCF-2023 books — Kaveri, Ganita Manjari, Exploration',
  '10': 'Board year — full NCERT syllabus with PYQs',
  '11': 'Stream subjects, foundation for boards',
  '12': 'Board year — deep prep and previous year papers',
};

export default function LevelStep() {
  const navigate = useNavigate();
  const { draft, update } = useOnboardingDraft();

  return (
    <OnboardingLayout
      step={1}
      title="Which class are you in?"
      subtitle="Everything — chapters, notes and exam dates — is built around this."
      footer={
        <Button
          size="lg"
          disabled={!draft.classLevel}
          onClick={() => navigate('/onboarding/subjects')}
          className="w-full h-12 rounded-xl font-semibold glass-btn text-primary-foreground"
        >
          Continue
        </Button>
      }
    >
      <div className="grid gap-3">
        {CLASSES.map((c) => {
          const selected = draft.classLevel === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => update({ classLevel: c, strongSubjects: [], weakSubjects: [] })}
              className={`text-left rounded-2xl border p-4 transition ${
                selected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'border-border/70 bg-card/60 hover:bg-card'
              }`}
            >
              <div className="font-display text-lg font-extrabold">Class {c}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{BLURBS[c]}</div>
            </button>
          );
        })}
      </div>
    </OnboardingLayout>
  );
}
