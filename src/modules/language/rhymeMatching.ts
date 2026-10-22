import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateRhymeMatchingItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const rhymePool = [
    { promptWord: 'Cat', emoji: '🐱', correct: 'Hat', distractors: ['Dog', 'Sun', 'Pig'] },
    { promptWord: 'Dog', emoji: '🐶', correct: 'Log', distractors: ['Cat', 'Pen', 'Box'] },
    { promptWord: 'Sun', emoji: '☀️', correct: 'Fun', distractors: ['Pig', 'Hat', 'Top'] },
    { promptWord: 'Frog', emoji: '🐸', correct: 'Dog', distractors: ['Star', 'Bed', 'Car'] },
    { promptWord: 'Bed', emoji: '🛏️', correct: 'Red', distractors: ['Cup', 'Fish', 'Map'] },
    { promptWord: 'Pig', emoji: '🐷', correct: 'Big', distractors: ['Tree', 'Map', 'Sun'] },
    { promptWord: 'Star', emoji: '⭐', correct: 'Car', distractors: ['Book', 'Duck', 'Pen'] },
    { promptWord: 'Fox', emoji: '🦊', correct: 'Box', distractors: ['Moon', 'Key', 'Cat'] },
    { promptWord: 'Bear', emoji: '🐻', correct: 'Chair', distractors: ['Ring', 'Top', 'Log'] },
    { promptWord: 'Ring', emoji: '💍', correct: 'King', distractors: ['Boat', 'Shoe', 'Dog'] },
  ];

  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const entry = rhymePool[i % rhymePool.length];
    const optionsList = [entry.correct, ...entry.distractors.slice(0, 3)].map((val) => ({
      id: val.toLowerCase(),
      label: val,
      value: val,
    }));

    items.push({
      id: `rhyme-${i}-${Date.now()}`,
      topicId: 'rhyme-matching',
      gradeBand,
      prompt: `Which word rhymes with ${entry.promptWord}?`,
      ttsPrompt: `Which word rhymes with ${entry.promptWord}?`,
      ttsPromptZh: `哪个单词和 ${entry.promptWord} 押韵?`,
      expectedAnswer: entry.correct,
      acceptableAnswers: [
        entry.correct,
        entry.correct.toLowerCase(),
        entry.correct.toUpperCase(),
        `${entry.correct.toLowerCase()}s`,
      ],
      widget: {
        type: 'flashcard',
        flashcardProps: {
          text: `${entry.emoji} ${entry.promptWord.toUpperCase()}`,
          subtext: `Find the rhyming word`,
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

export const rhymeMatchingModule: QuizModule = {
  topic: {
    id: 'rhyme-matching',
    title: '🎵 Rhyme Matching',
    description: 'Match words that rhyme with the target prompt word.',
    icon: '🎵',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateRhymeMatchingItems,
};
