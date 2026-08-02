import { Link } from 'react-router-dom';
import { SYLLABUS } from '@/lib/syllabus';
import {
  FlaskConical, Sigma, Globe2, BookOpen, Languages, ScrollText,
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
          return (
            <Link key={name} to={`/subject/${name}`} className="block">
              <div
                className={`relative aspect-square rounded-2xl bg-card border border-border p-3 flex flex-col items-center justify-center text-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all ${
                  isWeak ? 'ring-1 ring-weak/40' : ''
                }`}
              >
                <span
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isWeak ? 'bg-weak-soft' : 'bg-primary-soft'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isWeak ? 'text-weak' : 'text-primary'}`} />
                </span>
                <span className="text-xs font-semibold leading-tight text-foreground line-clamp-2">
                  {name}
                </span>
                <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isWeak ? 'bg-weak' : 'bg-strong'}`}
                    style={{ width: `${progress}%` }}
                  />
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
