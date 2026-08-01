import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Lock, BookOpen } from 'lucide-react';
import { getSubjectSyllabus, SCIENCE_ALIASES } from '@/lib/syllabus';

// Correct NCERT syllabus per class (2026-27)
const SYLLABUS: Record<string, Record<string, Chapter[]>> = {
  '9': {
    Mathematics: mk([
      'Number Systems', 'Polynomials Part 1', 'Polynomials Part 2', 'Coordinate Geometry',
      'Linear Equations in Two Variables', "Introduction to Euclid's Geometry", 'Lines and Angles',
      'Triangles', 'Quadrilaterals', 'Circles', "Heron's Formula", 'Surface Areas and Volumes',
      'Statistics', 'Arithmetic Progressions', 'Pair of Linear Equations', 'Geometric Progression',
    ]),
    Science: mk([
      'Matter in Our Surroundings', 'Is Matter Around Us Pure', 'Atoms and Molecules',
      'Structure of the Atom', 'The Fundamental Unit of Life', 'Tissues', 'Motion',
      'Force and Laws of Motion', 'Work and Energy', 'Sound', 'Why Do We Fall Ill',
      'Natural Resources', 'Earth Science: Natural Cycles and Earth Systems',
      'Earth Science: Environmental Balance and Radiation',
    ]),
    'Social Science': mk([
      'Early Human Civilisations and India', 'Ancient Indian Civilisations (Harappan Culture)',
      'Bhakti and Sufi Traditions', 'Medieval India', 'Colonial India and Resistance',
      'Physical Features of India', 'Climate and Natural Vegetation', 'Plate Tectonics',
      'Interior and Composition of Earth', 'Ocean Relief and Biomes', 'Democracy and Elections',
      'Justice and Authority', 'Indian Economy and Financial Literacy',
      'Budgeting and Personal Finance', 'Entrepreneurship and Investment Basics',
      'India in the Global World',
    ]),
    English: mk([
      'Kaveri: Prose 1', 'Kaveri: Poetry 1', 'Kaveri: Prose 2', 'Kaveri: Poetry 2',
      'Persuasive Essays', 'Literary Analysis', 'Research Writing', 'Creative Writing',
    ]),
    Sanskrit: mk([
      'Sharda: Prose', 'Sharda: Poetry', 'Grammar: Tatpurusha Samas', 'Grammar: Avyaya',
      'Dialogue Completion', 'Story Completion',
    ]),
  },
  '10': {
    Mathematics: mk([
      'Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables',
      'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry',
      'Introduction to Trigonometry', 'Some Applications of Trigonometry', 'Circles',
      'Areas Related to Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability',
    ]),
    Science: mk([
      'Chemical Reactions and Equations', 'Acids Bases and Salts', 'Metals and Non-metals',
      'Carbon and its Compounds', 'Life Processes', 'Control and Coordination',
      'How do Organisms Reproduce', 'Heredity', 'Light Reflection and Refraction',
      'Human Eye and Colourful World', 'Electricity', 'Magnetic Effects of Electric Current',
      'Our Environment',
    ]),
    'Social Science': mk([
      'The Rise of Nationalism in Europe', 'Nationalism in India', 'The Making of a Global World',
      'The Age of Industrialisation', 'Print Culture and the Modern World',
      'Resources and Development', 'Forest and Wildlife Resources', 'Water Resources',
      'Agriculture', 'Minerals and Energy Resources', 'Manufacturing Industries',
      'Lifelines of National Economy', 'Power Sharing', 'Federalism', 'Democracy and Diversity',
      'Gender Religion and Caste', 'Political Parties', 'Outcomes of Democracy',
      'Challenges to Democracy', 'Development', 'Sectors of the Indian Economy',
      'Money and Credit', 'Globalisation and the Indian Economy', 'Consumer Rights',
    ]),
    English: mk([
      'A Letter to God', 'Nelson Mandela', 'Two Stories about Flying',
      'From the Diary of Anne Frank', 'The Hundred Dresses I', 'The Hundred Dresses II',
      'Glimpses of India', 'Mijbil the Otter', 'Madam Rides the Bus', 'The Sermon at Benares',
      'The Proposal',
    ]),
  },
};

// Legacy separate-science subjects map to the integrated Science book
const SCIENCE_ALIASES = ['Physics', 'Chemistry', 'Biology'];

const SUBJECT_ACCENT: Record<string, string> = {
  Physics: 'border-l-blue-500',
  Chemistry: 'border-l-green-500',
  Science: 'border-l-emerald-500',
  Mathematics: 'border-l-primary',
  Biology: 'border-l-teal-500',
  English: 'border-l-amber-500',
  'Social Science': 'border-l-rose-500',
  Hindi: 'border-l-orange-500',
  Sanskrit: 'border-l-orange-500',
  'Computer Science': 'border-l-cyan-500',
};

const SUBJECT_ICON_BG: Record<string, string> = {
  Physics: 'bg-blue-500',
  Chemistry: 'bg-green-500',
  Science: 'bg-emerald-500',
  Mathematics: 'bg-primary',
  Biology: 'bg-teal-500',
  English: 'bg-amber-500',
  'Social Science': 'bg-rose-500',
  Hindi: 'bg-orange-500',
  Sanskrit: 'bg-orange-500',
  'Computer Science': 'bg-cyan-500',
};

export default function Subject() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  const subjectName = subjectId || 'Science';
  const classLevel = profile?.class_level || '10';

  const classSyllabus = SYLLABUS[classLevel] || SYLLABUS['10'];
  let lookup = subjectName;
  // Class 9 integrated Science: legacy Physics/Chemistry/Biology -> Science
  if (classLevel === '9' && SCIENCE_ALIASES.includes(subjectName)) lookup = 'Science';
  const chapters = classSyllabus[lookup] || classSyllabus[subjectName] || [];

  const accent = SUBJECT_ACCENT[lookup] || 'border-l-primary';
  const iconBg = SUBJECT_ICON_BG[lookup] || 'bg-primary';

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen app-bg">
      <header className="bg-card/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Clean header — no solid colour banner */}
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {lookup === 'Science' && SCIENCE_ALIASES.includes(subjectName) ? subjectName : subjectName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Class {classLevel} CBSE {classLevel === '9' ? '· 2026-27 NCERT' : ''}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{chapters.length} chapters available</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-l-4 border-l-muted">
                  <CardContent className="pt-6 space-y-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </CardContent>
                </Card>
              ))
            : chapters.map(chapter => (
                <Link
                  key={chapter.name}
                  to={`/subject/${subjectId}/${encodeURIComponent(chapter.name)}`}
                  className="block"
                >
                  <Card className={`bg-card hover:shadow-lg transition-all cursor-pointer h-full relative border-l-4 ${accent} rounded-xl`}>
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-9 h-9 ${iconBg} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                          {chapter.number}
                        </div>
                        {chapter.isFree ? (
                          <Badge className="bg-strong text-strong-foreground hover:bg-strong">FREE</Badge>
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground mt-1" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        {subjectName}
                      </p>
                      <h3 className="font-semibold text-base leading-snug text-foreground mb-3">
                        {chapter.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span>View Notes</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>

        {chapters.length === 0 && !loading && (
          <p className="text-center text-muted-foreground py-12">
            No chapters found for {subjectName} in Class {classLevel}.
          </p>
        )}
      </main>
    </div>
  );
}
