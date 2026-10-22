import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';
import { getLetterAcceptableAnswers } from './letterIdentification';

export function generateBeginningLetterSoundsItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const soundPool = [
    { word: 'Duck', emoji: '🦆', letter: 'D' },
    { word: 'Apple', emoji: '🍎', letter: 'A' },
    { word: 'Cat', emoji: '🐱', letter: 'C' },
    { word: 'Bear', emoji: '🐻', letter: 'B' },
    { word: 'Fish', emoji: '🐟', letter: 'F' },
    { word: 'Lion', emoji: '🦁', letter: 'L' },
    { word: 'Monkey', emoji: '🐒', letter: 'M' },
    { word: 'Sun', emoji: '☀️', letter: 'S' },
    { word: 'Tiger', emoji: '🐯', letter: 'T' },
    { word: 'Zebra', emoji: '🦓', letter: 'Z' },
    { word: 'Pig', emoji: '🐷', letter: 'P' },
    { word: 'Snake', emoji: '🐍', letter: 'S' },
  ];

  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const entry = soundPool[i % soundPool.length];

    items.push({
      id: `bg-sound-${i}-${Date.now()}`,
      topicId: 'beginning-letter-sounds',
      gradeBand,
      prompt: `What letter does ${entry.word} start with?`,
      ttsPrompt: `What letter does ${entry.word} start with?`,
      ttsPromptZh: `${entry.word} 以什么字母开头?`,
      expectedAnswer: entry.letter,
      acceptableAnswers: getLetterAcceptableAnswers(entry.letter),
      widget: {
        type: 'flashcard',
        flashcardProps: {
          text: `${entry.emoji} ${entry.word}`,
          category: 'phonics',
          fontSize: '64px',
        },
      },
      keypad: {
        type: 'alphabet',
      },
    });
  }

  return items;
}

export const beginningLetterSoundsModule: QuizModule = {
  topic: {
    id: 'beginning-letter-sounds',
    title: '🗣️ Beginning Letter Sounds',
    description: 'Identify the initial letter sound for pictured words.',
    icon: '🗣️',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateBeginningLetterSoundsItems,
};
