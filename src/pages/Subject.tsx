import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Lock, BookOpen } from 'lucide-react';

interface Chapter {
  name: string;
  number: number;
  isFree: boolean;
}

const CHAPTERS_BY_SUBJECT: Record<string, Chapter[]> = {
  Physics: [
    { name: 'Motion', number: 1, isFree: true },
    { name: 'Force and Laws of Motion', number: 2, isFree: true },
    { name: 'Gravitation', number: 3, isFree: false },
    { name: 'Work and Energy', number: 4, isFree: false },
    { name: 'Sound', number: 5, isFree: false },
    { name: 'Electricity', number: 6, isFree: false },
    { name: 'Light - Reflection and Refraction', number: 7, isFree: false },
    { name: 'Magnetic Effects of Electric Current', number: 8, isFree: false },
  ],
  Chemistry: [
    { name: 'Chemical Reactions and Equations', number: 1, isFree: true },
    { name: 'Acids, Bases and Salts', number: 2, isFree: true },
    { name: 'Metals and Non-metals', number: 3, isFree: false },
    { name: 'Carbon and its Compounds', number: 4, isFree: false },
    { name: 'Periodic Classification of Elements', number: 5, isFree: false },
  ],
  Mathematics: [
    { name: 'Real Numbers', number: 1, isFree: true },
    { name: 'Polynomials', number: 2, isFree: true },
    { name: 'Pair of Linear Equations', number: 3, isFree: false },
    { name: 'Quadratic Equations', number: 4, isFree: false },
    { name: 'Arithmetic Progressions', number: 5, isFree: false },
    { name: 'Triangles', number: 6, isFree: false },
    { name: 'Coordinate Geometry', number: 7, isFree: false },
    { name: 'Trigonometry', number: 8, isFree: false },
    { name: 'Applications of Trigonometry', number: 9, isFree: false },
    { name: 'Circles', number: 10, isFree: false },
    { name: 'Areas Related to Circles', number: 11, isFree: false },
    { name: 'Surface Areas and Volumes', number: 12, isFree: false },
    { name: 'Statistics', number: 13, isFree: false },
    { name: 'Probability', number: 14, isFree: false },
  ],
  Biology: [
    { name: 'Life Processes', number: 1, isFree: true },
    { name: 'Control and Coordination', number: 2, isFree: true },
    { name: 'How do Organisms Reproduce', number: 3, isFree: false },
    { name: 'Heredity and Evolution', number: 4, isFree: false },
    { name: 'Our Environment', number: 5, isFree: false },
    { name: 'Management of Natural Resources', number: 6, isFree: false },
  ],
  English: [
    { name: 'A Letter to God', number: 1, isFree: true },
    { name: 'Nelson Mandela', number: 2, isFree: true },
    { name: 'Two Stories about Flying', number: 3, isFree: false },
    { name: 'From the Diary of Anne Frank', number: 4, isFree: false },
    { name: 'The Hundred Dresses - I', number: 5, isFree: false },
    { name: 'The Hundred Dresses - II', number: 6, isFree: false },
    { name: 'Glimpses of India', number: 7, isFree: false },
    { name: 'Mijbil the Otter', number: 8, isFree: false },
  ],
  'Social Science': [
    { name: 'The Rise of Nationalism in Europe', number: 1, isFree: true },
    { name: 'Nationalism in India', number: 2, isFree: true },
    { name: 'The Making of a Global World', number: 3, isFree: false },
    { name: 'Resources and Development', number: 4, isFree: false },
    { name: 'Forest and Wildlife Resources', number: 5, isFree: false },
    { name: 'Water Resources', number: 6, isFree: false },
    { name: 'Power Sharing', number: 7, isFree: false },
    { name: 'Federalism', number: 8, isFree: false },
    { name: 'Development', number: 9, isFree: false },
    { name: 'Money and Credit', number: 10, isFree: false },
  ],
  Hindi: [
    { name: 'Surdas ke Pad', number: 1, isFree: true },
    { name: 'Ram-Lakshman-Parshuram Samvad', number: 2, isFree: true },
    { name: 'Avinash w - Saphalta Ki Raah', number: 3, isFree: false },
    { name: 'Topi Shukla', number: 4, isFree: false },
    { name: 'Atithi Devo Bhava', number: 5, isFree: false },
  ],
  'Computer Science': [
    { name: 'Introduction to Programming', number: 1, isFree: true },
    { name: 'Functions and Recursion', number: 2, isFree: true },
    { name: 'Data Structures', number: 3, isFree: false },
    { name: 'Object Oriented Programming', number: 4, isFree: false },
    { name: 'File Handling', number: 5, isFree: false },
    { name: 'Database Management', number: 6, isFree: false },
  ],
};

const SUBJECT_COLORS: Record<string, string> = {
  Physics: 'from-blue-500 to-blue-600',
  Chemistry: 'from-green-500 to-green-600',
  Mathematics: 'from-purple-500 to-purple-600',
  Biology: 'from-teal-500 to-teal-600',
  English: 'from-amber-500 to-amber-600',
  'Social Science': 'from-red-500 to-red-600',
  Hindi: 'from-orange-500 to-orange-600',
  'Computer Science': 'from-cyan-500 to-cyan-600',
};

const SUBJECT_ICONS: Record<string, string> = {
  Physics: 'Atom',
  Chemistry: 'FlaskConical',
  Mathematics: 'Calculator',
  Biology: 'Leaf',
  English: 'BookOpen',
  'Social Science': 'Globe',
  Hindi: 'Languages',
  'Computer Science': 'Monitor',
};

export default function Subject() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  const subjectName = subjectId || 'Physics';
  const chapters = CHAPTERS_BY_SUBJECT[subjectName] || [];
  const gradient = SUBJECT_COLORS[subjectName] || 'from-gray-500 to-gray-600';

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <div className="min-h-screen app-bg">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-8 mb-8 text-white`}>
          <h1 className="text-3xl font-bold mb-2">{subjectName}</h1>
          <p className="opacity-90">Class {profile?.class_level || '10'} CBSE</p>
          <p className="text-sm opacity-75 mt-2">{chapters.length} chapters available</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                </Card>
              ))
            : chapters.map(chapter => (
                <Link
                  key={chapter.name}
                  to={`/subject/${subjectId}/${encodeURIComponent(chapter.name)}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-all hover:border-emerald-200 cursor-pointer h-full relative overflow-hidden">
                    {chapter.isFree && (
                      <Badge className="absolute top-3 right-3 bg-emerald-500">Free</Badge>
                    )}
                    {!chapter.isFree && (
                      <div className="absolute top-3 right-3">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                          {chapter.number}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{chapter.name}</CardTitle>
                          <CardDescription>Chapter {chapter.number}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span>View Notes</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </main>
    </div>
  );
}
