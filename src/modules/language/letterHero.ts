import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateLetterHeroItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const letterSet: string[] = [];
    for (let j = 0; j < 10; j++) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      letterSet.push(alphabet[randomIndex]);
    }

    items.push({
      id: `letter-hero-${i}-${Date.now()}`,
      topicId: 'letter-hero',
      gradeBand,
      prompt: 'Letter Hero Rhythm Game!',
      ttsPrompt: 'Say the falling letters as they enter the strike zone!',
      ttsPromptConcise: 'Say the falling letters!',
      ttsPromptZh: '在字母进入击打区时说出它们！',
      ttsPromptZhConcise: '说出掉落的字母！',
      expectedAnswer: 'completed',
      acceptableAnswers: ['completed', 'done', 'win', '10'],
      widget: {
        type: 'letterhero',
        letterHeroProps: {
          letters: letterSet,
        },
      },
      keypad: {
        type: 'none',
      },
    });
  }

  return items;
}

export const letterHeroModule: QuizModule = {
  topic: {
    id: 'letter-hero',
    title: '🎸 Letter Hero Rhythm Game',
    description: 'Say falling letters when they hit the strike zone!',
    icon: '🎸',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateLetterHeroItems,
};
