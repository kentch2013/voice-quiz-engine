import type { QuizModule } from '../types';
import type { GradeBand, QuizItem, CoinType } from '../../types/quiz';

export function generateCoinIdentificationItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
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

export const coinIdentificationModule: QuizModule = {
  topic: {
    id: 'coin-identification',
    title: '🪙 Coin Identification',
    description: 'Count total value of US coins in cents.',
    icon: '🪙',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateCoinIdentificationItems,
};
