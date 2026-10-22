import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateEvenOrOddItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const maxVal = gradeBand === 'K-1' ? 20 : 100;
    const num = Math.floor(Math.random() * maxVal) + 1;
    const isEven = num % 2 === 0;
    const expected = isEven ? 'Even' : 'Odd';

    const evenAcceptable = [
      'even',
      'Even',
      'EVEN',
      "it's even",
      'its even',
      'is even',
      'an even number',
      'eben',
      'evan',
      'ebin',
      '偶数',
      '双数',
    ];

    const oddAcceptable = [
      'odd',
      'Odd',
      'ODD',
      "it's odd",
      'its odd',
      'is odd',
      'an odd number',
      'aud',
      'awe',
      'od',
      '奇数',
      '单数',
    ];

    items.push({
      id: `even-odd-${i}-${Date.now()}`,
      topicId: 'even-or-odd',
      gradeBand,
      prompt: `Is ${num} Even or Odd?`,
      ttsPrompt: `Is ${num} even or odd?`,
      ttsPromptConcise: `${num} even or odd`,
      ttsPromptZh: `${num} 是单数还是双数?`,
      ttsPromptZhConcise: `${num} 单数还是双数`,
      expectedAnswer: expected,
      acceptableAnswers: isEven ? evenAcceptable : oddAcceptable,
      operandA: num,
      widget: {
        type: 'flashcard',
        flashcardProps: {
          text: `${num}`,
          subtext: `Even or Odd?`,
          category: 'sight-word',
          fontSize: '72px',
        },
      },
      keypad: {
        type: 'choice',
        options: [
          { id: 'even', label: 'Even', value: 'Even' },
          { id: 'odd', label: 'Odd', value: 'Odd' },
        ],
      },
    });
  }

  return items;
}

export const evenOrOddModule: QuizModule = {
  topic: {
    id: 'even-or-odd',
    title: '⚖️ Even or Odd',
    description: 'Determine whether numbers are even or odd.',
    icon: '⚖️',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateEvenOrOddItems,
};
