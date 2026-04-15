export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Sentence {
  id: number;
  spanish: string;
  english: string;
  level: Level;
}

export interface Lesson {
  id: string;          // "lesson-{N}" e.g., "lesson-1"
  lessonNumber: number;
  sentences: Sentence[];
}

export interface LessonProgress {
  completedAt?: string;
  attempts: number;
  lastScore?: number;  // 0-100
  highScore?: number;  // 0-100
}

export type ProgressStore = Record<string, LessonProgress>; // keyed by lessonId
