import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';
import { generateMathProblems } from '../../utils/mathGenerator';

export function generateMathItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const problems = generateMathProblems(count);
  return problems.map((prob) => ({
    id: prob.id,
    topicId: 'math-sprint',
    gradeBand,
    prompt: `${prob.operandA} × ${prob.operandB} = ?`,
    ttsPrompt: `What is ${prob.operandA} times ${prob.operandB}?`,
    ttsPromptConcise: `${prob.operandA} times ${prob.operandB}`,
    ttsPromptZh: `${prob.operandA} 乘以 ${prob.operandB} 等于多少?`,
    ttsPromptZhConcise: `${prob.operandA} 乘以 ${prob.operandB}`,
    expectedAnswer: prob.expectedAnswer,
    acceptableAnswers: [prob.expectedAnswer],
    operandA: prob.operandA,
    operandB: prob.operandB,
    widget: { type: 'none' },
    keypad: { type: 'numeric' },
  }));
}

export const mathSprintModule: QuizModule = {
  topic: {
    id: 'math-sprint',
    title: '⚡ Multiplication Facts',
    description: 'Fast-paced mental math & multiplication speed runs.',
    icon: '⚡',
    gradeBands: ['K-1', '2-3', '4-5'],
  },
  generate: generateMathItems,
};
