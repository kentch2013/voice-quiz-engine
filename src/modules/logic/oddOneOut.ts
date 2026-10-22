import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateOddOneOutItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const problems: {
    category: string;
    items: string[];
    odd: string;
    choices: string[];
    acceptable: string[];
  }[] = [
    {
      category: 'Fruits',
      items: ['Apple 🍎', 'Banana 🍌', 'Car 🚗', 'Grape 🍇'],
      odd: 'Car',
      choices: ['Apple', 'Banana', 'Car', 'Grape'],
      acceptable: ['car', 'Car', 'CAR', 'the car', 'a car', 'automobile'],
    },
    {
      category: 'Animals',
      items: ['Cat 🐱', 'Dog 🐶', 'Pencil ✏️', 'Lion 🦁'],
      odd: 'Pencil',
      choices: ['Cat', 'Dog', 'Pencil', 'Lion'],
      acceptable: ['pencil', 'Pencil', 'PENCIL', 'the pencil', 'a pencil'],
    },
    {
      category: 'Vehicles',
      items: ['Bus 🚌', 'Train 🚆', 'Cookie 🍪', 'Plane ✈️'],
      odd: 'Cookie',
      choices: ['Bus', 'Train', 'Cookie', 'Plane'],
      acceptable: ['cookie', 'Cookie', 'COOKIE', 'the cookie', 'a cookie'],
    },
    {
      category: 'Shapes',
      items: ['Circle ⭕', 'Dog 🐶', 'Square ⬛', 'Triangle 🔺'],
      odd: 'Dog',
      choices: ['Circle', 'Dog', 'Square', 'Triangle'],
      acceptable: ['dog', 'Dog', 'DOG', 'the dog', 'a dog', 'puppy'],
    },
    {
      category: 'Clothes',
      items: ['Shirt 👕', 'Banana 🍌', 'Pants 👖', 'Hat 🎩'],
      odd: 'Banana',
      choices: ['Shirt', 'Banana', 'Pants', 'Hat'],
      acceptable: ['banana', 'Banana', 'BANANA', 'the banana', 'a banana'],
    },
    {
      category: 'Colors',
      items: ['Red 🔴', 'Blue 🔵', 'Chair 🪑', 'Green 🟢'],
      odd: 'Chair',
      choices: ['Red', 'Blue', 'Chair', 'Green'],
      acceptable: ['chair', 'Chair', 'CHAIR', 'the chair', 'a chair'],
    },
    {
      category: 'School Supplies',
      items: ['Pencil ✏️', 'Pizza 🍕', 'Eraser 🧹', 'Ruler 📏'],
      odd: 'Pizza',
      choices: ['Pencil', 'Pizza', 'Eraser', 'Ruler'],
      acceptable: ['pizza', 'Pizza', 'PIZZA', 'the pizza', 'a pizza'],
    },
    {
      category: 'Toys',
      items: ['Doll 🪆', 'Robot 🤖', 'Broccoli 🥦', 'Puzzle 🧩'],
      odd: 'Broccoli',
      choices: ['Doll', 'Robot', 'Broccoli', 'Puzzle'],
      acceptable: ['broccoli', 'Broccoli', 'BROCCOLI', 'the broccoli'],
    },
  ];

  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const entry = problems[i % problems.length];
    const optionsList = entry.choices.map((choice) => ({
      id: choice.toLowerCase(),
      label: choice,
      value: choice,
    }));

    items.push({
      id: `odd-out-${i}-${Date.now()}`,
      topicId: 'odd-one-out',
      gradeBand,
      prompt: `Which one does not belong?`,
      ttsPrompt: `Which item does not belong in this group? ${entry.choices.join(', ')}`,
      ttsPromptZh: `哪一个不属于这一组? ${entry.choices.join(', ')}`,
      expectedAnswer: entry.odd,
      acceptableAnswers: entry.acceptable,
      widget: {
        type: 'flashcard',
        flashcardProps: {
          text: entry.items.join('  '),
          subtext: `Find the odd one out`,
          category: 'phonics',
          fontSize: '28px',
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

export const oddOneOutModule: QuizModule = {
  topic: {
    id: 'odd-one-out',
    title: '🔍 Odd One Out',
    description: 'Find the item that does not belong in the group.',
    icon: '🔍',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateOddOneOutItems,
};
