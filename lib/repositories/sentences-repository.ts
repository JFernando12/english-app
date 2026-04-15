import { Lesson, Sentence } from '@/lib/types';

export interface ISentencesRepository {
  getAllLessons(): Promise<Lesson[]>;
  getLessonById(id: string): Promise<Lesson | null>;
  getAllSentences(): Promise<Sentence[]>;
}
