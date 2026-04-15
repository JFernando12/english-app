import 'server-only';
import { Lesson, Sentence } from '@/lib/types';
import { ISentencesRepository } from '../sentences-repository';
import lessonsData from '../../../sentences/lessons.json';

let _cache: Lesson[] | null = null;

function loadAll(): Lesson[] {
  if (_cache) return _cache;
  _cache = lessonsData as Lesson[];
  return _cache;
}

export class JsonSentencesRepository implements ISentencesRepository {
  async getAllLessons(): Promise<Lesson[]> {
    return loadAll();
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    return loadAll().find((l) => l.id === id) ?? null;
  }

  async getAllSentences(): Promise<Sentence[]> {
    return loadAll().flatMap((l) => l.sentences);
  }
}
