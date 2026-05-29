import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
}

export function SubjectStats({ classLevel }: SubjectStatsProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">Subjects - Class {classLevel} CBSE</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SUBJECTS.map(subject => (
          <Link key={subject.id} to={`/subject/${subject.id}`}>
            <Card className="hover:shadow-lg transition-all hover:border-emerald-200 cursor-pointer h-full group">
              <CardContent className="pt-6">
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
