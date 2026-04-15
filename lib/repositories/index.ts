import { ISentencesRepository } from './sentences-repository';
import { JsonSentencesRepository } from './impl/json-sentences-repository';

let _instance: ISentencesRepository | null = null;

export function getSentencesRepository(): ISentencesRepository {
  if (!_instance) _instance = new JsonSentencesRepository();
  return _instance;
}
