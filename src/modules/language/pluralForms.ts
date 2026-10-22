import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generatePluralFormsItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const pluralPool = [
    { singular: 'Dog', emoji: '🐶', plural: 'Dogs', distractors: ['Doges', 'Dog', 'Dogies'] },
    { singular: 'Cat', emoji: '🐱', plural: 'Cats', distractors: ['Cates', 'Cat', 'Kittens'] },
    { singular: 'Box', emoji: '📦', plural: 'Boxes', distractors: ['Boxs', 'Box', 'Boxies'] },
    { singular: 'Bus', emoji: '🚌', plural: 'Buses', distractors: ['Buss', 'Bus', 'Buseses'] },
    { singular: 'Fox', emoji: '🦊', plural: 'Foxes', distractors: ['Foxs', 'Fox', 'Foxies'] },
    { singular: 'Apple', emoji: '🍎', plural: 'Apples', distractors: ['Apple', 'Appless', 'Applies'] },
    { singular: 'Book', emoji: '📚', plural: 'Books', distractors: ['Bookes', 'Book', 'Bookies'] },
    { singular: 'Child', emoji: '🧒', plural: 'Children', distractors: ['Childs', 'Childes', 'Child'] },
    { singular: 'Foot', emoji: '🦶', plural: 'Feet', distractors: ['Foots', 'Footes', 'Foot'] },
    { singular: 'Mouse', emoji: '🐭', plural: 'Mice', distractors: ['Mouses', 'Micees', 'Mouse'] },
    { singular: 'Tooth', emoji: '🦷', plural: 'Teeth', distractors: ['Tooths', 'Toothes', 'Tooth'] },
  ];

  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const entry = pluralPool[i % pluralPool.length];
    const optionsList = [entry.plural, ...entry.distractors.slice(0, 3)].map((val) => ({
      id: val.toLowerCase(),
      label: val,
      value: val,
    }));

    items.push({
      id: `plural-${i}-${Date.now()}`,
      topicId: 'plural-forms',
      gradeBand,
      prompt: `1 ${entry.singular} ➔ 3 ___?`,
      ttsPrompt: `If you have one ${entry.singular}, what is the word for three of them?`,
      ttsPromptZh: `一个 ${entry.singular}，三个是什么?`,
      expectedAnswer: entry.plural,
      acceptableAnswers: [
        entry.plural,
        entry.plural.toLowerCase(),
        entry.plural.toUpperCase(),
        `3 ${entry.plural.toLowerCase()}`,
      ],
      widget: {
        type: 'flashcard',
        flashcardProps: {
          text: `1 ${entry.singular} ${entry.emoji} ➔ 3 ___?`,
          subtext: `What is the plural form?`,
          category: 'phonics',
          fontSize: '44px',
        },
      },
      keypad: {
        type: 'choice',
        options: optionsList,
      },
    });
  }

  return items;
}

export const pluralFormsModule: QuizModule = {
  topic: {
    id: 'plural-forms',
    title: '📦 Plural Forms',
    description: 'Convert singular words into their plural forms.',
    icon: '📦',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generatePluralFormsItems,
};
