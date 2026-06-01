import type { ChapterNote } from '@/types';

export type Topic =
  | { key: string; title: string; kind: 'overview' }
  | { key: string; title: string; kind: 'section'; index: number }
  | { key: string; title: string; kind: 'exam' }
  | { key: string; title: string; kind: 'mcq' }
  | { key: string; title: string; kind: 'mistakes' }
  | { key: string; title: string; kind: 'revision' };

export function buildTopics(notes: ChapterNote | null): Topic[] {
  if (!notes) return [];
  const topics: Topic[] = [
    { key: 'overview', title: 'Overview & Key Points', kind: 'overview' },
  ];
  (notes.detailedNotes || []).forEach((s, i) => {
    topics.push({ key: `section-${i}`, title: s.heading || `Topic ${i + 1}`, kind: 'section', index: i });
  });
  if (notes.examBox) topics.push({ key: 'exam', title: 'Exam Questions (Definitely Asked)', kind: 'exam' });
  if (notes.mcqs?.length) topics.push({ key: 'mcq', title: 'Practice MCQs', kind: 'mcq' });
  if (notes.commonMistakes?.length) topics.push({ key: 'mistakes', title: 'Common Mistakes', kind: 'mistakes' });
  if (notes.quickRevision?.length) topics.push({ key: 'revision', title: 'Quick Revision', kind: 'revision' });
  return topics;
}
