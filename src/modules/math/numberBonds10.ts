import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateNumberBonds10Items(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    const givenAddend = Math.floor(Math.random() * 9) + 1;
    const missingAddend = 10 - givenAddend;

    items.push({
      id: `bond-${i}-${Date.now()}`,
      topicId: 'number-bonds-10',
      gradeBand,
      prompt: `${givenAddend} + ___ = 10`,
      ttsPrompt: `${givenAddend} plus what number equals 10?`,
      ttsPromptConcise: `${givenAddend} plus what equals 10`,
      ttsPromptZh: `${givenAddend} 加几等于 10?`,
      ttsPromptZhConcise: `${givenAddend} 加几等于 10`,
      expectedAnswer: missingAddend,
      acceptableAnswers: [missingAddend, missingAddend.toString()],
      operandA: givenAddend,
      operandB: missingAddend,
      widget: {
        type: 'tenframe',
        tenFrameProps: {
          count: givenAddend,
          total: 10,
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }
  return items;
}

export const numberBonds10Module: QuizModule = {
  topic: {
    id: 'number-bonds-10',
    title: '🔟 Number Bonds to 10',
    description: 'Find missing numbers that add up to 10 using ten-frames.',
    icon: '🔟',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateNumberBonds10Items,
};
