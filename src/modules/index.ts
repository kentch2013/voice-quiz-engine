import type { QuizModule } from './types';
import type { GradeBand, QuizItem, Topic } from '../types/quiz';
import { mathModules } from './math';
import {
  sightWordsModule,
  letterIdentificationModule,
  beginningLetterSoundsModule,
  rhymeMatchingModule,
  oppositesAntonymsModule,
  pluralFormsModule,
  LETTER_SPOKEN_NAMES,
} from './language';
import { logicModules } from './logic';

export const quizRegistry: QuizModule[] = [
  ...mathModules,
  sightWordsModule,
  letterIdentificationModule,
  beginningLetterSoundsModule,
  rhymeMatchingModule,
  oppositesAntonymsModule,
  pluralFormsModule,
  ...logicModules,
];

export const TOPICS: Topic[] = quizRegistry.map((m) => m.topic);

const moduleMap = new Map<string, QuizModule>(
  quizRegistry.map((m) => [m.topic.id, m])
);

export function generateQuizItems(
  topicId: string,
  gradeBand: GradeBand = 'K-1',
  count: number = 10
): QuizItem[] {
  const module = moduleMap.get(topicId);
  if (module) {
    return module.generate(gradeBand, count);
  }
  // Default fallback: math-sprint
  const fallbackModule = moduleMap.get('math-sprint');
  if (fallbackModule) {
    return fallbackModule.generate(gradeBand, count);
  }
  return [];
}

export { LETTER_SPOKEN_NAMES };
export * from './types';
export * from './math';
export * from './language';
export * from './logic';
