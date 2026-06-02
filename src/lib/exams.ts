// Predicted exam schedules (approximate CBSE pattern). Computes next upcoming date.
function nextOccurrence(month: number, day: number, from: Date = new Date()): Date {
  const y = from.getFullYear();
  let d = new Date(y, month, day);
  if (d.getTime() < from.setHours(0, 0, 0, 0)) d = new Date(y + 1, month, day);
  return d;
}

export function daysBetween(target: Date): number {
  const ms = target.getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export interface ExamInfo {
  key: string;
  label: string;
  date: Date;
  days: number;
  predicted: boolean;
  boardYear: boolean;
}

// Board years: classes 10 and 12
export function getExams(classLevel: string): ExamInfo[] {
  const isBoard = classLevel === '10' || classLevel === '12';
  const midTerm = nextOccurrence(8, 15); // ~15 Sept
  const finalTerm = nextOccurrence(2, 1); // ~1 March (annual exam)
  const board = nextOccurrence(1, 15); // ~15 Feb (CBSE board)

  const list: ExamInfo[] = [
    { key: 'mid', label: 'Mid-Term (predicted)', date: midTerm, days: daysBetween(midTerm), predicted: true, boardYear: false },
    { key: 'final', label: 'Final-Term (predicted)', date: finalTerm, days: daysBetween(finalTerm), predicted: true, boardYear: false },
  ];
  if (isBoard) {
    list.unshift({ key: 'board', label: `Class ${classLevel} Board Exam`, date: board, days: daysBetween(board), predicted: false, boardYear: true });
  }
  return list.sort((a, b) => a.days - b.days);
}

export function formatExamDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
