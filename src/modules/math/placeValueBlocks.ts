import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generatePlaceValueBlocksItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    const tens = Math.floor(Math.random() * 9) + 1;
    const ones = Math.floor(Math.random() * 10);
    const total = tens * 10 + ones;

    items.push({
      id: `pvb-${i}-${Date.now()}`,
      topicId: 'place-value-blocks',
      gradeBand,
      prompt: `What number is shown by the blocks?`,
      ttsPrompt: `Count the tens rods and unit cubes. What number is shown?`,
      ttsPromptConcise: `What number is shown?`,
      ttsPromptZh: `数一数十位棒和个位块，显示的数字是多少?`,
      ttsPromptZhConcise: `显示的数字是多少?`,
      expectedAnswer: total,
      acceptableAnswers: [total, total.toString()],
      widget: {
        type: 'placevalue',
        placeValueProps: {
          tens,
          ones,
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }
  return items;
}

export const placeValueBlocksModule: QuizModule = {
  topic: {
    id: 'place-value-blocks',
    title: '🧊 Place Value Blocks',
    description: 'Count tens rods and unit cubes to determine numbers.',
    icon: '🧊',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generatePlaceValueBlocksItems,
};
