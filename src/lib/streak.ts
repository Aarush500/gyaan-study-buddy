// Compute current daily-check-in streak from a list of attendance days (YYYY-MM-DD).
function todayIST(): string {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function getTodayKey(): string {
  return todayIST();
}

function dayBefore(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function computeStreak(days: string[]): number {
  const set = new Set(days);
  const today = todayIST();
  // Streak only counts if checked in today or yesterday (still active).
  let cursor = set.has(today) ? today : dayBefore(today);
  if (!set.has(cursor)) return 0;
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = dayBefore(cursor);
  }
  return streak;
}

export function checkedInToday(days: string[]): boolean {
  return days.includes(todayIST());
}
