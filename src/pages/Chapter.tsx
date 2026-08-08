import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, callEdgeFunction } from '@/lib/supabase';
import { isUnlockValid, daysUntil } from '@/lib/validity';
import { pushNotification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChapterSkeleton } from '@/components/skeletons/ChapterSkeleton';
import { GeneratingNotes } from '@/components/learn/GeneratingNotes';
import { TopicPageView } from '@/components/learn/TopicPage';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, MessageCircleQuestion, TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle, Lock, Bookmark, Flag, Menu, List, Circle, RotateCcw, X, Sparkles,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { ChapterOutline, ChapterPage } from '@/types';
import { useT } from '@/lib/i18n';

type TopicRef = { key: string; title: string; kind: 'overview' | 'topic'; index: number };

export default function Chapter() {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>();
  const { profile, user } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();

  const [outline, setOutline] = useState<ChapterOutline | null>(null);
  const [pages, setPages] = useState<Record<number, ChapterPage>>({});
  const [loadingOutline, setLoadingOutline] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [resumePoint, setResumePoint] = useState<{ index: number; scrollY: number } | null>(null);
  const restoredRef = useRef(false);

  const chapterName = decodeURIComponent(chapterId || '');
  const subjectName = subjectId || '';
  const classLevel = profile?.class_level || '9';
  const language = profile?.preferred_language || 'English';
  const studyStyle = profile?.study_style || 'detailed';

  const topics: TopicRef[] = outline
    ? [
        { key: 'overview', title: 'Chapter Overview', kind: 'overview', index: -1 },
        ...(outline.topics || []).map((tp, i) => ({
          key: `topic-${i}`, title: tp.title, kind: 'topic' as const, index: i,
        })),
      ]
    : [];
  const activeTopic = topics[current];
  const saveKey = `gyaan:resume:${user?.id || 'guest'}:${subjectName}:${chapterName}`;

  // ---- Autosave / resume ----
  useEffect(() => {
    if (restoredRef.current || !topics.length) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(saveKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { index: number; scrollY: number };
      if (typeof saved?.index === 'number' && saved.index > 0 && saved.index < topics.length) {
        setResumePoint({ index: saved.index, scrollY: saved.scrollY || 0 });
      }
    } catch { /* ignore corrupt autosave */ }
  }, [topics.length, saveKey]);

  useEffect(() => {
    if (!topics.length) return;
    const save = () => {
      try {
        localStorage.setItem(saveKey, JSON.stringify({ index: current, scrollY: window.scrollY, ts: Date.now() }));
      } catch { /* storage full or blocked */ }
    };
    save();
    const id = window.setInterval(save, 5000);
    window.addEventListener('beforeunload', save);
    document.addEventListener('visibilitychange', save);
    return () => {
      save();
      window.clearInterval(id);
      window.removeEventListener('beforeunload', save);
      document.removeEventListener('visibilitychange', save);
    };
  }, [current, topics.length, saveKey]);

  function resume() {
    if (!resumePoint) return;
    setCurrent(resumePoint.index);
    const y = resumePoint.scrollY;
    setResumePoint(null);
    window.setTimeout(() => window.scrollTo({ top: y, behavior: 'smooth' }), 120);
  }

  // ---- Outline (fast, one small AI call) ----
  const fetchOutline = useCallback(async (forceRefresh = false) => {
    setLoadingOutline(true);
    setError(null);
    const { data, error: err } = await callEdgeFunction<{ outline: ChapterOutline }>('generate-chapter-outline', {
      subject: subjectName, chapterName, classLevel, language, studyStyle, forceRefresh,
    });
    if (err) setError(err);
    else if (data?.outline) setOutline(data.outline);
    setLoadingOutline(false);
  }, [subjectName, chapterName, classLevel, language, studyStyle]);

  useEffect(() => {
    if (subjectName && chapterName && profile) fetchOutline(false);
  }, [subjectName, chapterName, profile, fetchOutline]);

  // ---- One topic page at a time ----
  const fetchPage = useCallback(async (topicIndex: number, topicTitle: string, allTopics: string[]) => {
    setLoadingPage(true);
    setPageError(null);
    const { data, error: err } = await callEdgeFunction<{ page: ChapterPage; locked?: boolean }>('generate-chapter-page', {
      subject: subjectName, chapterName, classLevel, language, studyStyle,
      topicIndex, topicTitle, allTopics,
    });
    if (err) setPageError(err);
    else if (data?.page) setPages((p) => ({ ...p, [topicIndex]: data.page }));
    setLoadingPage(false);
  }, [subjectName, chapterName, classLevel, language, studyStyle]);

  useEffect(() => {
    if (!outline || !activeTopic || activeTopic.kind !== 'topic') return;
    const i = activeTopic.index;
    if (pages[i] || loadingPage) return;
    if (i > 0 && !unlocked) return; // paywalled, don't even ask
    fetchPage(i, activeTopic.title, (outline.topics || []).map((tp) => tp.title));
  }, [outline, activeTopic, pages, loadingPage, unlocked, fetchPage]);

  const loadUserState = useCallback(async () => {
    if (!user) return;
    const { data: unlock } = await supabase
      .from('unlocked_chapters')
      .select('valid_until')
      .eq('user_id', user.id).eq('subject', subjectName)
      .eq('chapter_name', chapterName).eq('class_level', classLevel)
      .maybeSingle();
    if (unlock && isUnlockValid(unlock.valid_until)) {
      setUnlocked(true);
      setValidUntil(unlock.valid_until);
    } else {
      setUnlocked(false);
    }
    const { data: bms } = await supabase
      .from('bookmarks').select('topic_key')
      .eq('user_id', user.id).eq('subject', subjectName).eq('chapter_name', chapterName);
    setBookmarks(new Set((bms || []).map((b) => b.topic_key)));
    const { data: prog } = await supabase
      .from('topic_progress').select('topic_key')
      .eq('user_id', user.id).eq('subject', subjectName).eq('chapter_name', chapterName);
    setCompleted(new Set((prog || []).map((p) => p.topic_key)));
  }, [user, subjectName, chapterName, classLevel]);

  useEffect(() => { loadUserState(); }, [loadUserState]);

  async function toggleBookmark(tp: TopicRef) {
    if (!user) return;
    if (bookmarks.has(tp.key)) {
      await supabase.from('bookmarks').delete()
        .eq('user_id', user.id).eq('subject', subjectName)
        .eq('chapter_name', chapterName).eq('topic_key', tp.key);
      const next = new Set(bookmarks); next.delete(tp.key); setBookmarks(next);
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id, subject: subjectName, chapter_name: chapterName,
        topic_key: tp.key, topic_title: tp.title,
      });
      const next = new Set(bookmarks); next.add(tp.key); setBookmarks(next);
      toast.success('Bookmarked');
    }
  }

  async function toggleComplete(tp: TopicRef) {
    if (!user) return;
    if (completed.has(tp.key)) {
      await supabase.from('topic_progress').delete()
        .eq('user_id', user.id).eq('subject', subjectName)
        .eq('chapter_name', chapterName).eq('topic_key', tp.key);
      const next = new Set(completed); next.delete(tp.key); setCompleted(next);
    } else {
      await supabase.from('topic_progress').insert({
        user_id: user.id, subject: subjectName, chapter_name: chapterName,
        topic_key: tp.key, topic_title: tp.title,
      });
      const next = new Set(completed); next.add(tp.key); setCompleted(next);
      toast.success('Marked complete ✅');
      const allDone = topics.length > 0 && next.size >= topics.length;
      await pushNotification(user.id, {
        type: 'topic',
        title: allDone ? `Chapter complete: ${chapterName} 🎉` : `Topic done: ${tp.title}`,
        body: allDone
          ? 'You finished every topic in this chapter. Revise before exams!'
          : `${next.size}/${topics.length} topics done in ${chapterName}.`,
        link: `/subject/${subjectName}/${chapterId}`,
      });
    }
  }

  async function submitReport() {
    if (!user || !reportReason.trim()) return;
    await supabase.from('content_reports').insert({
      user_id: user.id, subject: subjectName, chapter_name: chapterName,
      topic_key: activeTopic?.key || '', topic_title: activeTopic?.title || '',
      reason: reportReason.trim(),
    });
    setReportOpen(false);
    setReportReason('');
    toast.success('Thanks! Report sent 🙏');
  }

  const isLocked = (i: number) => i > 1 && !unlocked; // overview + first topic are free
  const progressPct = topics.length ? Math.round((completed.size / topics.length) * 100) : 0;
  const topicDone = activeTopic ? completed.has(activeTopic.key) : false;

  function goTo(i: number) { setCurrent(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  if (loadingOutline) {
    return <div className="min-h-screen app-bg"><ChapterSkeleton /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center px-4">
        <Card className="max-w-md glass-strong">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t('failedToLoad')}</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button className="glass-btn text-primary-foreground" onClick={() => fetchOutline(false)}>{t('tryAgain')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expiryDays = daysUntil(validUntil);

  const Sidebar = (
    <nav className="space-y-1">
      {topics.map((tp, i) => {
        const locked = isLocked(i);
        const isActive = i === current;
        return (
          <button
            key={tp.key}
            onClick={() => goTo(i)}
            className={`w-full text-left flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition
              ${isActive ? 'glass-strong font-semibold text-foreground' : 'hover:bg-card/60 text-muted-foreground'}`}
          >
            {completed.has(tp.key)
              ? <CheckCircle className="w-4 h-4 shrink-0 text-strong" />
              : <span className="text-xs w-5 shrink-0 opacity-60 text-center">{i + 1}</span>}
            <span className="flex-1 break-words">{tp.title}</span>
            {bookmarks.has(tp.key) && <Bookmark className="w-3.5 h-3.5 fill-weak text-weak shrink-0" />}
            {locked && <Lock className="w-3.5 h-3.5 shrink-0 opacity-60" />}
          </button>
        );
      })}
    </nav>
  );

  const UnlockCta = (
    <div className="rounded-2xl border-2 border-primary bg-primary-soft p-6 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary grid place-items-center mb-3">
        <Lock className="w-5 h-5 text-primary-foreground" />
      </div>
      <div className="font-display text-xl font-extrabold">{t('unlockChapter')}</div>
      <div className="text-sm text-muted-foreground mt-1">{t('firstTopicFree')}</div>
      <div className="mt-3 font-display text-3xl font-extrabold">₹39</div>
      <div className="text-xs text-muted-foreground">Less than a samosa plate 🥟 • Valid for a full year</div>
      <Button
        className="w-full max-w-xs mx-auto mt-4 h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold"
        onClick={() => navigate(`/unlock/${subjectId}/${chapterId}`)}
      >
        {t('unlockFor')} <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen app-bg">
      <header className="glass sticky top-0 z-50 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link to={`/subject/${subjectId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('back')}
          </Link>
          <div className="flex items-center gap-2">
            {unlocked && expiryDays != null && (
              <Badge variant="secondary" className="hidden sm:flex">Valid {expiryDays}d</Badge>
            )}
            <Button
              size="sm"
              onClick={() => setReportOpen(true)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              title="Report a problem with this content"
            >
              <Flag className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Report</span>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden glass">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="app-bg w-80 overflow-y-auto">
                <div className="mt-6 mb-1 font-display font-bold flex items-center gap-2"><List className="w-4 h-4" /> {t('topics')}</div>
                <div className="mb-3 text-sm font-semibold leading-snug break-words">{outline?.title || chapterName}</div>
                {Sidebar}
              </SheetContent>
            </Sheet>
            <Link to={`/doubt/${subjectId}/${chapterId}`}>
              <Button size="sm" className="glass-btn text-primary-foreground">
                <MessageCircleQuestion className="w-4 h-4 mr-2" /> {t('askDoubt')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="glass rounded-2xl p-3 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="px-2 pb-1 font-display font-bold text-sm flex items-center gap-2"><List className="w-4 h-4" /> {t('topics')}</div>
            <div className="px-2 pb-2 text-sm font-semibold leading-snug break-words">{outline?.title || chapterName}</div>
            <div className="px-2 pb-3">
              <Progress value={progressPct} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{completed.size}/{topics.length} done • {progressPct}%</p>
            </div>
            {Sidebar}
          </div>
        </aside>

        <main>
          <div className="mb-5">
            <Badge className="mb-3">{subjectId} • Class {classLevel}</Badge>
            <h1 className="text-2xl md:text-3xl font-bold">{outline?.title || chapterName}</h1>
            <p className="text-muted-foreground text-sm mt-1">{outline?.twoLineSummary}</p>
          </div>

          {activeTopic && (
            <div className="relative">
              {resumePoint && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-primary/40 bg-primary-soft px-4 py-3">
                  <RotateCcw className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 text-sm">
                    <span className="font-semibold">Pick up where you left off</span>
                    <span className="text-muted-foreground"> — {topics[resumePoint.index]?.title}</span>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={resume}>
                    Resume
                  </Button>
                  <button onClick={() => setResumePoint(null)} className="text-muted-foreground hover:text-foreground" title="Dismiss">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mb-3 gap-3">
                <h2 className="font-display text-xl font-extrabold break-words">{activeTopic.title}</h2>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="glass rounded-full"
                    onClick={() => toggleComplete(activeTopic)} title="Mark complete">
                    {completed.has(activeTopic.key)
                      ? <CheckCircle className="w-4 h-4 text-strong" />
                      : <Circle className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="glass rounded-full"
                    onClick={() => toggleBookmark(activeTopic)} title="Bookmark">
                    <Bookmark className={`w-4 h-4 ${bookmarks.has(activeTopic.key) ? 'fill-weak text-weak' : ''}`} />
                  </Button>
                </div>
              </div>

              {activeTopic.kind === 'overview' && outline && (
                <OverviewPage outline={outline} />
              )}

              {activeTopic.kind === 'topic' && (
                isLocked(current) ? (
                  <div className="space-y-5">
                    <Card className="glass">
                      <CardHeader><CardTitle className="text-lg">Key Points (free preview)</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {(outline?.keyPoints || []).map((kp, i) => (
                            <li key={i} className="flex gap-3">
                              <CheckCircle className="w-5 h-5 text-strong mt-0.5 shrink-0" />
                              <div>
                                <span className="font-medium">{kp.point}</span>
                                <p className="text-sm text-muted-foreground mt-1">{kp.explanation}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <p className="text-sm text-muted-foreground mt-5">
                          That's the summary. The full topic — deep explanations, notes between paragraphs,
                          numericals, diagrams, 3D visuals and the questions that definitely come in the exam — is right below.
                        </p>
                      </CardContent>
                    </Card>
                    {UnlockCta}
                  </div>
                ) : loadingPage && !pages[activeTopic.index] ? (
                  <GeneratingNotes />
                ) : pageError && !pages[activeTopic.index] ? (
                  <Card className="glass">
                    <CardContent className="pt-6 text-center">
                      <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">{pageError}</p>
                      <Button
                        className="glass-btn text-primary-foreground"
                        onClick={() => fetchPage(activeTopic.index, activeTopic.title, (outline?.topics || []).map((tp) => tp.title))}
                      >
                        {t('tryAgain')}
                      </Button>
                    </CardContent>
                  </Card>
                ) : pages[activeTopic.index] ? (
                  <TopicPageView page={pages[activeTopic.index]} subject={subjectName} />
                ) : null
              )}

              <div className="mt-8 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <Button variant="outline" className="glass" disabled={current === 0} onClick={() => goTo(current - 1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t('previous')}
                  </Button>
                  <span className="text-xs text-muted-foreground">{current + 1} / {topics.length}</span>
                  {current < topics.length - 1 ? (
                    <Button
                      className="glass-btn text-primary-foreground"
                      disabled={!topicDone}
                      onClick={() => goTo(current + 1)}
                    >
                      {t('nextTopic')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button className="glass-btn text-primary-foreground" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" /> {t('chapterDone')}
                    </Button>
                  )}
                </div>
                {!topicDone && current < topics.length - 1 && (
                  <button
                    onClick={() => toggleComplete(activeTopic)}
                    disabled={isLocked(current)}
                    className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-primary disabled:opacity-50"
                  >
                    Finish this whole topic — read it, scroll through every visual and the 3D
                    model, then tap here to mark it complete and unlock the next one.
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <Link to={`/doubt/${subjectId}/${chapterId}`} className="fixed bottom-6 right-6 z-50">
        <Button className="glass-btn text-primary-foreground rounded-full h-14 w-14 shadow-xl" title="Ask a doubt">
          <MessageCircleQuestion className="w-6 h-6" />
        </Button>
      </Link>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Flag className="w-4 h-4" /> Report a problem</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Found a mistake or something off in "{activeTopic?.title}"? Tell us.</p>
          <Textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Describe the issue..." rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button className="glass-btn text-primary-foreground" disabled={!reportReason.trim()} onClick={submitReport}>Send report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OverviewPage({ outline }: { outline: ChapterOutline }) {
  return (
    <div className="space-y-5">
      {outline.hook && (
        <Card className="glass border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap leading-relaxed">{outline.hook}</p>
          </CardContent>
        </Card>
      )}

      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">What this chapter is about</h3>
              <p className="text-muted-foreground">{outline.twoLineSummary}</p>
              {!!outline.estimatedMinutes && (
                <p className="text-xs text-muted-foreground mt-2">~{outline.estimatedMinutes} min read • {outline.topics?.length || 0} topics</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle className="text-lg">Key Points</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {(outline.keyPoints || []).map((kp, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-strong mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">{kp.point}</span>
                  <p className="text-sm text-muted-foreground mt-1">{kp.explanation}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {outline.examBox && (
        <Card className="glass border-l-4 border-l-weak">
          <CardHeader><CardTitle className="text-lg">{outline.examBox.title || 'What will come in the exam?'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-5">
              {([['1 Mark', outline.examBox.likely1Mark], ['3 Marks', outline.examBox.likely3Mark], ['5 Marks', outline.examBox.likely5Mark]] as const).map(([label, arr]) => (
                <div key={label}>
                  <h4 className="font-semibold mb-2 text-primary">{label}</h4>
                  <ul className="text-sm space-y-1">
                    {(arr || []).map((q, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{q}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
