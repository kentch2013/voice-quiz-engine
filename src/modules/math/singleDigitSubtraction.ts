import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateSingleDigitSubtractionBubbleShooterItem(gradeBand: GradeBand = 'K-1'): QuizItem {
  return {
    id: `sub-bubble-${Date.now()}`,
    topicId: 'single-digit-subtraction',
    gradeBand,
    prompt: 'Hex Bubble Shooter Math Game',
    ttsPrompt: 'Bubble Shooter! Shoot bubbles to form valid subtraction number facts!',
    ttsPromptConcise: 'Hex Bubble Shooter',
    ttsPromptZh: '泡泡射击游戏！射击泡泡组成减法等式！',
    ttsPromptZhConcise: '六角泡泡射击',
    expectedAnswer: 'completed',
    widget: {
      type: 'bubbleshooter',
      bubbleShooterProps: {
        targetTriplesCount: 5,
      },
    },
    keypad: {
      type: 'none',
    },
  };
}

export function generateSingleDigitSubtractionItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    if (count >= 10 && i === 0) {
      items.push(generateSingleDigitSubtractionBubbleShooterItem(gradeBand));
      continue;
    }

    const operandA = Math.floor(Math.random() * 10);
    const operandB = Math.floor(Math.random() * (operandA + 1));
    const expected = operandA - operandB;

    items.push({
      id: `sub-${i}-${Date.now()}`,
      topicId: 'single-digit-subtraction',
      gradeBand,
      prompt: `${operandA} - ${operandB} = ?`,
      ttsPrompt: `What is ${operandA} minus ${operandB}?`,
      ttsPromptConcise: `${operandA} minus ${operandB}`,
      ttsPromptZh: `${operandA} 减 ${operandB} 等于多少?`,
      ttsPromptZhConcise: `${operandA} 减 ${operandB}`,
      expectedAnswer: expected,
      acceptableAnswers: [expected, expected.toString()],
      operandA,
      operandB,
      widget: {
        type: 'equation',
        equationProps: {
          operandA,
          operandB,
          operator: '-',
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

export const singleDigitSubtractionModule: QuizModule = {
  topic: {
    id: 'single-digit-subtraction',
    title: '➖ Single-Digit Subtraction',
    description: 'Practice basic single-digit subtraction differences.',
    icon: '➖',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateSingleDigitSubtractionItems,
};
