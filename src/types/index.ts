export type SubjectName = 'physics' | 'chemistry' | 'maths';

export interface SubjectInput {
  correct: number;
  incorrect: number;
  unattempted: number;
  totalQuestions: number;
}

export interface SubjectMetrics {
  correct: number;
  incorrect: number;
  unattempted: number;
  attempted: number;
  totalQuestions: number;
  score: number;
  accuracy: number; // percentage (0 - 100)
  negativeMarks: number;
  potentialMarksLost: number; // (incorrect * 5)
  maxMarks: number;
}

export interface MockTestRecord {
  id: string;
  name: string;
  date: string;
  durationMinutes?: number;
  physics: SubjectMetrics;
  chemistry: SubjectMetrics;
  maths: SubjectMetrics;
  totalScore: number;
  totalMaxMarks: number;
  overallAccuracy: number;
  totalAttempted: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnattempted: number;
  totalNegativeMarks: number;
  percentileEstimate: number;
  notes?: string;
  tags?: string[];
}

export type MistakeTag = 
  | 'Calculation / Silly Error'
  | 'Conceptual Gap'
  | 'Formula Forgotten'
  | 'Misread Question / Trap'
  | 'Time Pressure'
  | 'Wild Guess'
  | 'Exam Panic';

export interface MistakeEntry {
  id: string;
  testId?: string;
  testName?: string;
  subject: SubjectName;
  chapter: string;
  questionNumber?: number | string;
  tag: MistakeTag;
  description: string;
  keyLearning: string;
  status: 'Needs Revision' | 'Reviewed' | 'Mastered';
  createdAt: string;
}

export interface ChapterChallengeRow {
  id: string;
  block: string;
  chapter: string;
  totalQues: number;
  pyq2019: boolean;
  top200_2023: boolean;
  top200_2024: boolean;
  top200_2022: boolean;
  top200_2025: boolean;
  top200_2021: boolean;
  top100_2020: boolean;
  top200_2026: boolean;
  theoreticalQues: boolean;
  standardReference: boolean; // HCV for Physics / MS Chouhan for Chem / Black Book for Maths
  rankBooster: boolean; // RBS 1.0
  sureShot: boolean;
  ncertRead: boolean;
  r1: boolean; // Revision 1
  r2: boolean; // Revision 2
  notes?: string;
}

export interface SpecialContentItem {
  id: string;
  title: string;
  linkText: string;
  url?: string;
  done: boolean;
  r1: boolean;
  r2: boolean;
}

export interface MockChecklistItem {
  id: string;
  name: string;
  type: 'Full Syllabus' | 'Part Test' | 'PYQ Shift' | 'Chapter Test';
  series: string; // e.g. "Eduniti", "Allen", "MathonGo", "NTA PYQ 2024"
  status: 'Pending' | 'In Progress' | 'Completed';
  targetDate?: string;
  completedDate?: string;
  score?: number;
  accuracy?: number;
  mockRecordId?: string;
}
