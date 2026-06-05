export interface Profile {
  id: string;
  full_name: string;
  class_level: string;
  preferred_language: string;
  study_style: string;
  weak_subjects: string[];
  streak_days: number;
  last_active_date: string;
  created_at: string;
}

export interface ChapterNote {
  title: string;
  subject: string;
  classLevel: string;
  language: string;
  twoLineSummary: string;
  keyPoints: Array<{ point: string; explanation: string }>;
  examBox: {
    title: string;
    likely1Mark: string[];
    likely3Mark: string[];
    likely5Mark: string[];
    previousYearQuestions: Array<{ year: number; question: string; marks: number }>;
  };
  detailedNotes: Array<{
    heading: string;
    content: string;
    diagramDescription?: string;
    memoryTrick?: string;
  }>;
  commonMistakes: Array<{ mistake: string; correct: string }>;
  mcqs: Array<{
    question: string;
    options: string[];
    correct: string;
    explanation: string;
  }>;
  shortAnswerQuestions: Array<{ question: string; answer: string }>;
  quickRevision: string[];
}

export interface DoubtSession {
  id: string;
  subject: string;
  chapter_name: string;
  class_level: string;
  language: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
  doubts_used: number;
  max_doubts: number;
}

export interface NotesVerification {
  score: number;
  grade: string;
  topicsCovered: string[];
  topicsMissed: string[];
  strengths: string[];
  improvements: string[];
  feedback: string;
  examReadiness: string;
}

export const SUBJECTS = [
  { id: 'Physics', name: 'Physics', icon: 'Atom', color: 'blue' },
  { id: 'Chemistry', name: 'Chemistry', icon: 'FlaskConical', color: 'green' },
  { id: 'Mathematics', name: 'Mathematics', icon: 'Calculator', color: 'purple' },
  { id: 'Biology', name: 'Biology', icon: 'Leaf', color: 'teal' },
  { id: 'English', name: 'English', icon: 'BookOpen', color: 'amber' },
  { id: 'Social Science', name: 'Social Science', icon: 'Globe', color: 'red' },
  { id: 'Hindi', name: 'Hindi', icon: 'Languages', color: 'orange' },
  { id: 'Computer Science', name: 'Computer Science', icon: 'Monitor', color: 'cyan' },
] as const;

export const CLASSES = ['9', '10', '11', '12'] as const;

export const LANGUAGES = ['English', 'Hindi', 'Hinglish', 'Tamil', 'Telugu', 'Marathi', 'Bengali'] as const;

export const STUDY_STYLES = [
  { id: 'detailed', name: 'Detailed Notes', description: 'Full explanation with examples' },
  { id: 'concise', name: 'Quick Revision', description: 'Bullet points, key facts only' },
  { id: 'exam', name: 'Exam Focused', description: 'PYQs, important questions' },
] as const;
