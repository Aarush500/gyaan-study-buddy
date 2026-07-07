import { Link } from 'react-router-dom';

const SUBJECTS_BY_CLASS: Record<string, string[]> = {
  '9': ['Science', 'Mathematics', 'Social Science', 'English', 'Sanskrit'],
  '10': ['Science', 'Mathematics', 'Social Science', 'English', 'Hindi'],
};
const DEFAULT_SUBJECTS = ['Science', 'Mathematics', 'Social Science', 'English', 'Hindi'];

interface SubjectStatsProps {
  classLevel: string;
  weakSubjects?: string[];
}

// Deterministic pseudo-progress so the bar is stable per subject
function progressFor(name: string, weak: boolean): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 100;
  return weak ? 25 + (h % 25) : 65 + (h % 30);
}

export function SubjectStats({ classLevel, weakSubjects = [] }: SubjectStatsProps) {
  const weak = new Set(weakSubjects);
  const subjects = SUBJECTS_BY_CLASS[classLevel] || DEFAULT_SUBJECTS;
  // Also surface any weak subjects not in the default set (e.g. legacy Physics)
  weakSubjects.forEach((s) => { if (!subjects.includes(s)) subjects.push(s); });
  const ordered = [...subjects].sort((a, b) => Number(weak.has(b)) - Number(weak.has(a)));

  return (
    <section className="mb-8">
      <h2 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-3">
        Your Subjects
      </h2>
      <div className="space-y-3">
        {ordered.map((name) => {
          const isWeak = weak.has(name);
          const tone = isWeak ? 'weak' : 'strong';
          const progress = progressFor(name, isWeak);
          return (
            <Link key={name} to={`/subject/${name}`} className="block">
              <div
                className={`rounded-xl bg-card border border-border border-l-4 ${
                  isWeak ? 'border-l-weak' : 'border-l-strong'
                } p-4 hover:shadow-md transition-all`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{name}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      isWeak ? 'bg-weak text-weak-foreground' : 'bg-strong text-strong-foreground'
                    }`}
                  >
                    {isWeak ? 'Needs work' : 'Strong'}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${tone === 'weak' ? 'bg-weak' : 'bg-strong'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
