import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Lightbulb, Target, TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle, Sparkles, PencilRuler,
} from 'lucide-react';
import { Model3D, pickModel } from '@/components/learn/Model3D';
import type { ChapterPage } from '@/types';

/** Strip anything executable from AI-authored SVG before inlining it. */
function safeSvg(svg: string): string {
  if (!svg || !svg.includes('<svg')) return '';
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|xlink:href)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '');
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-extrabold prose-p:leading-relaxed prose-strong:text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function TopicPageView({ page, subject }: { page: ChapterPage; subject: string }) {
  const svg = safeSvg(page.diagram?.svg || '');
  const model = pickModel(page.title, subject, page.title, page.diagram?.shows);

  return (
    <div className="space-y-5">
      {page.level && (
        <Badge variant="outline" className="border-primary/40 text-primary">{page.level} Level</Badge>
      )}

      {/* Hook */}
      {page.hook && (
        <Card className="glass border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap leading-relaxed">{page.hook}</p>
          </CardContent>
        </Card>
      )}

      {/* Definitions */}
      <Card className="glass">
        <CardContent className="pt-6 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">In simple words</p>
            <p className="mt-1 leading-relaxed">{page.simpleDefinition}</p>
          </div>
          <div className="rounded-xl bg-primary-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">📘 Exam definition</p>
            <p className="mt-1 text-sm leading-relaxed">{page.examDefinition}</p>
          </div>
        </CardContent>
      </Card>

      {/* Main explanation */}
      <Card className="glass">
        <CardContent className="pt-6">
          <Markdown>{page.bodyMarkdown || ''}</Markdown>
        </CardContent>
      </Card>

      {/* Indian comparison */}
      {page.indianComparison && (
        <Card className="glass border-l-4 border-l-strong">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">🇮🇳 Think of it like this</CardTitle>
          </CardHeader>
          <CardContent><p className="whitespace-pre-wrap leading-relaxed text-sm">{page.indianComparison}</p></CardContent>
        </Card>
      )}

      {/* Diagram */}
      {(svg || page.diagram?.howToDraw) && (
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PencilRuler className="w-4 h-4 text-primary" /> {page.diagram?.name || 'Diagram'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {page.diagram?.shows && <p className="text-sm text-muted-foreground">{page.diagram.shows}</p>}
            {svg && (
              <div
                className="w-full overflow-x-auto rounded-xl bg-card p-4 text-foreground [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-h-[380px]"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
            {page.diagram?.howToDraw && (
              <div className="rounded-xl bg-muted p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" /> How to draw it in the exam
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{page.diagram.howToDraw}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 3D model where it genuinely helps */}
      {model && (
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Explore in 3D</CardTitle>
          </CardHeader>
          <CardContent><Model3D kind={model} /></CardContent>
        </Card>
      )}

      {/* Key terms */}
      {page.keyTerms?.length > 0 && (
        <Card className="glass">
          <CardHeader className="pb-2"><CardTitle className="text-base">Key terms</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {page.keyTerms.map((k, i) => (
                <li key={i} className="text-sm">
                  <span className="font-semibold">{k.term}</span>
                  <span className="text-muted-foreground"> — {k.meaning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Worked problems */}
      {page.workedProblems?.length > 0 && (
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Must-do exam questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {page.workedProblems.map((p, i) => (
              <div key={i} className="rounded-xl bg-card p-4 border border-border/60">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-sm">{i + 1}. {p.question}</p>
                  {!!p.marks && <Badge variant="outline" className="shrink-0">{p.marks} marks</Badge>}
                </div>
                <div className="mt-3 text-sm">
                  <Markdown>{p.solution || ''}</Markdown>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Exam focus */}
      {page.examFocus && (
        <Card className="glass border-l-4 border-l-weak">
          <CardHeader className="pb-2"><CardTitle className="text-base">🎯 Exam focus</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap text-sm leading-relaxed">{page.examFocus}</p></CardContent>
        </Card>
      )}

      {/* Mistake + trick */}
      <div className="grid md:grid-cols-2 gap-4">
        {page.commonMistake && (
          <div className="rounded-2xl p-4 bg-weak-soft">
            <p className="text-sm font-semibold text-weak-soft-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Common mistake
            </p>
            <p className="text-sm text-weak-soft-foreground mt-1 whitespace-pre-wrap">{page.commonMistake}</p>
          </div>
        )}
        {page.memoryTrick && (
          <div className="rounded-2xl p-4 bg-strong-soft">
            <p className="text-sm font-semibold text-strong flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Memory trick
            </p>
            <p className="text-sm mt-1 whitespace-pre-wrap">{page.memoryTrick}</p>
          </div>
        )}
      </div>

      {/* Quick check */}
      {page.quickCheck?.question && (
        <QuickCheck question={page.quickCheck.question} answer={page.quickCheck.answer} />
      )}

      {page.closingLine && (
        <p className="text-center text-sm font-semibold text-primary">{page.closingLine}</p>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';

function QuickCheck({ question, answer }: { question: string; answer: string }) {
  const [show, setShow] = useState(false);
  return (
    <Card className="glass">
      <CardHeader className="pb-2"><CardTitle className="text-base">❓ Quick check</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm">{question}</p>
        {show ? (
          <div className="mt-3 rounded-xl bg-strong-soft p-3 text-sm flex gap-2">
            <CheckCircle className="w-4 h-4 text-strong shrink-0 mt-0.5" />
            <span className="whitespace-pre-wrap">{answer}</span>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShow(true)}>Show answer</Button>
        )}
      </CardContent>
    </Card>
  );
}
