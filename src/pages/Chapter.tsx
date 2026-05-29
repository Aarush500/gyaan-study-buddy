import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { callEdgeFunction } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, BookOpen, MessageCircleQuestion, Sparkles, AlertTriangle, CheckCircle, Lightbulb, FileQuestion, RefreshCw } from 'lucide-react';
import type { ChapterNote } from '@/types';

export default function Chapter() {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>();
  const { profile } = useAuth();
  const [notes, setNotes] = useState<ChapterNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMcq, setSelectedMcq] = useState<number | null>(null);
  const [mcqScore, setMcqScore] = useState({ correct: 0, total: 0 });

  const chapterName = decodeURIComponent(chapterId || '');
  const subjectName = subjectId || '';

  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await callEdgeFunction<{ notes: ChapterNote; cached: boolean }>('generate-notes', {
        subject: subjectName,
        chapterName,
        classLevel: profile?.class_level || '10',
        language: profile?.preferred_language || 'English',
        studyStyle: profile?.study_style || 'detailed',
      });

      if (err) {
        setError(err);
      } else if (data?.notes) {
        setNotes(data.notes);
      }
      setLoading(false);
    }

    if (subjectName && chapterName) {
      fetchNotes();
    }
  }, [subjectName, chapterName, profile]);

  function handleMcqSelect(qIndex: number, answer: string) {
    if (!notes || selectedMcq !== null) return;
    setSelectedMcq(qIndex);

    const isCorrect = answer === notes.mcqs[qIndex].correct;
    if (isCorrect) {
      setMcqScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setMcqScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
  }

  function resetMcqs() {
    setSelectedMcq(null);
    setMcqScore({ correct: 0, total: 0 });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link to={`/subject/${subjectId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {subjectId}
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Failed to load notes</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={`/subject/${subjectId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {subjectId}
          </Link>
          <Link to={`/doubt/${subjectId}/${chapterId}`}>
            <Button variant="outline" size="sm">
              <MessageCircleQuestion className="w-4 h-4 mr-2" />
              Ask a Doubt
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Badge className="mb-4">{subjectId}</Badge>
          <h1 className="text-3xl font-bold mb-2">{notes?.title || chapterName}</h1>
          <p className="text-muted-foreground">Class {profile?.class_level || '10'} CBSE</p>
        </div>

        {notes?.twoLineSummary && (
          <Card className="mb-8 bg-emerald-50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-emerald-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-emerald-900 mb-1">Quick Summary</h3>
                  <p className="text-emerald-800">{notes.twoLineSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="exam">Exam Box</TabsTrigger>
            <TabsTrigger value="mcq">MCQs</TabsTrigger>
            <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
            <TabsTrigger value="revision">Revision</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-6">
            {notes?.keyPoints && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {notes.keyPoints.map((kp, i) => (
                      <li key={i} className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">{kp.point}</span>
                          <p className="text-sm text-muted-foreground mt-1">{kp.explanation}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {notes?.detailedNotes?.map((section, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.heading}</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap">{section.content}</p>
                  {section.diagramDescription && (
                    <div className="bg-slate-100 p-4 rounded-lg mt-4">
                      <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Diagram: {section.diagramDescription}
                      </p>
                    </div>
                  )}
                  {section.memoryTrick && (
                    <div className="bg-amber-50 p-4 rounded-lg mt-4 border border-amber-200">
                      <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Memory Trick: {section.memoryTrick}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="exam">
            {notes?.examBox && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{notes.examBox.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">1 Mark Questions</h4>
                      <ul className="text-sm space-y-1">
                        {notes.examBox.likely1Mark.map((q, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-green-500">-</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-700">3 Mark Questions</h4>
                      <ul className="text-sm space-y-1">
                        {notes.examBox.likely3Mark.map((q, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-blue-500">-</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-purple-700">5 Mark Questions</h4>
                      <ul className="text-sm space-y-1">
                        {notes.examBox.likely5Mark.map((q, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-purple-500">-</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {notes.examBox.previousYearQuestions?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Previous Year Questions</h4>
                      <div className="space-y-2">
                        {notes.examBox.previousYearQuestions.map((pyq, i) => (
                          <div key={i} className="bg-slate-50 p-3 rounded-lg">
                            <Badge variant="outline" className="mb-2">{pyq.year} - {pyq.marks} marks</Badge>
                            <p className="text-sm">{pyq.question}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mcq">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Test Your Knowledge</CardTitle>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">Score: {mcqScore.correct}/{mcqScore.total}</Badge>
                  <Button variant="ghost" size="sm" onClick={resetMcqs}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {notes?.mcqs?.map((mcq, qIndex) => (
                  <div key={qIndex} className="p-4 bg-white rounded-lg border">
                    <p className="font-medium mb-3">{qIndex + 1}. {mcq.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {mcq.options.map((opt, oIndex) => {
                        const letter = String.fromCharCode(65 + oIndex);
                        const isSelected = selectedMcq === qIndex;
                        const isCorrectAnswer = letter === mcq.correct;
                        const wasSelected = false;

                        return (
                          <Button
                            key={oIndex}
                            variant={isSelected ? (isCorrectAnswer ? 'default' : 'destructive') : 'outline'}
                            className={`justify-start text-left h-auto py-3 px-4 ${isSelected && isCorrectAnswer ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}
                            onClick={() => handleMcqSelect(qIndex, letter)}
                            disabled={selectedMcq !== null}
                          >
                            {opt}
                          </Button>
                        );
                      })}
                    </div>
                    {selectedMcq === qIndex && (
                      <div className={`mt-3 p-3 rounded-lg ${mcq.correct === notes.mcqs[qIndex].correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                        <p className="text-sm">{mcq.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mistakes">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Common Mistakes to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {notes?.commonMistakes?.map((cm, i) => (
                    <AccordionItem key={i} value={`mistake-${i}`}>
                      <AccordionTrigger className="text-left">
                        <span className="text-red-600 font-medium">{cm.mistake}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                          <p className="text-emerald-800 font-medium">Correct Approach:</p>
                          <p className="text-emerald-700">{cm.correct}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revision">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Revision</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {notes?.quickRevision?.map((point, i) => (
                    <li key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
