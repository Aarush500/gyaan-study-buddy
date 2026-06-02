import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { isUnlockValid, daysUntil, computeValidity } from '@/lib/validity';
import { CalendarClock, ShieldCheck } from 'lucide-react';

export function ValidityBanner() {
  const { user } = useAuth();
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('unlocked_chapters')
        .select('valid_until, is_free')
        .eq('user_id', user.id);
      const paid = (data || []).filter((u) => u.is_free !== true && isUnlockValid(u.valid_until));
      setCount(paid.length);
      // soonest-expiring valid unlock
      const dates = paid.map((u) => u.valid_until).filter(Boolean).sort();
      setValidUntil(dates[0] || null);
      setLoaded(true);
    })();
  }, [user]);

  if (!loaded || count === 0) return null;

  const days = daysUntil(validUntil);
  const cycleEnd = validUntil || computeValidity().validUntil;
  const endLabel = new Date(cycleEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const expiringSoon = days != null && days <= 30;

  return (
    <div className="glass-strong rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl grid place-items-center ${expiringSoon ? 'bg-weak-soft' : 'bg-strong-soft'}`}>
          {expiringSoon ? <CalendarClock className="w-5 h-5 text-weak" /> : <ShieldCheck className="w-5 h-5 text-strong" />}
        </div>
        <div>
          <p className="font-semibold">{count} chapter{count > 1 ? 's' : ''} unlocked</p>
          <p className="text-sm text-muted-foreground">Access valid till {endLabel}</p>
        </div>
      </div>
      {days != null && (
        <div className="text-right">
          <div className={`font-display text-2xl font-extrabold ${expiringSoon ? 'text-weak' : 'text-strong'}`}>{days}</div>
          <div className="text-xs text-muted-foreground">days left</div>
        </div>
      )}
    </div>
  );
}