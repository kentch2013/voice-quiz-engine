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
    id: 'single-digit-addition',
    title: '➕ Single-Digit Addition',
    description: 'Practice basic single-digit addition sums.',
    icon: '➕',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'single-digit-subtraction',
    title: '➖ Single-Digit Subtraction',
    description: 'Practice basic single-digit subtraction differences.',
    icon: '➖',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'number-bonds-10',
    title: '🔟 Number Bonds to 10',
    description: 'Find missing numbers that add up to 10 using ten-frames.',
    icon: '🔟',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'skip-counting',
    title: '🔢 Skip Counting',
    description: 'Count by 2s, 5s, or 10s to complete number patterns.',
    icon: '🔢',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'greater-less-than',
    title: '⚖️ Greater or Less Than',
    description: 'Compare two numbers and identify which is bigger or smaller.',
    icon: '⚖️',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'place-value-blocks',
    title: '🧊 Place Value Blocks',
    description: 'Count tens rods and unit cubes to determine numbers.',
    icon: '🧊',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'coin-identification',
    title: '🪙 Coin Identification',
    description: 'Identify US pennies, nickels, dimes, quarters, and their values.',
    icon: '🪙',
    gradeBands: ['K-1', '2-3'],
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
    case 'single-digit-addition':
      return generateSingleDigitAdditionItems(gradeBand, count);
    case 'single-digit-subtraction':
      return generateSingleDigitSubtractionItems(gradeBand, count);
    case 'number-bonds-10':
      return generateNumberBonds10Items(gradeBand, count);
    case 'skip-counting':
      return generateSkipCountingItems(gradeBand, count);
    case 'greater-less-than':
      return generateGreaterLessThanItems(gradeBand, count);
    case 'place-value-blocks':
      return generatePlaceValueBlocksItems(gradeBand, count);
    case 'coin-identification':
      return generateCoinIdentificationItems(gradeBand, count);
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

function generateSingleDigitAdditionItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    const operandA = Math.floor(Math.random() * 10);
    const operandB = Math.floor(Math.random() * 10);
    const expected = operandA + operandB;

    items.push({
      id: `add-${i}-${Date.now()}`,
      topicId: 'single-digit-addition',
      gradeBand,
      prompt: `${operandA} + ${operandB} = ?`,
      ttsPrompt: `What is ${operandA} plus ${operandB}?`,
      expectedAnswer: expected,
      acceptableAnswers: [expected, expected.toString()],
      operandA,
      operandB,
      widget: {
        type: 'equation',
        equationProps: {
          operandA,
          operandB,
          operator: '+',
          displayFormat: 'equation',
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }
  return items;
}

function generateSingleDigitSubtractionItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    const operandA = Math.floor(Math.random() * 10);
    const operandB = Math.floor(Math.random() * (operandA + 1));
    const expected = operandA - operandB;

    items.push({
      id: `sub-${i}-${Date.now()}`,
      topicId: 'single-digit-subtraction',
      gradeBand,
      prompt: `${operandA} - ${operandB} = ?`,
      ttsPrompt: `What is ${operandA} minus ${operandB}?`,
      expectedAnswer: expected,
      acceptableAnswers: [expected, expected.toString()],
      operandA,
      operandB,
      widget: {
        type: 'equation',
        equationProps: {
          operandA,
          operandB,
          operator: '-',
          displayFormat: 'equation',
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }
  return items;
}

function generateNumberBonds10Items(gradeBand: GradeBand, count: number): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    const givenAddend = Math.floor(Math.random() * 11); // 0 to 10
    const missingAddend = 10 - givenAddend;

    items.push({
      id: `bond-${i}-${Date.now()}`,
      topicId: 'number-bonds-10',
      gradeBand,
      prompt: `${givenAddend} + ___ = 10`,
      ttsPrompt: `${givenAddend} plus what number equals 10?`,
      expectedAnswer: missingAddend,
      acceptableAnswers: [missingAddend, missingAddend.toString()],
      operandA: givenAddend,
      operandB: missingAddend,
      widget: {
        type: 'tenframe',
        tenFrameProps: {
          count: givenAddend,
          total: 10,
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }
  return items;
}

function generateSkipCountingItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const stepPool = gradeBand === 'K-1' ? [2, 5, 10] : [2, 3, 5, 10];
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const step = stepPool[i % stepPool.length];
    const startMultiplier = Math.floor(Math.random() * 4) + 1;
    const start = startMultiplier * step;

    const seq = [start, start + step, start + 2 * step];
    const missing = start + 3 * step;

    items.push({
      id: `skip-${i}-${Date.now()}`,
      topicId: 'skip-counting',
      gradeBand,
      prompt: `${seq.join(', ')}, ___`,
      ttsPrompt: `What number comes next in the sequence: ${seq.join(', ')}?`,
      expectedAnswer: missing,
      acceptableAnswers: [missing, missing.toString()],
      widget: {
        type: 'equation',
        equationProps: {
          sequence: [...seq, '___'],
          displayFormat: 'sequence',
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }
  return items;
}

function generateGreaterLessThanItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    const maxVal = gradeBand === 'K-1' ? 30 : 99;
    const minVal = gradeBand === 'K-1' ? 1 : 10;

    let numA = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    let numB = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    while (numB === numA) {
      numB = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    }

    const isBigger = i % 2 === 0;
    const expected = isBigger ? Math.max(numA, numB) : Math.min(numA, numB);

    items.push({
      id: `glt-${i}-${Date.now()}`,
      topicId: 'greater-less-than',
      gradeBand,
      prompt: `Which is ${isBigger ? 'bigger' : 'smaller'}? ${numA} or ${numB}`,
      ttsPrompt: `Which number is ${isBigger ? 'bigger' : 'smaller'}: ${numA} or ${numB}?`,
      expectedAnswer: expected,
      acceptableAnswers: [expected, expected.toString()],
      widget: {
        type: 'equation',
        equationProps: {
          operandA: numA,
          operandB: numB,
          operator: 'vs',
          displayFormat: 'comparison',
        },
      },
      keypad: {
        type: 'choice',
        options: [
          { id: numA.toString(), label: numA.toString(), value: numA.toString() },
          { id: numB.toString(), label: numB.toString(), value: numB.toString() },
        ],
      },
    });
  }
  return items;
}

function generatePlaceValueBlocksItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    const tens = Math.floor(Math.random() * 9) + 1; // 1 to 9
    const ones = Math.floor(Math.random() * 10); // 0 to 9
    const total = tens * 10 + ones;

    items.push({
      id: `pvb-${i}-${Date.now()}`,
      topicId: 'place-value-blocks',
      gradeBand,
      prompt: `What number is shown by the blocks?`,
      ttsPrompt: `Count the tens rods and unit cubes. What number is shown?`,
      expectedAnswer: total,
      acceptableAnswers: [total, total.toString()],
      widget: {
        type: 'placevalue',
        placeValueProps: {
          tens,
          ones,
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }
  return items;
}

function generateCoinIdentificationItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const coinsPool: { id: 'penny' | 'nickel' | 'dime' | 'quarter'; name: string; label: string; value: number }[] = [
    { id: 'penny', name: 'penny', label: 'Penny', value: 1 },
    { id: 'nickel', name: 'nickel', label: 'Nickel', value: 5 },
    { id: 'dime', name: 'dime', label: 'Dime', value: 10 },
    { id: 'quarter', name: 'quarter', label: 'Quarter', value: 25 },
  ];

  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    const coin = coinsPool[i % coinsPool.length];
    const isNameQuestion = i % 2 === 0;

    if (isNameQuestion) {
      items.push({
        id: `coin-${i}-${Date.now()}`,
        topicId: 'coin-identification',
        gradeBand,
        prompt: `What coin is this?`,
        ttsPrompt: `What coin is this?`,
        expectedAnswer: coin.name,
        acceptableAnswers: [
          coin.name,
          coin.label,
          coin.value,
          coin.value.toString(),
          `${coin.value} cents`,
          `${coin.value}c`,
          `${coin.value}¢`,
        ],
        widget: {
          type: 'coin',
          coinProps: {
            coin: coin.id,
          },
        },
        keypad: {
          type: 'choice',
          options: coinsPool.map((c) => ({
            id: c.id,
            label: c.label,
            value: c.name,
          })),
        },
      });
    } else {
      items.push({
        id: `coin-${i}-${Date.now()}`,
        topicId: 'coin-identification',
        gradeBand,
        prompt: `How many cents is a ${coin.label} worth?`,
        ttsPrompt: `How many cents is a ${coin.label} worth?`,
        expectedAnswer: coin.value,
        acceptableAnswers: [
          coin.value,
          coin.value.toString(),
          coin.name,
          coin.label,
          `${coin.value} cents`,
          `${coin.value}c`,
          `${coin.value}¢`,
        ],
        widget: {
          type: 'coin',
          coinProps: {
            coin: coin.id,
          },
        },
        keypad: {
          type: 'choice',
          options: coinsPool.map((c) => ({
            id: c.id,
            label: `${c.value}¢`,
            value: c.value.toString(),
          })),
        },
      });
    }
  }
  return items;
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
