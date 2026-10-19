import { describe, it, expect } from 'vitest';
import { generateQuizItems, TOPICS } from '../quizGenerator';

describe('Batch 3: Logic, Concepts & Number Properties Modules Quiz Generators', () => {
  it('registers all 3 Batch 3 topics in TOPICS array', () => {
    const topicIds = TOPICS.map((t) => t.id);
    expect(topicIds).toContain('even-or-odd');
    expect(topicIds).toContain('spatial-prepositions');
    expect(topicIds).toContain('odd-one-out');
  });

  describe('even-or-odd generator', () => {
    it('generates valid even-or-odd items with choice keypad and generous acceptable answers', () => {
      const items = generateQuizItems('even-or-odd', 'K-1', 6);
      expect(items).toHaveLength(6);

      items.forEach((item) => {
        expect(item.topicId).toBe('even-or-odd');
        expect(item.keypad?.type).toBe('choice');
        expect(item.keypad?.options).toHaveLength(2);
        expect(item.widget?.type).toBe('flashcard');

        const num = item.operandA!;
        expect(typeof num).toBe('number');

        const isEven = num % 2 === 0;
        const expected = isEven ? 'Even' : 'Odd';
        expect(item.expectedAnswer).toBe(expected);

        expect(item.acceptableAnswers).toBeDefined();
        if (isEven) {
          expect(item.acceptableAnswers).toContain('even');
          expect(item.acceptableAnswers).toContain('Even');
          expect(item.acceptableAnswers).toContain('EVEN');
          expect(item.acceptableAnswers).toContain("it's even");
        } else {
          expect(item.acceptableAnswers).toContain('odd');
          expect(item.acceptableAnswers).toContain('Odd');
          expect(item.acceptableAnswers).toContain('ODD');
          expect(item.acceptableAnswers).toContain("it's odd");
        }
      });
    });
  });

  describe('spatial-prepositions generator', () => {
    it('generates valid spatial preposition scene items with choice keypad', () => {
      const items = generateQuizItems('spatial-prepositions', 'K-1', 6);
      expect(items).toHaveLength(6);

      items.forEach((item) => {
        expect(item.topicId).toBe('spatial-prepositions');
        expect(item.widget?.type).toBe('spatialscene');
        expect(item.widget?.spatialSceneProps).toBeDefined();
        expect(item.widget?.spatialSceneProps?.subject).toBeDefined();
        expect(item.widget?.spatialSceneProps?.target).toBeDefined();
        expect(item.widget?.spatialSceneProps?.preposition).toBeDefined();

        expect(item.keypad?.type).toBe('choice');
        expect(item.keypad?.options?.length).toBeGreaterThanOrEqual(2);

        expect(item.acceptableAnswers).toBeDefined();
        expect(item.acceptableAnswers!.length).toBeGreaterThan(1);
      });
    });
  });

  describe('odd-one-out generator', () => {
    it('generates categorization items identifying the non-belonging item', () => {
      const items = generateQuizItems('odd-one-out', 'K-1', 8);
      expect(items).toHaveLength(8);

      items.forEach((item) => {
        expect(item.topicId).toBe('odd-one-out');
        expect(item.widget?.type).toBe('flashcard');
        expect(item.keypad?.type).toBe('choice');
        expect(item.keypad?.options).toHaveLength(4);

        expect(typeof item.expectedAnswer).toBe('string');
        expect(item.acceptableAnswers).toContain((item.expectedAnswer as string).toLowerCase());
        expect(item.acceptableAnswers).toContain(item.expectedAnswer);
      });
    });
  });
});
