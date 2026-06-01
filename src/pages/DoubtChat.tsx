import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { callEdgeFunction } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, Bot, User, CircleAlert as AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function DoubtChat() {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [doubtsQuota, setDoubtsQuota] = useState({ used: 0, max: 15 });
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chapterName = decodeURIComponent(chapterId || '');
  const subjectName = subjectId || '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setError(null);

    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);

    const { data, error: err } = await callEdgeFunction<{
      answer: string;
      doubtsUsed: number;
      maxDoubts: number;
      remaining: number;
      sessionId: string;
    }>('doubt-chat', {
      subject: subjectName,
      chapterName,
      classLevel: profile?.class_level || '10',
      language: profile?.preferred_language || 'English',
      question: userMessage,
      sessionId,
    });

    if (err) {
      setError(err);
      setMessages(prev => prev.slice(0, -1));
    } else if (data) {
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, timestamp: new Date().toISOString() }]);
      setDoubtsQuota({ used: data.doubtsUsed, max: data.maxDoubts });
      if (data.sessionId) setSessionId(data.sessionId);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={`/subject/${subjectId}/${chapterId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Link>
          <Badge variant={doubtsQuota.used >= doubtsQuota.max ? 'destructive' : 'secondary'}>
            {doubtsQuota.used}/{doubtsQuota.max} doubts used
          </Badge>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col">
        <div className="mb-4">
          <h1 className="text-xl font-bold">{subjectName} - Doubt Chat</h1>
          <p className="text-sm text-muted-foreground">{chapterName}</p>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="text-center text-muted-foreground py-12">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ask any doubt about {chapterName}</p>
                <p className="text-sm">Step-by-step solutions for Math and Science</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-emerald-600" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 border-t">
            <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your doubt..."
                disabled={loading || doubtsQuota.used >= doubtsQuota.max}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim() || doubtsQuota.used >= doubtsQuota.max} className="bg-emerald-600 hover:bg-emerald-700">
                <Send className="w-4 h-4" />
              </Button>
            </form>
            {doubtsQuota.used >= doubtsQuota.max && (
              <p className="text-sm text-amber-600 mt-2 text-center">Doubt limit reached for this chapter</p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
