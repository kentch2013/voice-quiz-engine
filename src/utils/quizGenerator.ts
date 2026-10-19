import type { Topic, GradeBand, QuizItem } from '../types/quiz';
import { generateMathProblems } from './mathGenerator';

export const TOPICS: Topic[] = [
  {
    id: 'math-sprint',
    title: '⚡ Math Sprint',
    description: 'Fast-paced mental math & multiplication speed runs.',
    icon: '⚡',
    gradeBands: ['K-1', '2-3', '4-5'],
  },
  {
    id: 'shapes-geometry',
    title: '📐 Shapes & Geometry',
    description: 'Identify 2D shapes and 3D geometric figures.',
    icon: '📐',
    gradeBands: ['K-1', '2-3', '4-5'],
  },
  {
    id: 'clock-reading',
    title: '🕒 Clock Reading',
    description: 'Read analog clock faces and tell the exact time.',
    icon: '🕒',
    gradeBands: ['K-1', '2-3', '4-5'],
  },
  {
    id: 'dot-counting',
    title: '🔴 Dot Counting',
    description: 'Count visual dot grids and scattered dots up to 20.',
    icon: '🔴',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'sight-words',
    title: '🔤 Sight Words & Letters',
    description: 'Recognize letters, high-frequency sight words, and phonics.',
    icon: '🔤',
    gradeBands: ['K-1', '2-3'],
  },
];

export function generateQuizItems(
  topicId: string,
  gradeBand: GradeBand = 'K-1',
  count: number = 10
): QuizItem[] {
  switch (topicId) {
    case 'shapes-geometry':
      return generateShapeItems(gradeBand, count);
    case 'clock-reading':
      return generateClockItems(gradeBand, count);
    case 'dot-counting':
      return generateDotItems(gradeBand, count);
    case 'sight-words':
      return generateSightWordItems(gradeBand, count);
    case 'math-sprint':
    default:
      return generateMathItems(gradeBand, count);
  }
}

function generateMathItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const problems = generateMathProblems(count);
  return problems.map((prob) => ({
    id: prob.id,
    topicId: 'math-sprint',
    gradeBand,
    prompt: `${prob.operandA} × ${prob.operandB} = ?`,
    ttsPrompt: `What is ${prob.operandA} times ${prob.operandB}?`,
    expectedAnswer: prob.expectedAnswer,
    acceptableAnswers: [prob.expectedAnswer],
    operandA: prob.operandA,
    operandB: prob.operandB,
    widget: { type: 'none' },
    keypad: { type: 'numeric' },
  }));
}

function generateShapeItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const shapesK1: { name: string; tts: string }[] = [
    { name: 'circle', tts: 'What shape is this circle?' },
    { name: 'square', tts: 'What shape is this square?' },
    { name: 'triangle', tts: 'What shape is this triangle?' },
  ];
  const shapesUpper: { name: string; tts: string }[] = [
    { name: 'hexagon', tts: 'What shape is this six-sided shape?' },
    { name: 'cylinder', tts: 'What 3D shape is this cylinder?' },
    { name: 'cube', tts: 'What 3D shape is this cube?' },
  ];

  const pool = gradeBand === 'K-1' ? shapesK1 : [...shapesK1, ...shapesUpper];
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const item = pool[i % pool.length];
    const shapeName = item.name;
    const options = [
      { id: 'circle', label: 'Circle', value: 'circle' },
      { id: 'square', label: 'Square', value: 'square' },
      { id: 'triangle', label: 'Triangle', value: 'triangle' },
      { id: 'hexagon', label: 'Hexagon', value: 'hexagon' },
      { id: 'cylinder', label: 'Cylinder', value: 'cylinder' },
      { id: 'cube', label: 'Cube', value: 'cube' },
    ].filter((opt) => opt.id === shapeName || Math.random() > 0.3).slice(0, 4);

    if (!options.some((opt) => opt.id === shapeName)) {
      options[0] = {
        id: shapeName,
        label: shapeName.charAt(0).toUpperCase() + shapeName.slice(1),
        value: shapeName,
      };
    }

    items.push({
      id: `shape-${i}-${Date.now()}`,
      topicId: 'shapes-geometry',
      gradeBand,
      prompt: `Identify the shape:`,
      ttsPrompt: item.tts,
      expectedAnswer: shapeName,
      acceptableAnswers: [
        shapeName,
        shapeName.toLowerCase(),
        shapeName.toUpperCase(),
      ],
      widget: {
        type: 'shape',
        shapeProps: {
          shape: shapeName as any,
          color: ['#4f46e5', '#059669', '#d97706', '#dc2626'][i % 4],
          size: 180,
        },
      },
      keypad: {
        type: 'choice',
        options,
      },
    });
  }

  return items;
}

function generateClockItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    let hours = Math.floor(Math.random() * 12) + 1;
    let minutes = 0;

    if (gradeBand === '2-3') {
      minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    } else if (gradeBand === '4-5') {
      minutes = Math.floor(Math.random() * 12) * 5;
    }

    const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;
    const hourOnly = hours.toString();

    items.push({
      id: `clock-${i}-${Date.now()}`,
      topicId: 'clock-reading',
      gradeBand,
      prompt: gradeBand === 'K-1' ? `What hour is shown on the clock?` : `What time is shown on the clock?`,
      ttsPrompt: gradeBand === 'K-1' ? `What hour is shown on the clock?` : `What time is shown on the clock?`,
      expectedAnswer: gradeBand === 'K-1' ? hourOnly : minutes === 0 ? hours : timeStr,
      acceptableAnswers: [hours, timeStr, hourOnly, `${hours} o'clock`],
      widget: {
        type: 'clock',
        clockProps: {
          hours,
          minutes,
          showDigital: false,
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }

  return items;
}

function generateDotItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const dotCount = Math.floor(Math.random() * (gradeBand === 'K-1' ? 10 : 20)) + 1;
    const layout = i % 2 === 0 ? 'grid' : 'scattered';

    items.push({
      id: `dot-${i}-${Date.now()}`,
      topicId: 'dot-counting',
      gradeBand,
      prompt: `How many dots do you see?`,
      ttsPrompt: `How many dots are there?`,
      expectedAnswer: dotCount,
      acceptableAnswers: [dotCount, dotCount.toString()],
      widget: {
        type: 'dotgrid',
        dotGridProps: {
          count: dotCount,
          layout,
          color: ['#4f46e5', '#2563eb', '#059669', '#e11d48'][i % 4],
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }

  return items;
}

function generateSightWordItems(gradeBand: GradeBand, count: number): QuizItem[] {
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
      ttsPrompt: `Read this word: ${word.toLowerCase()}`,
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
