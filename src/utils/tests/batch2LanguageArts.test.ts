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
    it('generates valid letter identification items with flashcard widget and alphabet keypad', () => {
      const items = generateQuizItems('letter-identification', 'K-1', 6);
      expect(items).toHaveLength(6);

      items.forEach((item) => {
        expect(item.topicId).toBe('letter-identification');
        expect(item.widget?.type).toBe('flashcard');
        expect(item.keypad?.type).toBe('alphabet');
        expect(typeof item.expectedAnswer).toBe('string');
        expect(item.expectedAnswer).toHaveLength(1);

        const expectedLetter = (item.expectedAnswer as string).toLowerCase();
        expect(item.acceptableAnswers).toBeDefined();
        const acceptableLower = item.acceptableAnswers!.map((a) => a.toString().toLowerCase());
        expect(acceptableLower).toContain(expectedLetter);
        expect(item.widget?.flashcardProps?.text).toBe(item.expectedAnswer);
        expect(item.widget?.flashcardProps?.category).toBe('letter');
      });
    });
  });

  describe('beginning-letter-sounds generator', () => {
    it('generates valid beginning letter sound items with prompts, flashcards, and alphabet keypads', () => {
      const items = generateQuizItems('beginning-letter-sounds', 'K-1', 6);
      expect(items).toHaveLength(6);

      items.forEach((item) => {
        expect(item.topicId).toBe('beginning-letter-sounds');
        expect(item.widget?.type).toBe('flashcard');
        expect(item.keypad?.type).toBe('alphabet');
        expect(item.prompt).toMatch(/What letter does .* start with\?/i);
        expect(typeof item.expectedAnswer).toBe('string');
        expect(item.expectedAnswer).toHaveLength(1);

        const expectedLetter = (item.expectedAnswer as string).toLowerCase();
        const acceptableLower = item.acceptableAnswers!.map((a) => a.toString().toLowerCase());
        expect(acceptableLower).toContain(expectedLetter);
        expect(item.widget?.flashcardProps?.category).toBe('phonics');
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
