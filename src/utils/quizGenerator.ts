import type { Topic, GradeBand, QuizItem, CoinType } from '../types/quiz';
import { generateMathProblems } from './mathGenerator';

export const TOPICS: Topic[] = [
  {
    id: 'math-sprint',
    title: '⚡ Multiplication Facts',
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
    title: '🐍 Number Snake Game',
    description: 'Guide the snake to eat numbers in order from least to greatest or greatest to least!',
    icon: '🐍',
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
    description: 'Count total value of US coins in cents.',
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
  {
    id: 'letter-identification',
    title: '🔤 Letter Identification',
    description: 'Practice uppercase and lowercase letter flashcards.',
    icon: '🔤',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'beginning-letter-sounds',
    title: '🗣️ Beginning Letter Sounds',
    description: 'Identify the initial letter sound for pictured words.',
    icon: '🗣️',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'rhyme-matching',
    title: '🎵 Rhyme Matching',
    description: 'Match words that rhyme with the target prompt word.',
    icon: '🎵',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'opposites-antonyms',
    title: '↔️ Opposites & Antonyms',
    description: 'Identify antonyms and word opposites.',
    icon: '↔️',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'plural-forms',
    title: '📦 Plural Forms',
    description: 'Convert singular words into their plural forms.',
    icon: '📦',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'even-or-odd',
    title: '⚖️ Even or Odd',
    description: 'Determine whether numbers are even or odd.',
    icon: '⚖️',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'spatial-prepositions',
    title: '🧭 Spatial Prepositions',
    description: 'Identify spatial relationships like on, under, above, or in.',
    icon: '🧭',
    gradeBands: ['K-1', '2-3'],
  },
  {
    id: 'odd-one-out',
    title: '🔍 Odd One Out',
    description: 'Find the item that does not belong in the group.',
    icon: '🔍',
    gradeBands: ['K-1', '2-3'],
  },
];

export function getTTSPrompt(
  item: QuizItem,
  language: 'en-US' | 'zh-CN',
  index: number
): string {
  const isConcise = index > 0;

  if (language === 'zh-CN') {
    if (isConcise && item.ttsPromptZhConcise !== undefined) {
      return item.ttsPromptZhConcise;
    }
    if (item.ttsPromptZh) {
      return item.ttsPromptZh;
    }
    return item.prompt;
  }

  if (isConcise && item.ttsPromptConcise !== undefined) {
    return item.ttsPromptConcise;
  }
  return item.ttsPrompt || item.prompt;
}

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
    case 'letter-identification':
      return generateLetterIdentificationItems(gradeBand, count);
    case 'beginning-letter-sounds':
      return generateBeginningLetterSoundsItems(gradeBand, count);
    case 'rhyme-matching':
      return generateRhymeMatchingItems(gradeBand, count);
    case 'opposites-antonyms':
      return generateOppositesAntonymsItems(gradeBand, count);
    case 'plural-forms':
      return generatePluralFormsItems(gradeBand, count);
    case 'even-or-odd':
      return generateEvenOrOddItems(gradeBand, count);
    case 'spatial-prepositions':
      return generateSpatialPrepositionsItems(gradeBand, count);
    case 'odd-one-out':
      return generateOddOneOutItems(gradeBand, count);
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
    ttsPromptConcise: `${prob.operandA} times ${prob.operandB}`,
    ttsPromptZh: `${prob.operandA} 乘以 ${prob.operandB} 等于多少?`,
    ttsPromptZhConcise: `${prob.operandA} 乘以 ${prob.operandB}`,
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
      ttsPromptConcise: `${operandA} plus ${operandB}`,
      ttsPromptZh: `${operandA} 加 ${operandB} 等于多少?`,
      ttsPromptZhConcise: `${operandA} 加 ${operandB}`,
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
      ttsPromptConcise: `${operandA} minus ${operandB}`,
      ttsPromptZh: `${operandA} 减 ${operandB} 等于多少?`,
      ttsPromptZhConcise: `${operandA} 减 ${operandB}`,
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
    const givenAddend = Math.floor(Math.random() * 11);
    const missingAddend = 10 - givenAddend;

    items.push({
      id: `bond-${i}-${Date.now()}`,
      topicId: 'number-bonds-10',
      gradeBand,
      prompt: `${givenAddend} + ___ = 10`,
      ttsPrompt: `${givenAddend} plus what number equals 10?`,
      ttsPromptConcise: `${givenAddend} plus what equals 10`,
      ttsPromptZh: `${givenAddend} 加几等于 10?`,
      ttsPromptZhConcise: `${givenAddend} 加几等于 10`,
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
      ttsPromptConcise: `${seq.join(', ')}`,
      ttsPromptZh: `序列 ${seq.join(', ')} 的下一个数字是什么?`,
      ttsPromptZhConcise: `${seq.join(', ')}`,
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
    const numbersSet = new Set<number>();
    while (numbersSet.size < 10) {
      numbersSet.add(Math.floor(Math.random() * 100) + 1);
    }
    const numbers = Array.from(numbersSet);

    const isAscending = i % 2 === 0;
    const mode = isAscending ? 'ascending' : 'descending';

    const prompt = isAscending
      ? 'Eat from Least to Greatest!'
      : 'Eat from Greatest to Least!';

    items.push({
      id: `glt-${i}-${Date.now()}`,
      topicId: 'greater-less-than',
      gradeBand,
      prompt,
      ttsPrompt: prompt,
      ttsPromptConcise: prompt,
      ttsPromptZh: isAscending ? '从最小到最大吃数字！' : '从最大到最小吃数字！',
      ttsPromptZhConcise: isAscending ? '从最小到最大吃数字' : '从最大到最小吃数字',
      expectedAnswer: 'completed',
      acceptableAnswers: ['completed', 'done', 'win', '10'],
      widget: {
        type: 'numbersnake',
        numberSnakeProps: {
          numbers,
          mode,
        },
      },
      keypad: {
        type: 'none',
      },
    });
  }
  return items;
}

function generatePlaceValueBlocksItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const items: QuizItem[] = [];
  for (let i = 0; i < count; i++) {
    const tens = Math.floor(Math.random() * 9) + 1;
    const ones = Math.floor(Math.random() * 10);
    const total = tens * 10 + ones;

    items.push({
      id: `pvb-${i}-${Date.now()}`,
      topicId: 'place-value-blocks',
      gradeBand,
      prompt: `What number is shown by the blocks?`,
      ttsPrompt: `Count the tens rods and unit cubes. What number is shown?`,
      ttsPromptConcise: `What number is shown?`,
      ttsPromptZh: `数一数十位棒和个位块，显示的数字是多少?`,
      ttsPromptZhConcise: `显示的数字是多少?`,
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
  const items: QuizItem[] = [];

  const coinValues: Record<CoinType, number> = { penny: 1, nickel: 5, dime: 10, quarter: 25 };

  const clusters: CoinType[][] = [
    ['quarter', 'quarter', 'dime', 'penny', 'penny', 'penny'],
    ['quarter', 'dime', 'dime', 'nickel', 'penny'],
    ['dime', 'dime', 'nickel', 'nickel', 'penny', 'penny'],
    ['quarter', 'quarter', 'quarter', 'nickel'],
    ['quarter', 'dime', 'nickel', 'penny', 'penny'],
    ['dime', 'dime', 'dime', 'penny', 'penny', 'penny', 'penny'],
    ['quarter', 'quarter', 'dime', 'dime', 'nickel'],
    ['nickel', 'nickel', 'nickel', 'penny', 'penny'],
  ];

  const singleCoins: CoinType[] = ['quarter', 'dime', 'nickel', 'penny'];

  for (let i = 0; i < count; i++) {
    const isSingle = i % 3 === 0;

    if (isSingle) {
      const coin = singleCoins[i % singleCoins.length];
      const val = coinValues[coin];

      const distractors = [val + 5, Math.max(1, val - 5), val + 10, 1].filter((d) => d !== val).slice(0, 3);
      const options = [val, ...distractors]
        .sort(() => Math.random() - 0.5)
        .map((v) => ({ id: v.toString(), label: `${v}¢`, value: v.toString() }));

      items.push({
        id: `coin-${i}-${Date.now()}`,
        topicId: 'coin-identification',
        gradeBand,
        prompt: `How much money is this?`,
        ttsPrompt: `How much money is this?`,
        ttsPromptConcise: ``,
        ttsPromptZh: `这是多少钱？`,
        ttsPromptZhConcise: ``,
        expectedAnswer: val,
        acceptableAnswers: [
          val,
          val.toString(),
          `${val} cents`,
          `${val}c`,
          `${val}¢`,
          `${val}分`,
        ],
        widget: {
          type: 'coin',
          coinProps: {
            coin,
          },
        },
        keypad: {
          type: i % 2 === 0 ? 'choice' : 'numeric',
          options: i % 2 === 0 ? options : undefined,
        },
      });
    } else {
      const cluster = clusters[i % clusters.length];
      const totalCents = cluster.reduce((sum, c) => sum + coinValues[c], 0);

      const distractors = [
        totalCents + 10,
        Math.max(5, totalCents - 10),
        totalCents + 5,
        totalCents - 5,
      ].filter((d) => d > 0 && d !== totalCents).slice(0, 3);

      const options = [totalCents, ...distractors]
        .sort(() => Math.random() - 0.5)
        .map((v) => ({ id: v.toString(), label: `${v}¢`, value: v.toString() }));

      items.push({
        id: `coin-${i}-${Date.now()}`,
        topicId: 'coin-identification',
        gradeBand,
        prompt: `How much money is this?`,
        ttsPrompt: `How much money is this?`,
        ttsPromptConcise: ``,
        ttsPromptZh: `这是多少钱？`,
        ttsPromptZhConcise: ``,
        expectedAnswer: totalCents,
        acceptableAnswers: [
          totalCents,
          totalCents.toString(),
          `${totalCents} cents`,
          `${totalCents}c`,
          `${totalCents}¢`,
          `${totalCents}分`,
        ],
        widget: {
          type: 'coin',
          coinProps: {
            coins: cluster,
          },
        },
        keypad: {
          type: i % 2 === 0 ? 'numeric' : 'choice',
          options: i % 2 !== 0 ? options : undefined,
        },
      });
    }
  }

  return items;
}

function generateShapeItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const shapeDefs: { name: string; acceptable: string[] }[] = [
    { name: 'circle', acceptable: ['circle', 'Circle'] },
    { name: 'square', acceptable: ['square', 'Square'] },
    { name: 'triangle', acceptable: ['triangle', 'Triangle'] },
    { name: 'rectangle', acceptable: ['rectangle', 'Rectangle'] },
    { name: 'oval', acceptable: ['oval', 'Oval', 'ellipse', 'Ellipse'] },
    { name: 'diamond', acceptable: ['diamond', 'Diamond', 'rhombus', 'Rhombus'] },
    { name: 'star', acceptable: ['star', 'Star'] },
    { name: 'heart', acceptable: ['heart', 'Heart'] },
    { name: 'pentagon', acceptable: ['pentagon', 'Pentagon'] },
    { name: 'hexagon', acceptable: ['hexagon', 'Hexagon'] },
    { name: 'octagon', acceptable: ['octagon', 'Octagon'] },
    { name: 'cube', acceptable: ['cube', 'Cube'] },
    { name: 'sphere', acceptable: ['sphere', 'Sphere', 'ball'] },
    { name: 'cylinder', acceptable: ['cylinder', 'Cylinder', 'can'] },
    { name: 'cone', acceptable: ['cone', 'Cone'] },
  ];

  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const targetDef = shapeDefs[i % shapeDefs.length];
    const shapeName = targetDef.name;

    const distractors = shapeDefs
      .filter((s) => s.name !== shapeName)
      .map((s) => s.name);

    // Pick 3 distractors
    const chosenDistractors = distractors
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [shapeName, ...chosenDistractors]
      .sort(() => Math.random() - 0.5)
      .map((name) => ({
        id: name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        value: name,
      }));

    items.push({
      id: `shape-${i}-${Date.now()}`,
      topicId: 'shapes-geometry',
      gradeBand,
      prompt: `What shape is this?`,
      ttsPrompt: `What shape is this?`,
      ttsPromptConcise: ``,
      ttsPromptZh: `这是什么形状？`,
      ttsPromptZhConcise: ``,
      expectedAnswer: shapeName,
      acceptableAnswers: Array.from(
        new Set([shapeName, shapeName.toLowerCase(), shapeName.toUpperCase(), ...targetDef.acceptable])
      ),
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

function generateEvenOrOddItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const maxVal = gradeBand === 'K-1' ? 20 : 100;
    const num = Math.floor(Math.random() * maxVal) + 1;
    const isEven = num % 2 === 0;
    const expected = isEven ? 'Even' : 'Odd';

    const evenAcceptable = [
      'even',
      'Even',
      'EVEN',
      "it's even",
      'its even',
      'is even',
      'an even number',
      'eben',
      'evan',
      'ebin',
      '偶数',
      '双数',
    ];

    const oddAcceptable = [
      'odd',
      'Odd',
      'ODD',
      "it's odd",
      'its odd',
      'is odd',
      'an odd number',
      'aud',
      'awe',
      'od',
      '奇数',
      '单数',
    ];

    items.push({
      id: `even-odd-${i}-${Date.now()}`,
      topicId: 'even-or-odd',
      gradeBand,
      prompt: `Is ${num} Even or Odd?`,
      ttsPrompt: `Is ${num} even or odd?`,
      ttsPromptConcise: `${num} even or odd`,
      ttsPromptZh: `${num} 是单数还是双数?`,
      ttsPromptZhConcise: `${num} 单数还是双数`,
      expectedAnswer: expected,
      acceptableAnswers: isEven ? evenAcceptable : oddAcceptable,
      operandA: num,
      widget: {
        type: 'flashcard',
        flashcardProps: {
          text: `${num}`,
          subtext: `Even or Odd?`,
          category: 'sight-word',
          fontSize: '72px',
        },
      },
      keypad: {
        type: 'choice',
        options: [
          { id: 'even', label: 'Even', value: 'Even' },
          { id: 'odd', label: 'Odd', value: 'Odd' },
        ],
      },
    });
  }

  return items;
}

function generateSpatialPrepositionsItems(gradeBand: GradeBand, count: number): QuizItem[] {
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

function generateOddOneOutItems(gradeBand: GradeBand, count: number): QuizItem[] {
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

const LETTER_SPOKEN_NAMES: Record<string, string[]> = {
  a: ['a', 'ay', 'eh', 'aye', 'hey', 'apple', 'a as in apple', 'letter a'],
  b: ['b', 'bee', 'be', 'boy', 'b as in boy', 'letter b'],
  c: ['c', 'cee', 'see', 'sea', 'si', 'cat', 'c as in cat', 'letter c'],
  d: ['d', 'dee', 'the', 'dog', 'd as in dog', 'letter d'],
  e: ['e', 'ee', 'he', 'egg', 'e as in egg', 'letter e'],
  f: ['f', 'ef', 'eff', 'fish', 'f as in fish', 'letter f'],
  g: ['g', 'gee', 'ji', 'goat', 'g as in goat', 'letter g'],
  h: ['h', 'aitch', 'heitch', 'eight', 'hat', 'h as in hat', 'letter h'],
  i: ['i', 'eye', 'hi', 'high', 'igloo', 'i as in igloo', 'letter i'],
  j: ['j', 'jay', 'jayne', 'jam', 'j as in jam', 'letter j'],
  k: ['k', 'kay', 'okay', 'kite', 'k as in kite', 'letter k'],
  l: ['l', 'el', 'ell', 'lion', 'l as in lion', 'letter l'],
  m: ['m', 'em', 'am', 'monkey', 'm as in monkey', 'letter m'],
  n: ['n', 'en', 'and', 'nest', 'n as in nest', 'letter n'],
  o: ['o', 'oh', 'owe', 'octopus', 'o as in octopus', 'letter o'],
  p: ['p', 'pee', 'pea', 'pig', 'p as in pig', 'letter p'],
  q: ['q', 'cue', 'queue', 'queen', 'q as in queen', 'letter q'],
  r: ['r', 'ar', 'are', 'our', 'rabbit', 'r as in rabbit', 'letter r'],
  s: ['s', 'ess', 'yes', 'sun', 's as in sun', 'letter s'],
  t: ['t', 'tee', 'tea', 'to', 'too', 'two', 'tiger', 't as in tiger', 'letter t'],
  u: ['u', 'you', 'ewe', 'yew', 'umbrella', 'u as in umbrella', 'letter u'],
  v: ['v', 'vee', 'we', 'van', 'v as in van', 'letter v'],
  w: ['w', 'double u', 'double-u', 'doubleyou', 'window', 'w as in window', 'letter w'],
  x: ['x', 'ex', 'axe', 'x-ray', 'xray', 'x as in x-ray', 'letter x'],
  y: ['y', 'why', 'wire', 'yoyo', 'yo-yo', 'y as in yoyo', 'letter y'],
  z: ['z', 'zee', 'zed', 'zebra', 'z as in zebra', 'letter z'],
};

function getLetterAcceptableAnswers(letterChar: string): string[] {
  const lower = letterChar.toLowerCase();
  const upper = letterChar.toUpperCase();
  const phonetics = LETTER_SPOKEN_NAMES[lower] || [lower];
  const combined = new Set<string>([
    lower,
    upper,
    ...phonetics,
    ...phonetics.map((p) => p.toUpperCase()),
  ]);
  return Array.from(combined);
}

function generateLetterIdentificationItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const letter = letters[(i * 3 + 1) % letters.length];
    const isUpper = letter === letter.toUpperCase();

    items.push({
      id: `letter-${i}-${Date.now()}`,
      topicId: 'letter-identification',
      gradeBand,
      prompt: `What ${isUpper ? 'uppercase' : 'lowercase'} letter is this?`,
      ttsPrompt: `What letter is this?`,
      ttsPromptConcise: ``,
      ttsPromptZh: `这是什么字母?`,
      ttsPromptZhConcise: ``,
      expectedAnswer: letter,
      acceptableAnswers: getLetterAcceptableAnswers(letter),
      widget: {
        type: 'flashcard',
        flashcardProps: {
          text: letter,
          category: 'letter',
          fontSize: '96px',
        },
      },
      keypad: {
        type: 'alphabet',
      },
    });
  }

  return items;
}

function generateBeginningLetterSoundsItems(gradeBand: GradeBand, count: number): QuizItem[] {
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

function generateRhymeMatchingItems(gradeBand: GradeBand, count: number): QuizItem[] {
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

function generateOppositesAntonymsItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const antonymPool = [
    { word: 'Cold', emoji: '🧊', opposite: 'Hot', distractors: ['Warm', 'Soft', 'Cool'] },
    { word: 'Big', emoji: '🐘', opposite: 'Small', distractors: ['Large', 'Heavy', 'Tall'] },
    { word: 'Fast', emoji: '🏎️', opposite: 'Slow', distractors: ['Quick', 'Hard', 'High'] },
    { word: 'Up', emoji: '⬆️', opposite: 'Down', distractors: ['Left', 'Right', 'Top'] },
    { word: 'Happy', emoji: '😊', opposite: 'Sad', distractors: ['Glad', 'Mad', 'Nice'] },
    { word: 'Day', emoji: '☀️', opposite: 'Night', distractors: ['Noon', 'Dark', 'Moon'] },
    { word: 'Heavy', emoji: '🏋️', opposite: 'Light', distractors: ['Hard', 'Big', 'Soft'] },
    { word: 'Wet', emoji: '🌧️', opposite: 'Dry', distractors: ['Cold', 'Warm', 'Soft'] },
    { word: 'Open', emoji: '🚪', opposite: 'Closed', distractors: ['Shut', 'Wide', 'Lock'] },
    { word: 'High', emoji: '🏔️', opposite: 'Low', distractors: ['Short', 'Deep', 'Tall'] },
  ];

  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const entry = antonymPool[i % antonymPool.length];
    const optionsList = [entry.opposite, ...entry.distractors.slice(0, 3)].map((val) => ({
      id: val.toLowerCase(),
      label: val,
      value: val,
    }));

    items.push({
      id: `antonym-${i}-${Date.now()}`,
      topicId: 'opposites-antonyms',
      gradeBand,
      prompt: `What is the opposite of ${entry.word}?`,
      ttsPrompt: `What is the opposite of ${entry.word}?`,
      ttsPromptZh: `${entry.word} 的反义词是什么?`,
      expectedAnswer: entry.opposite,
      acceptableAnswers: [
        entry.opposite,
        entry.opposite.toLowerCase(),
        entry.opposite.toUpperCase(),
      ],
      widget: {
        type: 'flashcard',
        flashcardProps: {
          text: `${entry.emoji} ${entry.word}`,
          subtext: `Opposite of ${entry.word}?`,
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

function generatePluralFormsItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const pluralPool = [
    { singular: 'Dog', emoji: '🐶', plural: 'Dogs', distractors: ['Doges', 'Dog', 'Dogies'] },
    { singular: 'Cat', emoji: '🐱', plural: 'Cats', distractors: ['Cates', 'Cat', 'Kittens'] },
    { singular: 'Box', emoji: '📦', plural: 'Boxes', distractors: ['Boxs', 'Box', 'Boxies'] },
    { singular: 'Bus', emoji: '🚌', plural: 'Buses', distractors: ['Buss', 'Bus', 'Buseses'] },
    { singular: 'Fox', emoji: '🦊', plural: 'Foxes', distractors: ['Foxs', 'Fox', 'Foxies'] },
    { singular: 'Apple', emoji: '🍎', plural: 'Apples', distractors: ['Apple', 'Appless', 'Applies'] },
    { singular: 'Book', emoji: '📚', plural: 'Books', distractors: ['Bookes', 'Book', 'Bookies'] },
    { singular: 'Child', emoji: '🧒', plural: 'Children', distractors: ['Childs', 'Childes', 'Child'] },
    { singular: 'Foot', emoji: '🦶', plural: 'Feet', distractors: ['Foots', 'Footes', 'Foot'] },
    { singular: 'Mouse', emoji: '🐭', plural: 'Mice', distractors: ['Mouses', 'Micees', 'Mouse'] },
    { singular: 'Tooth', emoji: '🦷', plural: 'Teeth', distractors: ['Tooths', 'Toothes', 'Tooth'] },
  ];

  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const entry = pluralPool[i % pluralPool.length];
    const optionsList = [entry.plural, ...entry.distractors.slice(0, 3)].map((val) => ({
      id: val.toLowerCase(),
      label: val,
      value: val,
    }));

    items.push({
      id: `plural-${i}-${Date.now()}`,
      topicId: 'plural-forms',
      gradeBand,
      prompt: `1 ${entry.singular} ➔ 3 ___?`,
      ttsPrompt: `If you have one ${entry.singular}, what is the word for three of them?`,
      ttsPromptZh: `一个 ${entry.singular}，三个是什么?`,
      expectedAnswer: entry.plural,
      acceptableAnswers: [
        entry.plural,
        entry.plural.toLowerCase(),
        entry.plural.toUpperCase(),
        `3 ${entry.plural.toLowerCase()}`,
      ],
      widget: {
        type: 'flashcard',
        flashcardProps: {
          text: `1 ${entry.singular} ${entry.emoji} ➔ 3 ___?`,
          subtext: `What is the plural form?`,
          category: 'phonics',
          fontSize: '44px',
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

const HOUR_WORDS: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
};

function generateClockItems(gradeBand: GradeBand, count: number): QuizItem[] {
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    let hours = Math.floor(Math.random() * 12) + 1;
    let minutes = 0;

    if (gradeBand === 'K-1') {
      minutes = i % 2 === 0 ? 0 : 30;
    } else if (gradeBand === '2-3') {
      minutes = [0, 15, 30, 45][i % 4];
    } else {
      minutes = (i * 5) % 60;
    }

    const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;
    const hourWord = HOUR_WORDS[hours] || hours.toString();
    const nextHour = hours % 12 + 1;
    const nextHourWord = HOUR_WORDS[nextHour] || nextHour.toString();

    const acceptableSet = new Set<string | number>([
      timeStr,
      hours,
      hours.toString(),
    ]);

    if (minutes === 0) {
      acceptableSet.add(`${hours}:00`);
      acceptableSet.add(hourWord);
      acceptableSet.add(`${hours} o'clock`);
      acceptableSet.add(`${hours} oclock`);
      acceptableSet.add(`${hourWord} o'clock`);
      acceptableSet.add(`${hourWord} oclock`);
    } else if (minutes === 30) {
      acceptableSet.add(`${hours}:30`);
      acceptableSet.add(`${hours} 30`);
      acceptableSet.add(`${hours}-30`);
      acceptableSet.add(`${hourWord} thirty`);
      acceptableSet.add(`${hourWord}-thirty`);
      acceptableSet.add(`half past ${hours}`);
      acceptableSet.add(`half past ${hourWord}`);
    } else if (minutes === 15) {
      acceptableSet.add(`${hours}:15`);
      acceptableSet.add(`${hours} 15`);
      acceptableSet.add(`${hourWord} fifteen`);
      acceptableSet.add(`quarter past ${hours}`);
      acceptableSet.add(`quarter past ${hourWord}`);
    } else if (minutes === 45) {
      acceptableSet.add(`${hours}:45`);
      acceptableSet.add(`${hours} 45`);
      acceptableSet.add(`${hourWord} forty five`);
      acceptableSet.add(`${hourWord} forty-five`);
      acceptableSet.add(`quarter to ${nextHour}`);
      acceptableSet.add(`quarter to ${nextHourWord}`);
    }

    items.push({
      id: `clock-${i}-${Date.now()}`,
      topicId: 'clock-reading',
      gradeBand,
      prompt: `What time is shown on the clock?`,
      ttsPrompt: `What time is shown on the clock?`,
      ttsPromptConcise: ``,
      ttsPromptZh: `钟表上显示的是几点?`,
      ttsPromptZhConcise: ``,
      expectedAnswer: timeStr,
      acceptableAnswers: Array.from(acceptableSet),
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
      ttsPromptZh: `这有多少个圆点?`,
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
