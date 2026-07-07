import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const FREE_CHAPTERS = [
  { subject: 'Science', className: 'Class 10', chapter: 'Chemical Reactions and Equations', time: '10 min read' },
  { subject: 'Mathematics', className: 'Class 10', chapter: 'Real Numbers', time: '12 min read' },
  { subject: 'Social Science', className: 'Class 10', chapter: 'The Rise of Nationalism in Europe', time: '11 min read' },
];

export function RecentChapters() {
  return (
    <section className="mb-8">
      <h2 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-3">
        Free Chapters
      </h2>
      <div className="space-y-3">
        {FREE_CHAPTERS.map((item, i) => (
          <Link
            key={i}
            to={`/subject/${item.subject}/${encodeURIComponent(item.chapter)}`}
            className="block"
          >
            <div className="rounded-xl bg-card border border-border border-l-4 border-l-primary p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{item.chapter}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    {item.className} · {item.subject}
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
                  </p>
                </div>
                <span className="text-[11px] bg-strong-soft text-strong px-2 py-0.5 rounded-full font-semibold shrink-0">
                  FREE
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
