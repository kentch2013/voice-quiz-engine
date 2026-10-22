import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateSpatialPrepositionsItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const scenes: {
    subject: string;
    target: string;
    preposition: 'under' | 'on' | 'in' | 'above' | 'behind' | 'next to';
    subjectEmoji: string;
    targetEmoji: string;
    acceptable: string[];
    distractors: string[];
  }[] = [
    {
      subject: 'cat',
      target: 'table',
      preposition: 'under',
      subjectEmoji: '🐱',
      targetEmoji: '🛋️',
      acceptable: ['under', 'Under', 'UNDER', 'underneath', "it's under", 'its under', 'is under', 'under the table'],
      distractors: ['On', 'In', 'Above'],
    },
    {
      subject: 'dog',
      target: 'rug',
      preposition: 'on',
      subjectEmoji: '🐶',
      targetEmoji: '🟫',
      acceptable: ['on', 'On', 'ON', 'onto', 'on top', "it's on", 'its on', 'is on', 'on the rug'],
      distractors: ['Under', 'In', 'Behind'],
    },
    {
      subject: 'bird',
      target: 'tree',
      preposition: 'in',
      subjectEmoji: '🐦',
      targetEmoji: '🌳',
      acceptable: ['in', 'In', 'IN', 'inside', "it's in", 'its in', 'is in', 'in the tree'],
      distractors: ['Under', 'On', 'Behind'],
    },
    {
      subject: 'sun',
      target: 'cloud',
      preposition: 'above',
      subjectEmoji: '☀️',
      targetEmoji: '☁️',
      acceptable: ['above', 'Above', 'ABOVE', 'over', "it's above", 'its above', 'is above', 'above the cloud'],
      distractors: ['Under', 'In', 'On'],
    },
    {
      subject: 'ball',
      target: 'box',
      preposition: 'behind',
      subjectEmoji: '⚽',
      targetEmoji: '📦',
      acceptable: ['behind', 'Behind', 'BEHIND', 'in back of', "it's behind", 'its behind', 'is behind', 'behind the box'],
      distractors: ['On', 'Under', 'Above'],
    },
    {
      subject: 'book',
      target: 'lamp',
      preposition: 'next to',
      subjectEmoji: '📚',
      targetEmoji: '💡',
      acceptable: ['next to', 'Next to', 'NEXT TO', 'beside', 'by', 'next', "it's next to", 'its next to', 'is next to'],
      distractors: ['Under', 'In', 'Above'],
    },
  ];

  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const scene = scenes[i % scenes.length];
    const capitalPrep = scene.preposition.charAt(0).toUpperCase() + scene.preposition.slice(1);

    const optionsList = [
      { id: scene.preposition, label: capitalPrep, value: capitalPrep },
      ...scene.distractors.map((d) => ({ id: d.toLowerCase(), label: d, value: d })),
    ].slice(0, 4);

    items.push({
      id: `spatial-${i}-${Date.now()}`,
      topicId: 'spatial-prepositions',
      gradeBand,
      prompt: `Where is the ${scene.subject}?`,
      ttsPrompt: `Where is the ${scene.subject}? Is it ${scene.preposition} or something else?`,
      ttsPromptZh: `${scene.subject} 在哪里?`,
      expectedAnswer: capitalPrep,
      acceptableAnswers: scene.acceptable,
      widget: {
        type: 'spatialscene',
        spatialSceneProps: {
          subject: scene.subject,
          target: scene.target,
          preposition: scene.preposition,
          subjectEmoji: scene.subjectEmoji,
          targetEmoji: scene.targetEmoji,
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

export const spatialPrepositionsModule: QuizModule = {
  topic: {
    id: 'spatial-prepositions',
    title: '🧭 Spatial Prepositions',
    description: 'Identify spatial relationships like on, under, above, or in.',
    icon: '🧭',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateSpatialPrepositionsItems,
};
