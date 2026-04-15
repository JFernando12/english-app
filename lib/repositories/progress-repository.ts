import { LessonProgress, ProgressStore } from '@/lib/types';

export interface IProgressRepository {
  getProgress(lessonId: string): LessonProgress | null;
  saveProgress(lessonId: string, progress: LessonProgress): void;
  getAllProgress(): ProgressStore;
  clearProgress(lessonId: string): void;
}
