import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export const LETTER_SPOKEN_NAMES: Record<string, string[]> = {
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

export function getLetterAcceptableAnswers(letterChar: string): string[] {
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

export function generateLetterIdentificationItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
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

export const letterIdentificationModule: QuizModule = {
  topic: {
    id: 'letter-identification',
    title: '🔤 Letter Identification',
    description: 'Practice uppercase and lowercase letter flashcards.',
    icon: '🔤',
    gradeBands: ['K-1', '2-3'],
  },
  generate: generateLetterIdentificationItems,
};
