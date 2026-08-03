import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, callEdgeFunction } from '@/lib/supabase';
import { buildTopics, type Topic } from '@/lib/topics';
import { isUnlockValid, daysUntil } from '@/lib/validity';
import { pushNotification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChapterSkeleton } from '@/components/skeletons/ChapterSkeleton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, BookOpen, MessageCircleQuestion, Sparkles, TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle, Lightbulb, Lock, Bookmark, Flag, Menu, List, Circle, RotateCcw, X,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { ChapterNote } from '@/types';
import { Model3D, pickModel } from '@/components/learn/Model3D';
import { useT } from '@/lib/i18n';

export default function Chapter() {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>();
  const { profile, user } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<ChapterNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedMcq, setSelectedMcq] = useState<Record<number, string>>({});
  const [resumePoint, setResumePoint] = useState<{ index: number; scrollY: number } | null>(null);
  const restoredRef = useRef(false);

  const chapterName = decodeURIComponent(chapterId || '');
  const subjectName = subjectId || '';
  const topics = buildTopics(notes);
  const activeTopic: Topic | undefined = topics[current];
  const saveKey = `gyaan:resume:${user?.id || 'guest'}:${subjectName}:${chapterName}`;

  // ---- Autosave: remember the exact topic + scroll position, restore on return ----
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

  const fetchNotes = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await callEdgeFunction<{ notes: ChapterNote; cached: boolean }>('generate-notes', {
      subject: subjectName,
      chapterName,
      classLevel: profile?.class_level || '9',
      language: profile?.preferred_language || 'English',
      studyStyle: profile?.study_style || 'detailed',
      forceRefresh,
    });
    if (err) setError(err);
    else if (data?.notes) setNotes(data.notes);
    setLoading(false);
  }, [subjectName, chapterName, profile]);

  useEffect(() => {
    if (subjectName && chapterName) fetchNotes(false);
  }, [subjectName, chapterName, profile]);

  const loadUserState = useCallback(async () => {
    if (!user) return;
    const { data: unlock } = await supabase
      .from('unlocked_chapters')
      .select('valid_until')
      .eq('user_id', user.id).eq('subject', subjectName)
      .eq('chapter_name', chapterName).eq('class_level', profile?.class_level || '9')
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
  }, [user, subjectName, chapterName, profile]);

  useEffect(() => { loadUserState(); }, [loadUserState]);

  async function toggleBookmark(t: Topic) {
    if (!user) return;
    const has = bookmarks.has(t.key);
    if (has) {
      await supabase.from('bookmarks').delete()
        .eq('user_id', user.id).eq('subject', subjectName)
        .eq('chapter_name', chapterName).eq('topic_key', t.key);
      const next = new Set(bookmarks); next.delete(t.key); setBookmarks(next);
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id, subject: subjectName, chapter_name: chapterName,
        topic_key: t.key, topic_title: t.title,
      });
      const next = new Set(bookmarks); next.add(t.key); setBookmarks(next);
      toast.success('Bookmarked');
    }
  }

  async function toggleComplete(t: Topic) {
    if (!user) return;
    const has = completed.has(t.key);
    if (has) {
      await supabase.from('topic_progress').delete()
        .eq('user_id', user.id).eq('subject', subjectName)
        .eq('chapter_name', chapterName).eq('topic_key', t.key);
      const next = new Set(completed); next.delete(t.key); setCompleted(next);
    } else {
      await supabase.from('topic_progress').insert({
        user_id: user.id, subject: subjectName, chapter_name: chapterName,
        topic_key: t.key, topic_title: t.title,
      });
      const next = new Set(completed); next.add(t.key); setCompleted(next);
      toast.success('Marked complete ✅');
      const doneCount = next.size;
      const allDone = topics.length > 0 && doneCount >= topics.length;
      await pushNotification(user.id, {
        type: 'topic',
        title: allDone ? `Chapter complete: ${chapterName} 🎉` : `Topic done: ${t.title}`,
        body: allDone
          ? 'You finished every topic in this chapter. Revise before exams!'
          : `${doneCount}/${topics.length} topics done in ${chapterName}.`,
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

  const isLocked = (i: number) => i > 0 && !unlocked;
  const progressPct = topics.length ? Math.round((completed.size / topics.length) * 100) : 0;
  // Next topic stays locked until the current one is fully finished
  const topicDone = activeTopic ? completed.has(activeTopic.key) : false;

  function goTo(i: number) { setCurrent(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  if (loading) {
    return (
      <div className="min-h-screen app-bg">
        <ChapterSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center px-4">
        <Card className="max-w-md glass-strong">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t('failedToLoad')}</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button className="glass-btn text-primary-foreground" onClick={() => window.location.reload()}>{t('tryAgain')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expiryDays = daysUntil(validUntil);

  const Sidebar = (
    <nav className="space-y-1">
      {topics.map((t, i) => {
        const locked = isLocked(i);
        const isActive = i === current;
        return (
          <button
            key={t.key}
            onClick={() => goTo(i)}
            className={`w-full text-left flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition
              ${isActive ? 'glass-strong font-semibold text-foreground' : 'hover:bg-card/60 text-muted-foreground'}`}
          >
            {completed.has(t.key)
              ? <CheckCircle className="w-4 h-4 shrink-0 text-strong" />
              : <span className="text-xs w-5 shrink-0 opacity-60 text-center">{i + 1}</span>}
            <span className="flex-1 line-clamp-2">{t.title}</span>
            {bookmarks.has(t.key) && <Bookmark className="w-3.5 h-3.5 fill-weak text-weak shrink-0" />}
            {locked && <Lock className="w-3.5 h-3.5 shrink-0 opacity-60" />}
          </button>
        );
      })}
    </nav>
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
              <SheetContent side="left" className="app-bg w-80">
                <div className="mt-6 mb-3 font-display font-bold flex items-center gap-2"><List className="w-4 h-4" /> {t('topics')}</div>
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
          <div className="glass rounded-2xl p-3 sticky top-20">
            <div className="px-2 pb-2 font-display font-bold text-sm flex items-center gap-2"><List className="w-4 h-4" /> {t('topics')}</div>
            <div className="px-2 pb-3">
              <Progress value={progressPct} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{completed.size}/{topics.length} done • {progressPct}%</p>
            </div>
            {Sidebar}
          </div>
        </aside>

        <main>
          <div className="mb-5">
            <Badge className="mb-3">{subjectId} • Class {profile?.class_level || '9'}</Badge>
            <h1 className="text-2xl md:text-3xl font-bold">{notes?.title || chapterName}</h1>
            <p className="text-muted-foreground text-sm mt-1">{notes?.twoLineSummary}</p>
          </div>

          {activeTopic && (
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-xl font-extrabold">{activeTopic.title}</h2>
                <div className="flex items-center gap-1">
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

              {isLocked(current) ? (
                <div className="space-y-5">
                  {/* Locked topics still show the key points so students see real value first */}
                  {notes && <LockedPreview notes={notes} />}
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
                </div>
              ) : (
                notes && <TopicBody notes={notes} topic={activeTopic} selectedMcq={selectedMcq} setSelectedMcq={setSelectedMcq} />
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
                {/* The next topic unlocks only after this whole topic — notes, visuals
                    and the 3D model — is finished and marked complete. */}
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

      {/* Floating doubt button */}
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

function TopicBody({ notes, topic, selectedMcq, setSelectedMcq }: {
  notes: ChapterNote; topic: Topic;
  selectedMcq: Record<number, string>;
  setSelectedMcq: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  if (topic.kind === 'overview') {
    return (
      <div className="space-y-5">
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">2-Line Summary</h3>
                <p className="text-muted-foreground">{notes.twoLineSummary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle className="text-lg">Key Points</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {notes.keyPoints?.map((kp, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-strong mt-0.5 shrink-0" />
                  <div><span className="font-medium">{kp.point}</span>
                    <p className="text-sm text-muted-foreground mt-1">{kp.explanation}</p></div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (topic.kind === 'section') {
    const s = notes.detailedNotes[topic.index];
    const model = pickModel(notes.title, notes.subject, s.heading, s.diagramDescription);
    return (
      <Card className="glass">
        <CardContent className="pt-6 prose prose-slate max-w-none">
          <p className="whitespace-pre-wrap leading-relaxed">{s.content}</p>
          {model && <Model3D kind={model} />}
          {s.diagramDescription && (
            <div className="glass rounded-xl p-4 mt-4 not-prose">
              <p className="text-sm font-medium flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Diagram</p>
              <p className="text-sm text-muted-foreground mt-1">{s.diagramDescription}</p>
            </div>
          )}
          {s.memoryTrick && (
            <div className="rounded-xl p-4 mt-4 border border-weak-soft bg-weak-soft not-prose">
              <p className="text-sm font-medium text-weak-soft-foreground flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Memory Trick</p>
              <p className="text-sm text-weak-soft-foreground mt-1">{s.memoryTrick}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (topic.kind === 'exam') {
    const e = notes.examBox;
    return (
      <Card className="glass">
        <CardHeader><CardTitle className="text-lg">{e.title}</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-5">
            {([['1 Mark', e.likely1Mark], ['3 Marks', e.likely3Mark], ['5 Marks', e.likely5Mark]] as const).map(([label, arr]) => (
              <div key={label}>
                <h4 className="font-semibold mb-2 text-primary">{label}</h4>
                <ul className="text-sm space-y-1">{arr?.map((q, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{q}</li>)}</ul>
              </div>
            ))}
          </div>
          {e.previousYearQuestions?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Previous Year Questions</h4>
              <div className="space-y-2">
                {e.previousYearQuestions.map((p, i) => (
                  <div key={i} className="glass rounded-xl p-3">
                    <Badge variant="outline" className="mb-2">{p.year} • {p.marks} marks</Badge>
                    <p className="text-sm">{p.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (topic.kind === 'mcq') {
    return (
      <Card className="glass">
        <CardHeader><CardTitle className="text-lg">Test Yourself</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {notes.mcqs.map((mcq, qi) => {
            const chosen = selectedMcq[qi];
            return (
              <div key={qi} className="glass rounded-xl p-4">
                <p className="font-medium mb-3">{qi + 1}. {mcq.question}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {mcq.options.map((opt, oi) => {
                    const letter = String.fromCharCode(65 + oi);
                    const answered = chosen !== undefined;
                    const isCorrect = letter === mcq.correct;
                    const variant = answered ? (isCorrect ? 'default' : (chosen === letter ? 'destructive' : 'outline')) : 'outline';
                    return (
                      <Button key={oi} variant={variant as never}
                        className={`justify-start text-left h-auto py-3 px-4 ${answered && isCorrect ? 'bg-strong hover:bg-strong text-strong-foreground' : ''}`}
                        disabled={answered}
                        onClick={() => setSelectedMcq((p) => ({ ...p, [qi]: letter }))}>
                        {opt}
                      </Button>
                    );
                  })}
                </div>
                {chosen !== undefined && (
                  <div className="mt-3 p-3 rounded-lg glass text-sm">{mcq.explanation}</div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  if (topic.kind === 'mistakes') {
    return (
      <Card className="glass">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-weak" /> Common Mistakes</CardTitle></CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {notes.commonMistakes.map((cm, i) => (
              <AccordionItem key={i} value={`m-${i}`}>
                <AccordionTrigger className="text-left"><span className="text-destructive font-medium">{cm.mistake}</span></AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-lg p-4 bg-strong-soft">
                    <p className="font-medium text-strong">Correct approach</p>
                    <p className="text-sm mt-1">{cm.correct}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    );
  }

  // revision
  return (
    <Card className="glass">
      <CardHeader><CardTitle className="text-lg">Quick Revision</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {notes.quickRevision.map((p, i) => (
            <li key={i} className="flex gap-3 items-start glass rounded-lg p-3">
              <CheckCircle className="w-5 h-5 text-strong mt-0.5 shrink-0" /><span>{p}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
