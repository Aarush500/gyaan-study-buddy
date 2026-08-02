import { Link } from 'react-router-dom';
import { SYLLABUS } from '@/lib/syllabus';
import {
  FlaskConical, Sigma, Globe2, BookOpen,
  Landmark, LineChart, Monitor, Atom, Leaf, TestTube, type LucideIcon,
} from 'lucide-react';

const DEFAULT_SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Social Science', 'English'];

const ICONS: Record<string, LucideIcon> = {
  Science: FlaskConical,
  Physics: Atom,
  Chemistry: TestTube,
  Biology: Leaf,
  Mathematics: Sigma,
  'Social Science': Globe2,
  History: Landmark,
  Economics: LineChart,
  English: BookOpen,
  'Computer Science': Monitor,
};

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
  const fromSyllabus = Object.keys(SYLLABUS[classLevel] || {});
  const subjects = fromSyllabus.length ? [...fromSyllabus] : [...DEFAULT_SUBJECTS];
  // Also surface any weak subjects not in the syllabus set (e.g. legacy Physics)
  weakSubjects.forEach((s) => { if (!subjects.includes(s)) subjects.push(s); });
  const ordered = [...subjects].sort((a, b) => Number(weak.has(b)) - Number(weak.has(a)));

  return (
    <section className="mb-8">
      <h2 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-3">
        Your Subjects
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {ordered.map((name) => {
          const isWeak = weak.has(name);
          const Icon = ICONS[name] || BookOpen;
          const progress = progressFor(name, isWeak);
          const chapterCount = SYLLABUS[classLevel]?.[name]?.chapters.length ?? 0;
          return (
            <Link key={name} to={`/subject/${name}`} className="block">
              <div
                className={`relative aspect-square rounded-2xl bg-card p-3 flex flex-col items-center justify-between text-center hover:shadow-lg hover:-translate-y-0.5 transition-all border-2 ${
                  isWeak ? 'border-weak/50' : 'border-border hover:border-primary/50'
                }`}
              >
                <span
                  className={`mt-1 w-12 h-12 rounded-2xl border flex items-center justify-center ${
                    isWeak ? 'bg-weak-soft border-weak/30' : 'bg-primary-soft border-primary/20'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isWeak ? 'text-weak' : 'text-primary'}`} />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold leading-tight text-foreground line-clamp-2">
                    {name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {chapterCount ? `${chapterCount} chapters` : 'Coming soon'}
                  </span>
                </div>
                <div className="w-full">
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    {/* signature blue progress line — same for every subject */}
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">{progress}%</span>
                </div>
                {isWeak && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-weak" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
