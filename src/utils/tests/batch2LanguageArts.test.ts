import { describe, it, expect } from 'vitest';
import { generateQuizItems, TOPICS } from '../quizGenerator';

describe('Batch 2: Phonics, Reading & Language Arts Modules Quiz Generators', () => {
  it('registers all 5 Batch 2 language arts topics in TOPICS array', () => {
    const topicIds = TOPICS.map((t) => t.id);
    expect(topicIds).toContain('letter-identification');
    expect(topicIds).toContain('beginning-letter-sounds');
    expect(topicIds).toContain('rhyme-matching');
    expect(topicIds).toContain('opposites-antonyms');
    expect(topicIds).toContain('plural-forms');
  });

  describe('letter-identification generator', () => {
    it('generates valid letter identification items with letterhero widget and none keypad', () => {
      const items = generateQuizItems('letter-identification', 'K-1', 6);
      expect(items).toHaveLength(6);

      items.forEach((item) => {
        expect(item.topicId).toBe('letter-identification');
        expect(item.widget?.type).toBe('letterhero');
        expect(item.widget?.letterHeroProps?.letters).toBeDefined();
        expect(item.widget?.letterHeroProps?.letters).toHaveLength(10);
        expect(item.keypad?.type).toBe('none');
        expect(item.expectedAnswer).toBe('completed');
        expect(item.acceptableAnswers).toContain('completed');
      });
    });
  });

  describe('sight-words generator', () => {
    it('generates sight word items with whackamole widget and whackamoleProps', () => {
      const items = generateQuizItems('sight-words', 'K-1', 4);
      expect(items).toHaveLength(4);

      items.forEach((item) => {
        expect(item.topicId).toBe('sight-words');
        expect(item.widget?.type).toBe('whackamole');
        expect(item.keypad?.type).toBe('none');

        const moleProps = item.widget?.whackamoleProps || item.widget?.whackAMoleProps;
        expect(moleProps).toBeDefined();
        expect(moleProps?.prompt).toMatch(/^Whack the word: [A-Z]+$/);
        expect(moleProps?.targetHits).toBe(10);
        expect(moleProps?.timeLimit).toBe(45);
        expect(moleProps?.options).toBeDefined();
        expect(moleProps?.options?.length).toBeGreaterThan(0);

        const targetOptions = moleProps?.options?.filter((o) => 'isTarget' in o && o.isTarget);
        expect(targetOptions?.length).toBe(1);

        const distractorOptions = moleProps?.options?.filter((o) => 'isTarget' in o && !o.isTarget);
        expect(distractorOptions?.length).toBeGreaterThan(0);

        expect(item.expectedAnswer).toBe('completed');
        expect(item.acceptableAnswers).toContain('completed');
      });
    });
  });

  describe('beginning-letter-sounds generator', () => {
    it('generates valid beginning letter sound items with whackamole widget and whackamoleProps', () => {
      const items = generateQuizItems('beginning-letter-sounds', 'K-1', 6);
      expect(items).toHaveLength(6);

      items.forEach((item) => {
        expect(item.topicId).toBe('beginning-letter-sounds');
        expect(item.widget?.type).toBe('whackamole');
        expect(item.keypad?.type).toBe('none');

        const moleProps = item.widget?.whackamoleProps || item.widget?.whackAMoleProps;
        expect(moleProps).toBeDefined();
        expect(moleProps?.prompt).toMatch(/^Whack words starting with: [A-Z]/);
        expect(moleProps?.targetHits).toBe(10);
        expect(moleProps?.timeLimit).toBe(45);
        expect(moleProps?.options).toBeDefined();
        expect(moleProps?.options?.length).toBeGreaterThan(0);

        const targetOptions = moleProps?.options?.filter((o) => 'isTarget' in o && o.isTarget);
        expect(targetOptions?.length).toBeGreaterThanOrEqual(1);

        const distractorOptions = moleProps?.options?.filter((o) => 'isTarget' in o && !o.isTarget);
        expect(distractorOptions?.length).toBeGreaterThan(0);

        expect(item.expectedAnswer).toBe('completed');
        expect(item.acceptableAnswers).toContain('completed');
      });
    });
  });

  describe('rhyme-matching generator', () => {
    it('generates valid rhyme matching items with choice options and flashcard widget', () => {
      const items = generateQuizItems('rhyme-matching', 'K-1', 6);
      expect(items).toHaveLength(6);

      items.forEach((item) => {
        expect(item.topicId).toBe('rhyme-matching');
        expect(item.widget?.type).toBe('flashcard');
        expect(item.keypad?.type).toBe('choice');
        expect(item.keypad?.options).toHaveLength(4);

        const optionValues = item.keypad?.options?.map((opt) => opt.value);
        expect(optionValues).toContain(item.expectedAnswer);

        const expectedStr = (item.expectedAnswer as string).toLowerCase();
        const acceptableLower = item.acceptableAnswers!.map((a) => a.toString().toLowerCase());
        expect(acceptableLower).toContain(expectedStr);
      });
    });
  });

  describe('opposites-antonyms generator', () => {
    it('generates valid antonym items with choice keypad and flashcard widget', () => {
      const items = generateQuizItems('opposites-antonyms', 'K-1', 6);
      expect(items).toHaveLength(6);

      items.forEach((item) => {
        expect(item.topicId).toBe('opposites-antonyms');
        expect(item.widget?.type).toBe('flashcard');
        expect(item.keypad?.type).toBe('choice');
        expect(item.keypad?.options).toHaveLength(4);

        const optionValues = item.keypad?.options?.map((opt) => opt.value);
        expect(optionValues).toContain(item.expectedAnswer);

        const expectedStr = (item.expectedAnswer as string).toLowerCase();
        const acceptableLower = item.acceptableAnswers!.map((a) => a.toString().toLowerCase());
        expect(acceptableLower).toContain(expectedStr);
      });
    });
  });

  describe('plural-forms generator', () => {
    it('generates valid plural form items with choice options and flashcard widget', () => {
      const items = generateQuizItems('plural-forms', 'K-1', 6);
      expect(items).toHaveLength(6);

      items.forEach((item) => {
        expect(item.topicId).toBe('plural-forms');
        expect(item.widget?.type).toBe('flashcard');
        expect(item.keypad?.type).toBe('choice');
        expect(item.keypad?.options).toHaveLength(4);

        const optionValues = item.keypad?.options?.map((opt) => opt.value);
        expect(optionValues).toContain(item.expectedAnswer);

        const expectedStr = (item.expectedAnswer as string).toLowerCase();
        const acceptableLower = item.acceptableAnswers!.map((a) => a.toString().toLowerCase());
        expect(acceptableLower).toContain(expectedStr);
      });
    });
  });
});
