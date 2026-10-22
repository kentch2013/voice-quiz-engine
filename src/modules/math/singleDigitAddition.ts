import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateSingleDigitAdditionItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    const operandA = Math.floor(Math.random() * 10);
    const operandB = Math.floor(Math.random() * 10);
    const expected = operandA + operandB;

    items.push({
      id: `add-${i}-${Date.now()}`,
      topicId: 'single-digit-addition',
      gradeBand,
      prompt: `${operandA} + ${operandB} = ?`,
      ttsPrompt: `What is ${operandA} plus ${operandB}?`,
      ttsPromptConcise: `${operandA} plus ${operandB}`,
      ttsPromptZh: `${operandA} 加 ${operandB} 等于多少?`,
      ttsPromptZhConcise: `${operandA} 加 ${operandB}`,
      expectedAnswer: expected,
      acceptableAnswers: [expected, expected.toString()],
      operandA,
      operandB,
      widget: {
        type: 'equation',
        equationProps: {
          operandA,
          operandB,
          operator: '+',
          displayFormat: 'equation',
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }
  return items;
}

export const singleDigitAdditionModule: QuizModule = {
  topic: {
    id: 'single-digit-addition',
    title: '➕ Single-Digit Addition',
    description: 'Practice basic single-digit addition sums.',
    icon: '➕',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateSingleDigitAdditionItems,
};
