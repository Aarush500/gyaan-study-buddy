import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { useOnboardingDraft, clearOnboardingDraft } from '@/lib/onboarding';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { STUDY_STYLES } from '@/types';
import { Loader2 } from 'lucide-react';

export default function SummaryStep() {
  const navigate = useNavigate();
  const { draft } = useOnboardingDraft();
  const { updateProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!draft.classLevel) navigate('/onboarding/level', { replace: true });
  }, [draft.classLevel, navigate]);

  const styleName = STUDY_STYLES.find((s) => s.id === draft.studyStyle)?.name || 'Detailed Notes';

  async function finish() {
    setSaving(true);
    const { error } = await updateProfile({
      class_level: draft.classLevel,
      preferred_language: draft.language || 'English',
      study_style: draft.studyStyle || 'detailed',
      strong_subjects: draft.strongSubjects,
      weak_subjects: draft.weakSubjects,
      onboarded: true,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Couldn't save your setup", description: error, variant: 'destructive' });
      return;
    }
    clearOnboardingDraft();
    navigate('/dashboard', { replace: true });
  }

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/60 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-right">{value || '—'}</span>
    </div>
  );

  return (
    <OnboardingLayout
      step={5}
      back="/onboarding/style"
      title="All set 🎉"
      subtitle="Here's your study plan. You can change any of this later."
      footer={
        <Button
          size="lg"
          onClick={finish}
          disabled={saving}
          className="w-full h-12 rounded-xl font-semibold glass-btn text-primary-foreground"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {saving ? 'Saving…' : 'Start studying'}
        </Button>
      }
    >
      <div className="rounded-2xl border border-border/70 bg-card/60 px-4">
        <Row label="Class" value={draft.classLevel ? `Class ${draft.classLevel}` : ''} />
        <Row label="Strong subjects" value={draft.strongSubjects.join(', ')} />
        <Row label="Needs work" value={draft.weakSubjects.join(', ')} />
        <Row label="Language" value={draft.language} />
        <Row label="Study style" value={styleName} />
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        Weak subjects appear first on your dashboard and get slower, more example-heavy explanations.
      </p>
    </OnboardingLayout>
  );
}
