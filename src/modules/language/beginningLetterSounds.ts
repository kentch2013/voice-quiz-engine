import type { QuizModule } from '../types';
import type { GradeBand, QuizItem, WhackAMoleOption } from '../../types/quiz';
import { getLetterAcceptableAnswers } from './letterIdentification';

export const BEGINNING_SOUNDS_POOL = [
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

export function generateBeginningLetterSoundsItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const entry = BEGINNING_SOUNDS_POOL[i % BEGINNING_SOUNDS_POOL.length];
    const prompt = `Whack words starting with: ${entry.letter} ${entry.emoji}`;
    const ttsPrompt = `Whack words starting with: ${entry.letter}`;
    const ttsPromptZh = `打掉以字母 ${entry.letter} 开头的单词！`;

    const options: WhackAMoleOption[] = BEGINNING_SOUNDS_POOL.map((item, idx) => ({
      id: `sound-opt-${idx}-${item.word.toLowerCase()}`,
      word: item.word,
      emoji: item.emoji,
      isTarget: item.letter.toUpperCase() === entry.letter.toUpperCase(),
    }));

    const moleProps = {
      prompt,
      targetHits: 10,
      timeLimit: 45,
      options,
    };

    items.push({
      id: `bg-sound-${i}-${Date.now()}`,
      topicId: 'beginning-letter-sounds',
      gradeBand,
      prompt,
      ttsPrompt,
      ttsPromptConcise: `Words starting with ${entry.letter}`,
      ttsPromptZh,
      ttsPromptZhConcise: `以 ${entry.letter} 开头的单词`,
      expectedAnswer: 'completed',
      acceptableAnswers: ['completed', 'done', 'win', '10', entry.letter, ...getLetterAcceptableAnswers(entry.letter)],
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

export const beginningLetterSoundsModule: QuizModule = {
  topic: {
    id: 'beginning-letter-sounds',
    title: '🗣️ Beginning Letter Sounds',
    description: 'Whack the moles with words matching the initial letter sound!',
    icon: '🗣️',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateBeginningLetterSoundsItems,
};
