import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateGreaterLessThanItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    const numbersSet = new Set<number>();
    while (numbersSet.size < 10) {
      numbersSet.add(Math.floor(Math.random() * 100) + 1);
    }
    const numbers = Array.from(numbersSet);

    const isAscending = i % 2 === 0;
    const mode = isAscending ? 'ascending' : 'descending';

    const prompt = isAscending
      ? 'Eat from Least to Greatest!'
      : 'Eat from Greatest to Least!';

    items.push({
      id: `glt-${i}-${Date.now()}`,
      topicId: 'greater-less-than',
      gradeBand,
      prompt,
      ttsPrompt: prompt,
      ttsPromptConcise: prompt,
      ttsPromptZh: isAscending ? '从最小到最大吃数字！' : '从最大到最小吃数字！',
      ttsPromptZhConcise: isAscending ? '从最小到最大吃数字' : '从最大到最小吃数字',
      expectedAnswer: 'completed',
      acceptableAnswers: ['completed', 'done', 'win', '10'],
      widget: {
        type: 'numbersnake',
        numberSnakeProps: {
          numbers,
          mode,
        },
      },
      keypad: {
        type: 'none',
      },
    });
  }
  return items;
}

export const greaterLessThanModule: QuizModule = {
  topic: {
    id: 'greater-less-than',
    title: '🐍 Number Snake Game',
    description: 'Guide the snake to eat numbers in order from least to greatest or greatest to least!',
    icon: '🐍',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateGreaterLessThanItems,
};
