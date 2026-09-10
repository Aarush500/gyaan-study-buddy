import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { useOnboardingDraft } from '@/lib/onboarding';
import { SYLLABUS } from '@/lib/syllabus';

const FALLBACK = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Social Science', 'English'];

export default function SubjectsStep() {
  const navigate = useNavigate();
  const { draft, update } = useOnboardingDraft();

  useEffect(() => {
    if (!draft.classLevel) navigate('/onboarding/level', { replace: true });
  }, [draft.classLevel, navigate]);

  const subjects = Object.keys(SYLLABUS[draft.classLevel] || {});
  const list = subjects.length ? subjects : FALLBACK;

  const stateOf = (s: string) =>
    draft.strongSubjects.includes(s) ? 'strong' : draft.weakSubjects.includes(s) ? 'weak' : 'none';

  function cycle(s: string) {
    const state = stateOf(s);
    const strong = draft.strongSubjects.filter((x) => x !== s);
    const weak = draft.weakSubjects.filter((x) => x !== s);
    if (state === 'none') strong.push(s);
    else if (state === 'strong') weak.push(s);
    update({ strongSubjects: strong, weakSubjects: weak });
  }

  const picked = draft.strongSubjects.length + draft.weakSubjects.length;

  return (
    <OnboardingLayout
      step={2}
      back="/onboarding/level"
      title="Which subjects do you study?"
      subtitle="Tap once for strong, twice for weak. We'll put weak subjects first and explain them slower."
      footer={
        <Button
          size="lg"
          disabled={picked === 0}
          onClick={() => navigate('/onboarding/language')}
          className="w-full h-12 rounded-xl font-semibold glass-btn text-primary-foreground"
        >
          Continue
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {list.map((s) => {
          const state = stateOf(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => cycle(s)}
              className={`rounded-2xl border p-4 text-left transition ${
                state === 'strong'
                  ? 'border-strong bg-strong/10 ring-2 ring-strong/30'
                  : state === 'weak'
                    ? 'border-weak bg-weak/10 ring-2 ring-weak/30'
                    : 'border-border/70 bg-card/60 hover:bg-card'
              }`}
            >
              <div className="font-semibold">{s}</div>
              <div className="text-xs mt-1 text-muted-foreground">
                {state === 'strong' ? 'Strong 💪' : state === 'weak' ? 'Needs work 🎯' : 'Tap to select'}
              </div>
            </button>
          );
        })}
      </div>
    </OnboardingLayout>
  );
}
