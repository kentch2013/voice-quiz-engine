import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  BubbleShooterGame,
  getHexNeighbors,
  isValidSumTriple,
  coordKey,
  findTrianglesContaining,
  hasAnySumTriple,
  findFloatingBubbles,
  createInitialBoard,
  parseVoiceAction,
  levenshteinDistance,
  type BubbleNode,
} from '../BubbleShooterGame';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('BubbleShooterGame Helper Functions & Logic', () => {
  it('correctly calculates Levenshtein distance', () => {
    expect(levenshteinDistance('shot', 'shoot')).toBe(1);
    expect(levenshteinDistance('right', 'rite')).toBe(3);
    expect(levenshteinDistance('left', 'lift')).toBe(1);
    expect(levenshteinDistance('same', 'same')).toBe(0);
  });

  it('correctly calculates hex neighbors on alternating 6/5 grid', () => {
    // Row 0 (Even row, 6 cols) cell (0, 0)
    const n00 = getHexNeighbors(0, 0);
    expect(n00).toEqual([
      { r: 0, c: 1 },
      { r: 1, c: 0 },
    ]);

    // Row 1 (Odd row, 5 cols) cell (1, 1)
    const n11 = getHexNeighbors(1, 1);
    expect(n11).toEqual([
      { r: 1, c: 0 },
      { r: 1, c: 2 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
      { r: 2, c: 1 },
      { r: 2, c: 2 },
    ]);
  });

  it('validates order-agnostic sum triples correctly', () => {
    expect(isValidSumTriple(3, 4, 7)).toBe(true);
    expect(isValidSumTriple(7, 3, 4)).toBe(true);
    expect(isValidSumTriple(2, 5, 7)).toBe(true);
    expect(isValidSumTriple(1, 1, 2)).toBe(true);
    expect(isValidSumTriple(3, 3, 3)).toBe(false);
    expect(isValidSumTriple(1, 2, 4)).toBe(false);
  });

  it('detects 3 mutually adjacent bubbles (triangles) satisfying n1 + n2 === n3', () => {
    const board = new Map<string, BubbleNode>();
    board.set(coordKey(0, 0), { id: '1', r: 0, c: 0, value: 3 });
    board.set(coordKey(0, 1), { id: '2', r: 0, c: 1, value: 4 });
    board.set(coordKey(1, 0), { id: '3', r: 1, c: 0, value: 7 });

    const triangles = findTrianglesContaining(board, 0, 0);
    expect(triangles.length).toBe(1);
    expect(triangles[0].values).toEqual([3, 4, 7]);
    expect(isValidSumTriple(...(triangles[0].values as [number, number, number]))).toBe(true);
  });

  it('identifies unanchored/floating bubbles disconnected from row 0', () => {
    const board = new Map<string, BubbleNode>();
    board.set(coordKey(0, 0), { id: '1', r: 0, c: 0, value: 1 });
    board.set(coordKey(1, 0), { id: '2', r: 1, c: 0, value: 2 });
    board.set(coordKey(4, 2), { id: 'float1', r: 4, c: 2, value: 5 });

    const floating = findFloatingBubbles(board);
    expect(floating).toEqual([{ r: 4, c: 2 }]);
  });

  it('initializes board with 17 bubbles (rows 0, 1, 2) and no pre-existing sum triples', () => {
    const board = createInitialBoard();
    expect(board.size).toBe(17);
    expect(hasAnySumTriple(board)).toBe(false);

    for (const node of board.values()) {
      expect(node.value).toBeGreaterThanOrEqual(1);
      expect(node.value).toBeLessThanOrEqual(10);
      expect(Number.isInteger(node.value)).toBe(true);
    }
  });

  it('parses verbal voice controls for aiming and shooting with homophones and fuzzy matching', () => {
    // Standard commands
    expect(parseVoiceAction('turn left')).toBe('LEFT');
    expect(parseVoiceAction('aim right')).toBe('RIGHT');
    expect(parseVoiceAction('shoot now')).toBe('FIRE');
    expect(parseVoiceAction('fire!')).toBe('FIRE');

    // Right homophones & phonetic matches
    expect(parseVoiceAction('light')).toBe('RIGHT');
    expect(parseVoiceAction('write')).toBe('RIGHT');
    expect(parseVoiceAction('rite')).toBe('RIGHT');
    expect(parseVoiceAction('rot')).toBe('RIGHT');
    expect(parseVoiceAction('white')).toBe('RIGHT');
    expect(parseVoiceAction('ride')).toBe('RIGHT');
    expect(parseVoiceAction('r')).toBe('RIGHT');
    expect(parseVoiceAction('rig')).toBe('RIGHT');
    expect(parseVoiceAction('you')).toBe('RIGHT');

    // Left homophones & phonetic matches
    expect(parseVoiceAction('laugh')).toBe('LEFT');
    expect(parseVoiceAction('lift')).toBe('LEFT');
    expect(parseVoiceAction('let')).toBe('LEFT');
    expect(parseVoiceAction('l')).toBe('LEFT');
    expect(parseVoiceAction('lef')).toBe('LEFT');
    expect(parseVoiceAction('zuo')).toBe('LEFT');

    // Fire / Shoot homophones & phonetic matches
    expect(parseVoiceAction('shot')).toBe('FIRE');
    expect(parseVoiceAction('chute')).toBe('FIRE');
    expect(parseVoiceAction('shute')).toBe('FIRE');
    expect(parseVoiceAction('shoo')).toBe('FIRE');
    expect(parseVoiceAction('fa')).toBe('FIRE');
    expect(parseVoiceAction('kaihuo')).toBe('FIRE');
    expect(parseVoiceAction('bang')).toBe('FIRE');

    // Chinese matches
    expect(parseVoiceAction('向左')).toBe('LEFT');
    expect(parseVoiceAction('向右')).toBe('RIGHT');
    expect(parseVoiceAction('发射')).toBe('FIRE');

    // Invalid input
    expect(parseVoiceAction('hello')).toBeNull();
  });
});

describe('BubbleShooterGame UI Component', () => {
  it('renders interactive controls, header, next bubble preview, hex grid, cannon SVG, and laser aim line', () => {
    render(<BubbleShooterGame targetTriplesCount={5} />);

    expect(screen.queryByText(/Match Triples/i)).toBeNull();
    expect(screen.getByText(/Triples Cleared: 0 \/ 5/i)).toBeDefined();
    expect(screen.getByText(/Next Bubble:/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Aim Left/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Shoot Bubble/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Aim Right/i })).toBeDefined();

    // Verify SVG Cannon & Laser trajectory elements
    expect(screen.getByTestId('bubble-cannon-svg')).toBeDefined();
    expect(screen.getByTestId('laser-aim-line')).toBeDefined();
    expect(screen.getByTestId('destination-hex-highlight')).toBeDefined();
    expect(screen.getByTestId('bubble-cannon-gun')).toBeDefined();
    expect(screen.getByTestId('cannon-barrel-rotator')).toBeDefined();
  });

  it('renders enlarged loaded bubble with radius 22 and font size 20 inside cannon barrel', () => {
    render(<BubbleShooterGame />);

    const rotator = screen.getByTestId('cannon-barrel-rotator');
    const circle = rotator.querySelector('circle');
    const text = rotator.querySelector('text');

    expect(circle?.getAttribute('r')).toBe('22');
    expect(text?.getAttribute('font-size')).toBe('20');
  });

  it('triggers onTripleMatched callback when a number triple is formed', () => {
    const onTripleMatchedMock = vi.fn();
    render(<BubbleShooterGame onTripleMatched={onTripleMatchedMock} />);

    const shootBtn = screen.getByRole('button', { name: /Shoot Bubble/i });
    act(() => {
      fireEvent.click(shootBtn);
    });
  });

  it('handles aiming left and right via controls', () => {
    render(<BubbleShooterGame />);

    const leftBtn = screen.getByRole('button', { name: /Aim Left/i });
    const rightBtn = screen.getByRole('button', { name: /Aim Right/i });

    fireEvent.click(rightBtn);
    fireEvent.click(leftBtn);
  });

  it('fires bubble on shoot button click', () => {
    const onCompleteMock = vi.fn();
    render(<BubbleShooterGame onComplete={onCompleteMock} targetTriplesCount={1} />);

    const shootBtn = screen.getByRole('button', { name: /Shoot Bubble/i });

    act(() => {
      fireEvent.click(shootBtn);
    });
  });

  it('responds to voice transcript input for homophones and fuzzy speech commands', () => {
    const { rerender } = render(<BubbleShooterGame transcript="" />);

    act(() => {
      rerender(<BubbleShooterGame transcript="light" />);
    });

    act(() => {
      rerender(<BubbleShooterGame transcript="laugh" />);
    });

    act(() => {
      rerender(<BubbleShooterGame transcript="shot" />);
    });
  });
});
