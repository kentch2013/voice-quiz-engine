import type { Topic, GradeBand, QuizItem } from '../types/quiz';

export interface QuizModule {
  topic: Topic;
  generate: (gradeBand?: GradeBand, count?: number) => QuizItem[];
}
