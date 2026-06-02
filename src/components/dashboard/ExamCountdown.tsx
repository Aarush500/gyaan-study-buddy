import { getExams, formatExamDate } from '@/lib/exams';
import { CalendarDays, GraduationCap, Target } from 'lucide-react';

export function ExamCountdown({ classLevel }: { classLevel: string }) {
  const exams = getExams(classLevel);

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary" /> Exam Countdown
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {exams.map((e) => {
          const urgent = e.days <= 30;
          return (
            <div key={e.key} className={`glass-strong rounded-2xl p-5 ${e.boardYear ? 'ring-1 ring-primary/40' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl grid place-items-center ${e.boardYear ? 'bg-primary-soft' : urgent ? 'bg-weak-soft' : 'bg-strong-soft'}`}>
                  {e.boardYear ? <GraduationCap className="w-5 h-5 text-primary" /> : <Target className={`w-5 h-5 ${urgent ? 'text-weak' : 'text-strong'}`} />}
                </div>
                {e.predicted && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Predicted</span>}
              </div>
              <p className="font-semibold text-sm">{e.label}</p>
              <div className={`font-display text-3xl font-extrabold mt-1 ${e.boardYear ? 'text-primary' : urgent ? 'text-weak' : 'text-foreground'}`}>
                {e.days}<span className="text-sm font-medium text-muted-foreground"> days</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{formatExamDate(e.date)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}