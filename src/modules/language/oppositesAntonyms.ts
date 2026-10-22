import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateOppositesAntonymsItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const antonymPool = [
    { word: 'Cold', emoji: '🧊', opposite: 'Hot', distractors: ['Warm', 'Soft', 'Cool'] },
    { word: 'Big', emoji: '🐘', opposite: 'Small', distractors: ['Large', 'Heavy', 'Tall'] },
    { word: 'Fast', emoji: '🏎️', opposite: 'Slow', distractors: ['Quick', 'Hard', 'High'] },
    { word: 'Up', emoji: '⬆️', opposite: 'Down', distractors: ['Left', 'Right', 'Top'] },
    { word: 'Happy', emoji: '😊', opposite: 'Sad', distractors: ['Glad', 'Mad', 'Nice'] },
    { word: 'Day', emoji: '☀️', opposite: 'Night', distractors: ['Noon', 'Dark', 'Moon'] },
    { word: 'Heavy', emoji: '🏋️', opposite: 'Light', distractors: ['Hard', 'Big', 'Soft'] },
    { word: 'Wet', emoji: '🌧️', opposite: 'Dry', distractors: ['Cold', 'Warm', 'Soft'] },
    { word: 'Open', emoji: '🚪', opposite: 'Closed', distractors: ['Shut', 'Wide', 'Lock'] },
    { word: 'High', emoji: '🏔️', opposite: 'Low', distractors: ['Short', 'Deep', 'Tall'] },
  ];

  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const entry = antonymPool[i % antonymPool.length];
    const optionsList = [entry.opposite, ...entry.distractors.slice(0, 3)].map((val) => ({
      id: val.toLowerCase(),
      label: val,
      value: val,
    }));

    items.push({
      id: `antonym-${i}-${Date.now()}`,
      topicId: 'opposites-antonyms',
      gradeBand,
      prompt: `What is the opposite of ${entry.word}?`,
      ttsPrompt: `What is the opposite of ${entry.word}?`,
      ttsPromptZh: `${entry.word} 的反义词是什么?`,
      expectedAnswer: entry.opposite,
      acceptableAnswers: [
        entry.opposite,
        entry.opposite.toLowerCase(),
        entry.opposite.toUpperCase(),
      ],
      widget: {
        type: 'flashcard',
        flashcardProps: {
          text: `${entry.emoji} ${entry.word}`,
          subtext: `Opposite of ${entry.word}?`,
          category: 'phonics',
          fontSize: '56px',
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

export const oppositesAntonymsModule: QuizModule = {
  topic: {
    id: 'opposites-antonyms',
    title: '↔️ Opposites & Antonyms',
    description: 'Identify antonyms and word opposites.',
    icon: '↔️',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateOppositesAntonymsItems,
};
