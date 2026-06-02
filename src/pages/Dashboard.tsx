import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubjectStats } from '@/components/dashboard/SubjectStats';
import { RecentChapters } from '@/components/dashboard/RecentChapters';
import { ValidityBanner } from '@/components/dashboard/ValidityBanner';
import { ExamCountdown } from '@/components/dashboard/ExamCountdown';
import { Flame, BookOpen, MessageCircleQuestion, FileCheck, Settings, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();

  const quickActions = [
    { to: '/verify', icon: FileCheck, label: 'Verify My Notes', color: 'bg-amber-500' },
    { to: '#', icon: MessageCircleQuestion, label: 'Ask a Doubt (Coming Soon)', color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen app-bg">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Gyaan</h1>
              <p className="text-xs text-muted-foreground">Class {profile?.class_level || '10'} CBSE</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">{profile?.streak_days || 0} day streak</span>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {profile?.full_name || 'Student'}!</h2>
          <p className="text-muted-foreground">What would you like to study today?</p>
        </section>

        <ValidityBanner />

        <ExamCountdown classLevel={profile?.class_level || '10'} />

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {quickActions.map(action => (
            <Link key={action.label} to={action.to}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold">{action.label}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <SubjectStats classLevel={profile?.class_level || '10'} weakSubjects={profile?.weak_subjects || []} />

        <RecentChapters />
      </main>
    </div>
  );
}
