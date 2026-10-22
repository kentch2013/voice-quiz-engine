import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateSingleDigitAdditionBubbleShooterItem(gradeBand: GradeBand = 'K-1', index: number = 0): QuizItem {
  return {
    id: `add-bubble-${index}-${Date.now()}`,
    topicId: 'single-digit-addition',
    gradeBand,
    prompt: 'Hex Bubble Shooter Math Game',
    ttsPrompt: 'Bubble Shooter! Shoot bubbles to form valid addition facts!',
    ttsPromptConcise: 'Hex Bubble Shooter',
    ttsPromptZh: '泡泡射击游戏！射击泡泡组成加法等式！',
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

export function generateSingleDigitAdditionItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    if (count >= 10) {
      items.push(generateSingleDigitAdditionBubbleShooterItem(gradeBand, i));
      continue;
    }

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
