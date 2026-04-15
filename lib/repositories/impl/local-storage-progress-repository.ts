import { LessonProgress, ProgressStore } from '@/lib/types';
import { IProgressRepository } from '../progress-repository';

const STORAGE_KEY = 'english-app-progress';

export class LocalStorageProgressRepository implements IProgressRepository {
  private load(): ProgressStore {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ProgressStore) : {};
    } catch {
      return {};
    }
  }

  private save(store: ProgressStore): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  getProgress(lessonId: string): LessonProgress | null {
    return this.load()[lessonId] ?? null;
  }

  saveProgress(lessonId: string, progress: LessonProgress): void {
    const store = this.load();
    store[lessonId] = progress;
    this.save(store);
  }

  getAllProgress(): ProgressStore {
    return this.load();
  }

  clearProgress(lessonId: string): void {
    const store = this.load();
    delete store[lessonId];
    this.save(store);
  }
}
