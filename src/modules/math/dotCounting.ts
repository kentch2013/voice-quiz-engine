import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateDotItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const dotCount = Math.floor(Math.random() * (gradeBand === 'K-1' ? 10 : 20)) + 1;
    const layout = i % 2 === 0 ? 'grid' : 'scattered';

    items.push({
      id: `dot-${i}-${Date.now()}`,
      topicId: 'dot-counting',
      gradeBand,
      prompt: `How many dots do you see?`,
      ttsPrompt: `How many dots are there?`,
      ttsPromptZh: `这有多少个圆点?`,
      expectedAnswer: dotCount,
      acceptableAnswers: [dotCount, dotCount.toString()],
      widget: {
        type: 'dotgrid',
        dotGridProps: {
          count: dotCount,
          layout,
          color: ['#4f46e5', '#2563eb', '#059669', '#e11d48'][i % 4],
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }

  return items;
}

export const dotCountingModule: QuizModule = {
  topic: {
    id: 'dot-counting',
    title: '🔴 Dot Counting',
    description: 'Count visual dot grids and scattered dots up to 20.',
    icon: '🔴',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateDotItems,
};
