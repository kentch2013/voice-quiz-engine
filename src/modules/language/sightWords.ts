import type { QuizModule } from '../types';
import type { GradeBand, QuizItem, WhackAMoleOption } from '../../types/quiz';

export const SIGHT_WORDS_K1 = ['CAT', 'DOG', 'SUN', 'HAT', 'RUN', 'BIG', 'RED', 'BLUE', 'YES', 'NO'];
export const SIGHT_WORDS_23 = ['ABOUT', 'BEFORE', 'COULD', 'FIRST', 'LITTLE', 'RIGHT', 'THEIR', 'THESE', 'WHICH', 'WOULD'];

const SIGHT_WORD_EMOJIS: Record<string, string> = {
  CAT: '🐱',
  DOG: '🐶',
  SUN: '☀️',
  HAT: '🧢',
  RUN: '🏃',
  BIG: '🐘',
  RED: '🔴',
  BLUE: '🔵',
  YES: '✅',
  NO: '❌',
  ABOUT: 'ℹ️',
  BEFORE: '⏮️',
  COULD: '💭',
  FIRST: '🥇',
  LITTLE: '🐥',
  RIGHT: '👉',
  THEIR: '👥',
  THESE: '👉',
  WHICH: '❓',
  WOULD: '💡',
};

export function generateSightWordItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const wordPool = gradeBand === 'K-1' ? SIGHT_WORDS_K1 : SIGHT_WORDS_23;
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const word = wordPool[i % wordPool.length];
    const prompt = `Whack the word: ${word}`;
    const ttsPrompt = `Whack the word: ${word}`;
    const ttsPromptZh = `打掉单词：${word}`;

    const options: WhackAMoleOption[] = wordPool.map((w, idx) => ({
      id: `sight-opt-${idx}-${w.toLowerCase()}`,
      word: w,
      emoji: SIGHT_WORD_EMOJIS[w] || '🐹',
      isTarget: w.toUpperCase() === word.toUpperCase(),
    }));

    const moleProps = {
      prompt,
      targetHits: 10,
      timeLimit: 45,
      options,
    };

    items.push({
      id: `sight-${i}-${Date.now()}`,
      topicId: 'sight-words',
      gradeBand,
      prompt,
      ttsPrompt,
      ttsPromptConcise: `Whack ${word}`,
      ttsPromptZh,
      ttsPromptZhConcise: `打掉 ${word}`,
      expectedAnswer: 'completed',
      acceptableAnswers: [
        'completed',
        'done',
        'win',
        '10',
        word,
        word.toLowerCase(),
        word.toUpperCase(),
      ],
      widget: {
        type: 'whackamole',
        whackamoleProps: moleProps,
        whackAMoleProps: moleProps,
      },
      keypad: {
        type: 'none',
      },
    });
  }

  return items;
}

export const sightWordsModule: QuizModule = {
  topic: {
    id: 'sight-words',
    title: '🔤 Sight Words & Letters',
    description: 'Recognize letters, high-frequency sight words, and phonics.',
    icon: '🔤',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateSightWordItems,
};
