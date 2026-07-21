import { Category, Lesson, Sentence } from '@/lib/types';

export interface ISentencesRepository {
  getAllLessons(): Promise<Lesson[]>;
  getLessonById(id: string): Promise<Lesson | null>;
  getAllSentences(category?: Category): Promise<Sentence[]>;
}
