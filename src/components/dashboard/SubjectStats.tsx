import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Atom, FlaskConical, Calculator, Leaf, BookOpen, Globe, Languages, Monitor } from 'lucide-react';

const SUBJECTS = [
  { id: 'Physics', name: 'Physics', icon: Atom, color: 'bg-blue-500', description: 'Mechanics, Light, Electricity' },
  { id: 'Chemistry', name: 'Chemistry', icon: FlaskConical, color: 'bg-green-500', description: 'Reactions, Elements, Compounds' },
  { id: 'Mathematics', name: 'Mathematics', icon: Calculator, color: 'bg-purple-500', description: 'Algebra, Geometry, Calculus' },
  { id: 'Biology', name: 'Biology', icon: Leaf, color: 'bg-teal-500', description: 'Life processes, Human body' },
  { id: 'English', name: 'English', icon: BookOpen, color: 'bg-amber-500', description: 'Literature, Grammar, Writing' },
  { id: 'Social Science', name: 'Social Science', icon: Globe, color: 'bg-red-500', description: 'History, Geography, Civics' },
  { id: 'Hindi', name: 'Hindi', icon: Languages, color: 'bg-orange-500', description: 'Literature, Grammar, Writing' },
  { id: 'Computer Science', name: 'Computer Science', icon: Monitor, color: 'bg-cyan-500', description: 'Programming, Data, Networks' },
];

interface SubjectStatsProps {
  classLevel: string;
  weakSubjects?: string[];
}

export function SubjectStats({ classLevel, weakSubjects = [] }: SubjectStatsProps) {
  const weak = new Set(weakSubjects);
  const ordered = [...SUBJECTS].sort((a, b) => Number(weak.has(b.id)) - Number(weak.has(a.id)));
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-1">Subjects - Class {classLevel} CBSE</h2>
      {weak.size > 0 && (
        <p className="text-sm text-muted-foreground mb-4">Your weak subjects are pinned first — focus here to score more.</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ordered.map(subject => (
          <Link key={subject.id} to={`/subject/${subject.id}`}>
            <Card className={`hover:shadow-lg transition-all cursor-pointer h-full group relative ${weak.has(subject.id) ? 'ring-1 ring-weak/50' : 'hover:border-emerald-200'}`}>
              <CardContent className="pt-6">
                {weak.has(subject.id) && (
                  <Badge className="absolute top-3 right-3 bg-weak text-weak-foreground hover:bg-weak text-[10px]">Focus</Badge>
                )}
                <div className={`w-12 h-12 ${subject.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <subject.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold">{subject.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{subject.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
