import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { computeStreak, checkedInToday, getTodayKey } from '@/lib/streak';
import { pushNotification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Flame, CalendarCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

export function AttendanceCard() {
  const { user } = useAuth();
  const [days, setDays] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('attendance')
      .select('day')
      .eq('user_id', user.id)
      .order('day', { ascending: false })
      .limit(400);
    setDays((data || []).map((d: { day: string }) => d.day));
    setLoaded(true);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const streak = computeStreak(days);
  const done = checkedInToday(days);

  async function checkIn() {
    if (!user || done || saving) return;
    setSaving(true);
    const today = getTodayKey();
    const { error } = await supabase.from('attendance').insert({ user_id: user.id, day: today });
    if (error && !error.message.includes('duplicate')) {
      toast.error('Could not check in. Try again.');
      setSaving(false);
      return;
    }
    const newDays = [today, ...days];
    setDays(newDays);
    const newStreak = computeStreak(newDays);
    toast.success(`Checked in! ${newStreak} day streak 🔥`);
    await pushNotification(user.id, {
      type: 'attendance',
      title: `Daily check-in done — ${newStreak} day streak!`,
      body: 'Keep showing up every day to grow your streak.',
    });
    setSaving(false);
  }

  if (!loaded) return null;

  // last 7 days dots
  const last7: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(getTodayKey() + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - i);
    last7.push(d.toISOString().slice(0, 10));
  }
  const set = new Set(days);

  return (
    <div className="glass-strong rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl grid place-items-center ${streak > 0 ? 'bg-weak-soft' : 'bg-secondary'}`}>
          <Flame className={`w-5 h-5 ${streak > 0 ? 'text-weak' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <p className="font-semibold flex items-center gap-2">
            <span className="font-display text-2xl font-extrabold text-weak">{streak}</span> day streak
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {last7.map((d) => (
              <span
                key={d}
                title={d}
                className={`w-3 h-3 rounded-full ${set.has(d) ? 'bg-strong' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>
      </div>
      <Button onClick={checkIn} disabled={done || saving} className="glass-btn">
        {done ? <><Check className="w-4 h-4 mr-2" /> Checked in today</> : <><CalendarCheck className="w-4 h-4 mr-2" /> Check in</>}
      </Button>
    </div>
  );
}
