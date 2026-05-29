import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock } from 'lucide-react';

const RECENT_CHAPTERS = [
  { subject: 'Physics', chapter: 'Motion', time: '2 hours ago' },
  { subject: 'Chemistry', chapter: 'Chemical Reactions', time: 'Yesterday' },
  { subject: 'Mathematics', chapter: 'Quadratic Equations', time: '2 days ago' },
];

export function RecentChapters() {
  const recent = RECENT_CHAPTERS;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {recent.map((item, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <Badge variant="outline" className="w-fit mb-2">{item.subject}</Badge>
              <CardTitle className="text-lg">{item.chapter}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.time}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>Resume</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
