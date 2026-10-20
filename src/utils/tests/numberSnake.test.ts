import { describe, it, expect } from 'vitest';
import {
  parseVoiceDirection,
  extractVoiceDirections,
  getWrappedCoordinate,
  placeNumbersOnGrid,
} from '../../components/widgets/NumberSnakeGame';
import { generateQuizItems } from '../quizGenerator';

describe('Number Snake Game Unit Tests', () => {
  describe('Grid Number Placement & Random Generation', () => {
    it('places 10 distinct numbers on a 16x16 grid without position overlaps', () => {
      const sampleNumbers = [15, 82, 3, 44, 91, 26, 67, 10, 58, 39];
      const initialSnake = [
        { x: 8, y: 7 },
        { x: 8, y: 8 },
        { x: 8, y: 9 },
      ];

      const gridPlacements = placeNumbersOnGrid(sampleNumbers, initialSnake);

      expect(gridPlacements).toHaveLength(10);

      const positionsSet = new Set<string>();
      initialSnake.forEach((p) => positionsSet.add(`${p.x},${p.y}`));

      gridPlacements.forEach((gp) => {
        expect(gp.x).toBeGreaterThanOrEqual(0);
        expect(gp.x).toBeLessThan(16);
        expect(gp.y).toBeGreaterThanOrEqual(0);
        expect(gp.y).toBeLessThan(16);

        const key = `${gp.x},${gp.y}`;
        expect(positionsSet.has(key)).toBe(false);
        positionsSet.add(key);
      });
    });

    it('quiz generator creates valid Number Snake items with 10 distinct numbers between 1 and 100', () => {
      const items = generateQuizItems('greater-less-than', 'K-1', 4);
      expect(items).toHaveLength(4);

      items.forEach((item, index) => {
        expect(item.topicId).toBe('greater-less-than');
        expect(item.widget?.type).toBe('numbersnake');
        expect(item.keypad?.type).toBe('none');

        const snakeProps = item.widget?.numberSnakeProps;
        expect(snakeProps).toBeDefined();
        expect(snakeProps?.numbers).toHaveLength(10);

        // All 10 numbers distinct and within range [1..100]
        const unique = new Set(snakeProps?.numbers);
        expect(unique.size).toBe(10);
        snakeProps?.numbers?.forEach((num) => {
          expect(num).toBeGreaterThanOrEqual(1);
          expect(num).toBeLessThanOrEqual(100);
        });

        // Alternates ascending/descending modes
        if (index % 2 === 0) {
          expect(snakeProps?.mode).toBe('ascending');
          expect(item.prompt).toBe('Eat from Least to Greatest!');
        } else {
          expect(snakeProps?.mode).toBe('descending');
          expect(item.prompt).toBe('Eat from Greatest to Least!');
        }
      });
    });
  });

  describe('Grid Coordinate Wrap-Around Logic', () => {
    it('wraps around left border (x = 0 going LEFT -> x = 15)', () => {
      const next = getWrappedCoordinate({ x: 0, y: 5 }, 'LEFT', 16);
      expect(next).toEqual({ x: 15, y: 5 });
    });

    it('wraps around right border (x = 15 going RIGHT -> x = 0)', () => {
      const next = getWrappedCoordinate({ x: 15, y: 5 }, 'RIGHT', 16);
      expect(next).toEqual({ x: 0, y: 5 });
    });

    it('wraps around top border (y = 0 going UP -> y = 15)', () => {
      const next = getWrappedCoordinate({ x: 8, y: 0 }, 'UP', 16);
      expect(next).toEqual({ x: 8, y: 15 });
    });

    it('wraps around bottom border (y = 15 going DOWN -> y = 0)', () => {
      const next = getWrappedCoordinate({ x: 8, y: 15 }, 'DOWN', 16);
      expect(next).toEqual({ x: 8, y: 0 });
    });
  });

  describe('Voice Direction Parsing & Homophone Extraction', () => {
    it('parses single-word direction voice commands correctly', () => {
      expect(parseVoiceDirection('up')).toBe('UP');
      expect(parseVoiceDirection('down')).toBe('DOWN');
      expect(parseVoiceDirection('left')).toBe('LEFT');
      expect(parseVoiceDirection('right')).toBe('RIGHT');
    });

    it('parses compound speech phrases and synonyms correctly', () => {
      expect(parseVoiceDirection('go up now')).toBe('UP');
      expect(parseVoiceDirection('turn left')).toBe('LEFT');
      expect(parseVoiceDirection('move down please')).toBe('DOWN');
      expect(parseVoiceDirection('go right')).toBe('RIGHT');
    });

    it('parses homophones and short-word directional commands accurately', () => {
      // UP homophones: up, go up, turn up, opp, op, north, hop, cup, 向上, 上
      expect(extractVoiceDirections('up go up turn up opp op north hop cup 向上 上')).toEqual([
        'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP', 'UP',
      ]);

      // DOWN homophones: down, go down, turn down, done, south, 向下, 下
      expect(extractVoiceDirections('down go down turn down done south 向下 下')).toEqual([
        'DOWN', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'DOWN', 'DOWN',
      ]);

      // LEFT homophones: left, go left, turn left, west, 向左, 左
      expect(extractVoiceDirections('left go left turn left west 向左 左')).toEqual([
        'LEFT', 'LEFT', 'LEFT', 'LEFT', 'LEFT', 'LEFT',
      ]);

      // RIGHT homophones: right, go right, turn right, write, ite, east, 向右, 右
      expect(extractVoiceDirections('right go right turn right write ite east 向右 右')).toEqual([
        'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT',
      ]);
    });

    it('extracts repeatable directional words in sequence (e.g. saying up 5 times)', () => {
      const dirs = extractVoiceDirections('up up up up up');
      expect(dirs).toEqual(['UP', 'UP', 'UP', 'UP', 'UP']);
      expect(dirs).toHaveLength(5);
    });

    it('returns null / empty array for unrecognized transcripts', () => {
      expect(parseVoiceDirection('')).toBeNull();
      expect(extractVoiceDirections('')).toEqual([]);
      expect(parseVoiceDirection('hello snake')).toBeNull();
      expect(parseVoiceDirection('what is twenty plus five')).toBeNull();
    });
  });

  describe('Ascending and Descending Target Ordering', () => {
    it('sorts numbers in ascending order correctly', () => {
      const raw = [52, 11, 99, 4, 33];
      const sorted = [...raw].sort((a, b) => a - b);
      expect(sorted).toEqual([4, 11, 33, 52, 99]);
    });

    it('sorts numbers in descending order correctly', () => {
      const raw = [52, 11, 99, 4, 33];
      const sorted = [...raw].sort((a, b) => b - a);
      expect(sorted).toEqual([99, 52, 33, 11, 4]);
    });
  });

  describe('Continuous Non-Stop Movement Behavior', () => {
    it('calculates continuous step forward without stopping or returning stationary coordinates', () => {
      const initialSnake = [
        { x: 8, y: 7 },
        { x: 8, y: 8 },
        { x: 8, y: 9 },
      ];
      const nextHead = getWrappedCoordinate(initialSnake[0], 'UP', 16);
      const updatedSnake = [nextHead, ...initialSnake.slice(0, -1)];

      expect(nextHead).toEqual({ x: 8, y: 6 });
      expect(updatedSnake).toHaveLength(3);
      expect(updatedSnake[0]).toEqual({ x: 8, y: 6 });
      expect(updatedSnake[1]).toEqual({ x: 8, y: 7 });
      expect(updatedSnake[2]).toEqual({ x: 8, y: 8 });
    });
  });
});
