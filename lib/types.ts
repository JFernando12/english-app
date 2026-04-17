export type Level = 'beginner' | 'intermediate' | 'advanced';

/** Format: '{fromLang}-to-{toLang}', e.g. 'es-to-en'. Extensible for future languages. */
export type Direction = string;

export interface LangConfig {
  label: string;
  flag: string;
  locale: string; // BCP 47 locale for TTS
}

export const LANGUAGES: Record<string, LangConfig> = {
  es: { label: 'Spanish', flag: '🇪🇸', locale: 'es-MX' },
  en: { label: 'English', flag: '🇺🇸', locale: 'en-US' },
};

export const DEFAULT_DIRECTION: Direction = 'es-to-en';

export function parseDirection(dir: Direction): { from: string; to: string } {
  const [from, , to] = dir.split('-');
  return { from, to };
}

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
