import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateSkipCountingItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const stepPool = gradeBand === 'K-1' ? [2, 5, 10] : [2, 3, 5, 10];
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const step = stepPool[i % stepPool.length];
    const startMultiplier = Math.floor(Math.random() * 4) + 1;
    const start = startMultiplier * step;

    const seq = [start, start + step, start + 2 * step];
    const missing = start + 3 * step;

    items.push({
      id: `skip-${i}-${Date.now()}`,
      topicId: 'skip-counting',
      gradeBand,
      prompt: `${seq.join(', ')}, ___`,
      ttsPrompt: `What number comes next in the sequence: ${seq.join(', ')}?`,
      ttsPromptConcise: `${seq.join(', ')}`,
      ttsPromptZh: `序列 ${seq.join(', ')} 的下一个数字是什么?`,
      ttsPromptZhConcise: `${seq.join(', ')}`,
      expectedAnswer: missing,
      acceptableAnswers: [missing, missing.toString()],
      widget: {
        type: 'equation',
        equationProps: {
          sequence: [...seq, '___'],
          displayFormat: 'sequence',
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }
  return items;
}

export const skipCountingModule: QuizModule = {
  topic: {
    id: 'skip-counting',
    title: '🔢 Skip Counting',
    description: 'Count by 2s, 5s, or 10s to complete number patterns.',
    icon: '🔢',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateSkipCountingItems,
};
