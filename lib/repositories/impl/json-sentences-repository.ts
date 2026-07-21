import 'server-only';
import { Category, Lesson, Sentence } from '@/lib/types';
import { ISentencesRepository } from '../sentences-repository';
import sentencesData from '../../../sentences/lessons.json';

let _cache: Sentence[] | null = null;

function loadAll(): Sentence[] {
  if (_cache) return _cache;
  _cache = sentencesData as Sentence[];
  return _cache;
}

export class JsonSentencesRepository implements ISentencesRepository {
  async getAllLessons(): Promise<Lesson[]> {
    return [{ id: 'all', lessonNumber: 1, sentences: loadAll() }];
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    if (id === 'all') return { id: 'all', lessonNumber: 1, sentences: loadAll() };
    return null;
  }

  async getAllSentences(category?: Category): Promise<Sentence[]> {
    const all = loadAll();
    return category ? all.filter((s) => s.category === category) : all;
  }
}
