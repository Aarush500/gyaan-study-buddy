import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { callEdgeFunction } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Award, TrendingUp } from 'lucide-react';
import type { NotesVerification } from '@/types';
import { SUBJECTS } from '@/types';

export default function VerifyNotes() {
  const { profile } = useAuth();
  const [subject, setSubject] = useState('Physics');
  const [chapterName, setChapterName] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NotesVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    if (!chapterName.trim() || !studentNotes.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error: err } = await callEdgeFunction<NotesVerification>('verify-notes', {
      subject,
      chapterName,
      classLevel: profile?.class_level || '10',
      studentNotes,
    });

    if (err) {
      setError(err);
    } else if (data) {
      setResult(data);
    }

    setLoading(false);
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  }

  function getGradeBg(grade: string): string {
    switch (grade) {
      case 'A': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-red-100 text-red-800 border-red-300';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notes Verifier</h1>
          <p className="text-muted-foreground">Upload your handwritten notes and get AI-powered feedback</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Notes</CardTitle>
              <CardDescription>Type or paste your notes for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chapter Name</Label>
                  <Input
                    placeholder="e.g., Motion"
                    value={chapterName}
                    onChange={e => setChapterName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Your Notes</Label>
                <Textarea
                  placeholder="Paste your handwritten notes here. Include all key concepts, definitions, formulas, and diagrams descriptions..."
                  value={studentNotes}
                  onChange={e => setStudentNotes(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
              </div>

              <Button
                onClick={handleVerify}
                disabled={loading || !chapterName.trim() || !studentNotes.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Verifying...' : 'Verify My Notes'}
              </Button>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            {loading && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-30 w-full" />
                </CardContent>
              </Card>
            )}

            {!loading && !result && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Your verification results will appear here</p>
                  <p className="text-sm mt-2">Score, feedback, and improvement tips</p>
                </CardContent>
              </Card>
            )}

            {result && (
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Your Score</p>
                        <p className={`text-5xl font-bold ${getScoreColor(result.score)}`}>{result.score}<span className="text-2xl">/100</span></p>
                      </div>
                      <Badge className={`text-lg px-4 py-2 border ${getGradeBg(result.grade)}`}>
                        Grade: {result.grade}
                      </Badge>
                    </div>
                    <Progress value={result.score} className="h-3" />
                    <div className="flex items-center gap-2 mt-3">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">{result.examReadiness}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">{result.feedback}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-emerald-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                        <CheckCircle className="w-5 h-5" />
                        Topics Covered
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {result.topicsCovered.map((t, i) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-emerald-500">-</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                        <XCircle className="w-5 h-5" />
                        Topics Missed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.topicsMissed.length > 0 ? (
                        <ul className="space-y-1">
                          {result.topicsMissed.map((t, i) => (
                            <li key={i} className="text-sm flex gap-2">
                              <span className="text-amber-500">-</span>
                              {t}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-emerald-600">Great job - nothing major missed!</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {result.improvements?.length > 0 && (
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-blue-700">Improvements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.improvements.map((imp, i) => (
                          <li key={i} className="text-sm bg-blue-50 p-2 rounded">{imp}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
