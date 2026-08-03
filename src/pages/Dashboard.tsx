import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SubjectStats } from '@/components/dashboard/SubjectStats';
import { RecentChapters } from '@/components/dashboard/RecentChapters';
import { ValidityBanner } from '@/components/dashboard/ValidityBanner';
import { ExamCountdown } from '@/components/dashboard/ExamCountdown';
import { AttendanceCard } from '@/components/dashboard/AttendanceCard';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { getExams } from '@/lib/exams';
import { pushNotification } from '@/lib/notifications';
import { MessageCircleQuestion, LogOut } from 'lucide-react';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { useT } from '@/lib/i18n';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const { t } = useT();
  const [unlockedCount, setUnlockedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const exams = getExams(profile?.class_level || '10');
    exams.forEach((e) => {
      if (e.days > 30) return;
      const flag = `exam-notif-${e.key}-${e.date.getFullYear()}-${e.days <= 7 ? '7' : '30'}`;
      if (localStorage.getItem(flag)) return;
      localStorage.setItem(flag, '1');
      pushNotification(user.id, {
        type: 'exam',
        title: `${e.label} in ${e.days} days`,
        body: e.days <= 7 ? 'Final stretch — focus on detailed concepts now!' : 'Time to ramp up your revision.',
        link: '/dashboard',
      });
    });
  }, [user, profile?.class_level]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count } = await supabase
        .from('unlocked_chapters')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setUnlockedCount(count ?? 0);
    })();
  }, [user]);

  const exams = getExams(profile?.class_level || '10');
  const boardExam = exams.find((e) => e.boardYear) || exams[0];

  const quickActions = [
    { to: '#', icon: MessageCircleQuestion, label: t('askDoubtSoon') },
  ];

  return (
    <div className="min-h-screen app-bg">
      {!profile ? (
        <DashboardSkeleton />
      ) : (
      <>
      <header className="bg-card/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-display font-extrabold text-lg">ज्ञ</span>
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight">Gyaan</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <Button variant="outline" size="sm" onClick={signOut} className="border-primary text-primary hover:bg-primary-soft">
              <LogOut className="w-4 h-4 mr-1.5" />{t('signOut')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Welcome */}
        <section className="mb-6">
          <p className="text-sm text-muted-foreground">{t('welcomeBack')}</p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            {(profile?.full_name || 'Student').split(' ')[0]} 👋
          </h1>
          {boardExam && (
            <span className="mt-2 inline-block text-sm font-semibold text-weak-soft-foreground bg-weak-soft px-3 py-1 rounded-full">
              {(boardExam.boardYear ? t('boards') : boardExam.label.replace(' (predicted)', ''))} {t('inDays', { n: boardExam.days })}
            </span>
          )}
        </section>

        {/* Metric cards */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl bg-primary-soft p-4">
            <div className="font-display text-3xl font-extrabold text-primary">{profile?.streak_days || 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t('dayStreak')}</div>
          </div>
          <div className="rounded-xl bg-strong-soft p-4">
            <div className="font-display text-3xl font-extrabold text-strong">
              {unlockedCount === null ? '—' : unlockedCount}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{t('unlocked')}</div>
          </div>
        </section>

        <ValidityBanner />
        <AttendanceCard />

        {/* Quick actions */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.to}>
              <Card className="hover:shadow-md transition-all cursor-pointer h-full border-l-4 border-l-primary">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-soft rounded-lg flex items-center justify-center shrink-0">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm leading-snug">{action.label}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <SubjectStats classLevel={profile?.class_level || '10'} weakSubjects={profile?.weak_subjects || []} />

        <ExamCountdown classLevel={profile?.class_level || '10'} />

        <RecentChapters />
      </main>
      </>
      )}
    </div>
  );
}
