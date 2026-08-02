import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Lock, BookOpen } from 'lucide-react';
import { getSubjectSyllabus } from '@/lib/syllabus';

// Every subject keeps the same signature blue accent line
const ACCENT = 'border-l-primary';
const ICON_BG = 'bg-primary';

export default function Subject() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  const subjectName = subjectId || 'Science';
  const classLevel = profile?.class_level || '10';

  const { book, chapters } = getSubjectSyllabus(classLevel, subjectName);
  const accent = ACCENT;
  const iconBg = ICON_BG;

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
            {subjectName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Class {classLevel} CBSE {classLevel === '9' ? '· 2026-27 NCERT' : ''}
          </p>
          {book && (
            <p className="text-sm font-semibold text-primary mt-1">Book: {book}</p>
          )}
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
                  <Card className={`bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer h-full relative border-l-4 ${accent} rounded-xl`}>
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
                      {chapter.advanced && (
                        <Badge variant="outline" className="mb-2 border-primary/40 text-primary">Advanced · optional</Badge>
                      )}
                      {chapter.topics && (
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-3">
                          {chapter.topics}
                        </p>
                      )}
                      {chapter.note && (
                        <p className="text-xs text-weak font-medium mb-3">{chapter.note}</p>
                      )}
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
