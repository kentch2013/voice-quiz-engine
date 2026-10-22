import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateSightWordItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const wordsK1 = ['CAT', 'DOG', 'SUN', 'HAT', 'RUN', 'BIG', 'RED', 'BLUE', 'YES', 'NO'];
  const words23 = ['ABOUT', 'BEFORE', 'COULD', 'FIRST', 'LITTLE', 'RIGHT', 'THEIR', 'THESE', 'WHICH', 'WOULD'];

  const wordPool = gradeBand === 'K-1' ? wordsK1 : words23;
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const word = wordPool[i % wordPool.length];

    items.push({
      id: `sight-${i}-${Date.now()}`,
      topicId: 'sight-words',
      gradeBand,
      prompt: `Read the sight word out loud:`,
      ttsPrompt: `Read this word out loud`,
      ttsPromptConcise: ``,
      ttsPromptZh: `请朗读这个单词`,
      ttsPromptZhConcise: ``,
      expectedAnswer: word.toLowerCase(),
      acceptableAnswers: [word, word.toLowerCase(), word.toUpperCase()],
      widget: {
        type: 'flashcard',
        flashcardProps: {
          text: word,
          category: 'sight-word',
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
