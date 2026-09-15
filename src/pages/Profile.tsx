import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { SYLLABUS } from '@/lib/syllabus';
import { CLASSES, LANGUAGES, STUDY_STYLES } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';

const FALLBACK = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Social Science', 'English'];

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState('9');
  const [language, setLanguage] = useState('English');
  const [style, setStyle] = useState('detailed');
  const [strong, setStrong] = useState<string[]>([]);
  const [weak, setWeak] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name || '');
    setClassLevel(profile.class_level || '9');
    setLanguage(profile.preferred_language || 'English');
    setStyle(profile.study_style || 'detailed');
    setStrong(profile.strong_subjects || []);
    setWeak(profile.weak_subjects || []);
  }, [profile]);

  const subjects = Object.keys(SYLLABUS[classLevel] || {});
  const list = subjects.length ? subjects : FALLBACK;

  const stateOf = (s: string) => (strong.includes(s) ? 'strong' : weak.includes(s) ? 'weak' : 'none');

  function cycle(s: string) {
    const state = stateOf(s);
    const nextStrong = strong.filter((x) => x !== s);
    const nextWeak = weak.filter((x) => x !== s);
    if (state === 'none') nextStrong.push(s);
    else if (state === 'strong') nextWeak.push(s);
    setStrong(nextStrong);
    setWeak(nextWeak);
  }

  async function save() {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: name.trim() || 'Student',
      class_level: classLevel,
      preferred_language: language,
      study_style: style,
      strong_subjects: strong,
      weak_subjects: weak,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Couldn't save changes", description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Changes saved' });
    navigate('/dashboard');
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-6">
      <h2 className="font-display text-lg font-extrabold mb-3">{title}</h2>
      {children}
    </section>
  );

  const chip = (active: boolean) =>
    `rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
      active ? 'border-primary bg-primary-soft text-primary ring-2 ring-primary/25' : 'border-border/70 bg-card/60 hover:bg-card'
    }`;

  return (
    <div className="min-h-screen app-bg">
      <header className="bg-card/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-xl font-extrabold tracking-tight">Your profile</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
        <Section title="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-12 rounded-xl" />
        </Section>

        <Section title="Class">
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((c) => (
              <button key={c} type="button" onClick={() => setClassLevel(c)} className={chip(classLevel === c)}>
                Class {c}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Subjects">
          <p className="text-sm text-muted-foreground mb-3">Tap once for strong, twice for needs work.</p>
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
        </Section>

        <Section title="Language">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button key={l} type="button" onClick={() => setLanguage(l)} className={chip(language === l)}>
                {l}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Study style">
          <div className="grid gap-3">
            {STUDY_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  style === s.id ? 'border-primary bg-primary-soft ring-2 ring-primary/25' : 'border-border/70 bg-card/60 hover:bg-card'
                }`}
              >
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs mt-1 text-muted-foreground">{s.description}</div>
              </button>
            ))}
          </div>
        </Section>
      </main>

      <div className="fixed bottom-0 inset-x-0 border-t bg-card/90 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Button onClick={save} disabled={saving} size="lg" className="w-full h-12 rounded-xl font-semibold">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
