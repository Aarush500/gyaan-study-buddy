import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { useOnboardingDraft } from '@/lib/onboarding';
import { STUDY_STYLES } from '@/types';

export default function StyleStep() {
  const navigate = useNavigate();
  const { draft, update } = useOnboardingDraft();

  return (
    <OnboardingLayout
      step={4}
      back="/onboarding/language"
      title="How do you like to study?"
      subtitle="We'll format every chapter in this style. You can change it any time."
      footer={
        <Button
          size="lg"
          disabled={!draft.studyStyle}
          onClick={() => navigate('/onboarding/summary')}
          className="w-full h-12 rounded-xl font-semibold glass-btn text-primary-foreground"
        >
          Continue
        </Button>
      }
    >
      <div className="grid gap-3">
        {STUDY_STYLES.map((s) => {
          const selected = draft.studyStyle === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => update({ studyStyle: s.id })}
              className={`text-left rounded-2xl border p-4 transition ${
                selected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'border-border/70 bg-card/60 hover:bg-card'
              }`}
            >
              <div className="font-display text-lg font-extrabold">{s.name}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{s.description}</div>
            </button>
          );
        })}
      </div>
    </OnboardingLayout>
  );
}
