export * from './quiz';

export interface MathProblem {
  id: string;
  operandA: number;
  operandB: number;
  expectedAnswer: number;
}

export interface QuestionResult {
  questionId: string;
  problem: string; // "6 x 7" or prompt description
  expectedAnswer: number | string;
  userAnswer?: number | string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  inputMethod: 'voice' | 'keypad' | 'choice' | 'timeout';
  attemptsCount: number;
}

export interface GameSession {
  sessionId: string;
  startedAt: string;
  completedAt?: string;
  totalQuestions: number;
  correctCount: number;
  totalDurationSeconds: number;
  results: QuestionResult[];
  topicId?: string;
  gradeBand?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  sessions: GameSession[];
}
