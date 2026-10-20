import { describe, it, expect } from 'vitest';
import { generateQuizItems, getTTSPrompt, TOPICS } from '../quizGenerator';

describe('Batch 1: Math & Number Sense Modules Quiz Generators', () => {
  it('registers all 7 Batch 1 topics in TOPICS array', () => {
    const topicIds = TOPICS.map((t) => t.id);
    expect(topicIds).toContain('single-digit-addition');
    expect(topicIds).toContain('single-digit-subtraction');
    expect(topicIds).toContain('number-bonds-10');
    expect(topicIds).toContain('skip-counting');
    expect(topicIds).toContain('greater-less-than');
    expect(topicIds).toContain('place-value-blocks');
    expect(topicIds).toContain('coin-identification');
  });

  describe('getTTSPrompt helper', () => {
    it('returns full prompt on question 0 and concise prompt on question > 0 for EN and ZH', () => {
      const items = generateQuizItems('single-digit-addition', 'K-1', 2);
      const item = items[0];

      expect(getTTSPrompt(item, 'en-US', 0)).toBe(`What is ${item.operandA} plus ${item.operandB}?`);
      expect(getTTSPrompt(item, 'zh-CN', 0)).toBe(`${item.operandA} 加 ${item.operandB} 等于多少?`);

      expect(getTTSPrompt(item, 'en-US', 1)).toBe(`${item.operandA} plus ${item.operandB}`);
      expect(getTTSPrompt(item, 'zh-CN', 1)).toBe(`${item.operandA} 加 ${item.operandB}`);
    });
  });

  describe('single-digit-addition generator', () => {
    it('generates valid single-digit addition items', () => {
      const items = generateQuizItems('single-digit-addition', 'K-1', 5);
      expect(items).toHaveLength(5);

      items.forEach((item) => {
        expect(item.topicId).toBe('single-digit-addition');
        expect(item.widget?.type).toBe('equation');
        expect(item.keypad?.type).toBe('numeric');
        expect(typeof item.operandA).toBe('number');
        expect(typeof item.operandB).toBe('number');
        expect(item.operandA!).toBeGreaterThanOrEqual(0);
        expect(item.operandA!).toBeLessThanOrEqual(9);
        expect(item.operandB!).toBeGreaterThanOrEqual(0);
        expect(item.operandB!).toBeLessThanOrEqual(9);

        const expectedSum = item.operandA! + item.operandB!;
        expect(item.expectedAnswer).toBe(expectedSum);
        expect(item.acceptableAnswers).toContain(expectedSum);
        expect(item.acceptableAnswers).toContain(expectedSum.toString());
        expect(item.prompt).toBe(`${item.operandA} + ${item.operandB} = ?`);
      });
    });
  });

  describe('single-digit-subtraction generator', () => {
    it('generates valid single-digit subtraction items with non-negative results', () => {
      const items = generateQuizItems('single-digit-subtraction', 'K-1', 5);
      expect(items).toHaveLength(5);

      items.forEach((item) => {
        expect(item.topicId).toBe('single-digit-subtraction');
        expect(item.widget?.type).toBe('equation');
        expect(item.keypad?.type).toBe('numeric');
        expect(item.operandA!).toBeGreaterThanOrEqual(0);
        expect(item.operandA!).toBeLessThanOrEqual(9);
        expect(item.operandB!).toBeGreaterThanOrEqual(0);
        expect(item.operandB!).toBeLessThanOrEqual(item.operandA!);

        const expectedDiff = item.operandA! - item.operandB!;
        expect(expectedDiff).toBeGreaterThanOrEqual(0);
        expect(item.expectedAnswer).toBe(expectedDiff);
        expect(item.acceptableAnswers).toContain(expectedDiff);
        expect(item.prompt).toBe(`${item.operandA} - ${item.operandB} = ?`);
      });
    });
  });

  describe('number-bonds-10 generator', () => {
    it('generates valid number bond items targeting total sum 10', () => {
      const items = generateQuizItems('number-bonds-10', 'K-1', 5);
      expect(items).toHaveLength(5);

      items.forEach((item) => {
        expect(item.topicId).toBe('number-bonds-10');
        expect(item.widget?.type).toBe('tenframe');
        expect(item.keypad?.type).toBe('numeric');

        const givenAddend = item.operandA!;
        const missingAddend = item.operandB!;
        expect(givenAddend + missingAddend).toBe(10);
        expect(item.expectedAnswer).toBe(missingAddend);
        expect(item.widget?.tenFrameProps?.count).toBe(givenAddend);
        expect(item.widget?.tenFrameProps?.total).toBe(10);
      });
    });
  });

  describe('skip-counting generator', () => {
    it('generates valid skip counting arithmetic sequence items', () => {
      const items = generateQuizItems('skip-counting', 'K-1', 5);
      expect(items).toHaveLength(5);

      items.forEach((item) => {
        expect(item.topicId).toBe('skip-counting');
        expect(item.widget?.type).toBe('equation');
        expect(item.widget?.equationProps?.displayFormat).toBe('sequence');
        expect(item.keypad?.type).toBe('numeric');

        const seq = item.widget?.equationProps?.sequence;
        expect(seq).toBeDefined();
        expect(seq!).toHaveLength(4);
        expect(seq![3]).toBe('___');

        const n1 = Number(seq![0]);
        const n2 = Number(seq![1]);
        const n3 = Number(seq![2]);
        const diff = n2 - n1;
        expect(n3 - n2).toBe(diff);

        const expectedNext = n3 + diff;
        expect(item.expectedAnswer).toBe(expectedNext);
      });
    });
  });

  describe('greater-less-than generator', () => {
    it('generates Number Snake game items with 10 random numbers and ordering objectives', () => {
      const items = generateQuizItems('greater-less-than', 'K-1', 5);
      expect(items).toHaveLength(5);

      items.forEach((item) => {
        expect(item.topicId).toBe('greater-less-than');
        expect(item.widget?.type).toBe('numbersnake');
        expect(item.keypad?.type).toBe('none');

        const snakeProps = item.widget?.numberSnakeProps;
        expect(snakeProps).toBeDefined();
        expect(snakeProps?.numbers).toHaveLength(10);
        expect(['ascending', 'descending']).toContain(snakeProps?.mode);
      });
    });
  });

  describe('place-value-blocks generator', () => {
    it('generates base-ten blocks items with correct tens and ones calculation', () => {
      const items = generateQuizItems('place-value-blocks', 'K-1', 5);
      expect(items).toHaveLength(5);

      items.forEach((item) => {
        expect(item.topicId).toBe('place-value-blocks');
        expect(item.widget?.type).toBe('placevalue');
        expect(item.keypad?.type).toBe('numeric');

        const tens = item.widget?.placeValueProps?.tens!;
        const ones = item.widget?.placeValueProps?.ones!;

        expect(tens).toBeGreaterThanOrEqual(1);
        expect(tens).toBeLessThanOrEqual(9);
        expect(ones).toBeGreaterThanOrEqual(0);
        expect(ones).toBeLessThanOrEqual(9);

        const expectedTotal = tens * 10 + ones;
        expect(item.expectedAnswer).toBe(expectedTotal);
      });
    });
  });

  describe('coin-identification generator', () => {
    it('generates coin counting items with expected cent total answers and proper prompts', () => {
      const items = generateQuizItems('coin-identification', 'K-1', 6);
      expect(items).toHaveLength(6);

      items.forEach((item, index) => {
        expect(item.topicId).toBe('coin-identification');
        expect(item.widget?.type).toBe('coin');
        expect(typeof item.expectedAnswer).toBe('number');
        expect(item.acceptableAnswers).toContain(item.expectedAnswer);
        expect(item.prompt).toBe('How much money is this?');

        expect(getTTSPrompt(item, 'en-US', 0)).toBe('How much money is this?');
        expect(getTTSPrompt(item, 'zh-CN', 0)).toBe('这是多少钱？');

        if (index > 0) {
          expect(getTTSPrompt(item, 'en-US', index)).toBe('');
          expect(getTTSPrompt(item, 'zh-CN', index)).toBe('');
        }

        if (item.widget?.coinProps?.coin) {
          expect(['penny', 'nickel', 'dime', 'quarter']).toContain(item.widget.coinProps.coin);
        } else {
          expect(item.widget?.coinProps?.coins?.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('clock-reading generator', () => {
    it('generates clock items testing whole and half hours with colloquial acceptable answers', () => {
      const items = generateQuizItems('clock-reading', 'K-1', 4);
      expect(items).toHaveLength(4);

      items.forEach((item, index) => {
        expect(item.topicId).toBe('clock-reading');
        expect(item.widget?.type).toBe('clock');
        expect(item.prompt).toBe('What time is shown on the clock?');

        expect(getTTSPrompt(item, 'en-US', 0)).toBe('What time is shown on the clock?');
        if (index > 0) {
          expect(getTTSPrompt(item, 'en-US', index)).toBe('');
        }

        const mins = item.widget?.clockProps?.minutes;
        expect([0, 30]).toContain(mins);

        if (mins === 30) {
          const accLower = item.acceptableAnswers!.map((a) => a.toString().toLowerCase());
          expect(accLower.some((a) => a.includes('half past'))).toBe(true);
        }
      });
    });
  });

  describe('shapes-geometry generator', () => {
    it('generates shape items without answer spoilers in prompt', () => {
      const items = generateQuizItems('shapes-geometry', 'K-1', 6);
      expect(items).toHaveLength(6);

      items.forEach((item, index) => {
        expect(item.topicId).toBe('shapes-geometry');
        expect(item.widget?.type).toBe('shape');
        expect(item.prompt).toBe('What shape is this?');

        expect(getTTSPrompt(item, 'en-US', 0)).toBe('What shape is this?');
        if (index > 0) {
          expect(getTTSPrompt(item, 'en-US', index)).toBe('');
        }

        expect(item.ttsPrompt).not.toContain('circle');
        expect(item.ttsPrompt).not.toContain('square');
        expect(item.ttsPrompt).not.toContain('triangle');
      });
    });
  });
});
