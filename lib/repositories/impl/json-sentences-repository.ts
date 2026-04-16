import 'server-only';
import { Lesson, Sentence } from '@/lib/types';
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

  async getAllSentences(): Promise<Sentence[]> {
    return loadAll();
  }
}
