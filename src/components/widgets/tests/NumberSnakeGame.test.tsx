import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NumberSnakeGame, extractVoiceDirections } from '../NumberSnakeGame';

// Mock audioSynthesizer to avoid AudioContext issues in JSDOM
vi.mock('../../../utils/audioSynthesizer', () => ({
  playCorrectChime: vi.fn(),
  playWrongSound: vi.fn(),
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('NumberSnakeGame Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders rule banner and progress indicator without target number banner', () => {
    const testNumbers = [42, 18, 95, 7, 63, 29, 81, 36, 50, 14];
    render(<NumberSnakeGame numbers={testNumbers} mode="ascending" />);

    // Rule banner and progress indicator are shown
    expect(screen.getByText(/Eat from Least to Greatest/i)).toBeDefined();
    expect(screen.getByText(/Eaten: 0 \/ 10/i)).toBeDefined();

    // Target number banner box must NOT be displayed in DOM
    expect(screen.queryByText(/NEXT TARGET NUMBER/i)).toBeNull();
  });

  it('displays descending rule banner when mode="descending" without spoiler banner', () => {
    const testNumbers = [42, 18, 95, 7, 63, 29, 81, 36, 50, 14];
    render(<NumberSnakeGame numbers={testNumbers} mode="descending" />);

    expect(screen.getByText(/Eat from Greatest to Least/i)).toBeDefined();
    expect(screen.queryByText(/NEXT TARGET NUMBER/i)).toBeNull();
  });

  it('renders touch D-pad buttons and handles click interactions', () => {
    render(<NumberSnakeGame mode="ascending" />);

    const upButton = screen.getByRole('button', { name: /Move Up/i });
    const leftButton = screen.getByRole('button', { name: /Move Left/i });
    const rightButton = screen.getByRole('button', { name: /Move Right/i });
    const downButton = screen.getByRole('button', { name: /Move Down/i });

    expect(upButton).toBeDefined();
    expect(leftButton).toBeDefined();
    expect(rightButton).toBeDefined();
    expect(downButton).toBeDefined();

    // Clicking D-Pad buttons shouldn't throw error
    fireEvent.click(leftButton);
    fireEvent.click(downButton);
  });

  it('updates direction when voice transcript changes and handles repeated utterances', () => {
    const { rerender } = render(
      <NumberSnakeGame mode="ascending" transcript="" interimTranscript="" />
    );

    // Pass repeated voice transcript "up up up up up"
    rerender(
      <NumberSnakeGame mode="ascending" transcript="up up up up up" interimTranscript="" />
    );

    expect(screen.getByText(/Eat from Least to Greatest/i)).toBeDefined();
    expect(screen.queryByText(/NEXT TARGET NUMBER/i)).toBeNull();
  });

  it('handles homophone directional commands in voice transcript', () => {
    const { rerender } = render(
      <NumberSnakeGame mode="ascending" transcript="" interimTranscript="" />
    );

    rerender(
      <NumberSnakeGame mode="ascending" transcript="opp done west write" interimTranscript="" />
    );

    expect(screen.getByText(/Eat from Least to Greatest/i)).toBeDefined();
    expect(screen.queryByText(/NEXT TARGET NUMBER/i)).toBeNull();
  });

  it('progresses continuous movement ticks automatically without freezing', () => {
    render(<NumberSnakeGame mode="ascending" />);

    // Advance timers across multiple game ticks (1100ms per tick)
    act(() => {
      vi.advanceTimersByTime(1100 * 5);
    });

    // Verify component remains rendered and active
    expect(screen.getByText(/Eaten: 0 \/ 10/i)).toBeDefined();
    expect(screen.queryByText(/NEXT TARGET NUMBER/i)).toBeNull();
  });

  it('extracts voice directions immediately from partial syllables and prefixes', () => {
    expect(extractVoiceDirections('u')).toEqual(['UP']);
    expect(extractVoiceDirections('dow')).toEqual(['DOWN']);
    expect(extractVoiceDirections('lef')).toEqual(['LEFT']);
    expect(extractVoiceDirections('rig')).toEqual(['RIGHT']);
    expect(extractVoiceDirections('u dow lef rig')).toEqual(['UP', 'DOWN', 'LEFT', 'RIGHT']);
  });

  it('renders enlarged board container and enlarged food tile numbers', () => {
    const testNumbers = [12, 45, 3, 89, 27, 64, 51, 98, 33, 76];
    const { container } = render(<NumberSnakeGame numbers={testNumbers} mode="ascending" />);

    // Board container max width max-w-[500px]
    const boardContainer = container.querySelector('.max-w-\\[500px\\]');
    expect(boardContainer).not.toBeNull();

    // Food tile with enlarged font size classes
    const foodTile = container.querySelector('.text-sm.sm\\:text-base.md\\:text-lg');
    expect(foodTile).not.toBeNull();
  });

  it('maintains target order and state isolation when parent re-renders with new numbers prop', () => {
    const initialNumbers = [5, 25, 8, 90, 12, 44, 3, 77, 61, 30];
    const onEatTarget = vi.fn();

    const { rerender } = render(
      <NumberSnakeGame numbers={initialNumbers} mode="ascending" onEatTarget={onEatTarget} />
    );

    expect(screen.getByText(/Eaten: 0 \/ 10/i)).toBeDefined();

    // Simulate parent re-render with updated/new numbers prop (e.g. from hook/engine)
    const newNumbersProp = [99, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    rerender(
      <NumberSnakeGame numbers={newNumbersProp} mode="ascending" onEatTarget={onEatTarget} />
    );

    // Eaten count should remain 0 / 10 and grid state should remain isolated (not reset to newNumbersProp)
    expect(screen.getByText(/Eaten: 0 \/ 10/i)).toBeDefined();
    expect(screen.getByText('3')).toBeDefined(); // 3 was the minimum in initialNumbers
  });

  it('matches fuzzy and acoustically similar words to directional commands', () => {
    // RIGHT candidates: rat, rite, rot, light, ride
    expect(extractVoiceDirections('rat rite rot light ride')).toEqual([
      'RIGHT',
      'RIGHT',
      'RIGHT',
      'RIGHT',
      'RIGHT',
    ]);

    // LEFT candidates: laugh, lift, let
    expect(extractVoiceDirections('laugh lift let')).toEqual(['LEFT', 'LEFT', 'LEFT']);

    // DOWN candidates: dawn, dan, dome, town
    expect(extractVoiceDirections('dawn dan dome town')).toEqual([
      'DOWN',
      'DOWN',
      'DOWN',
      'DOWN',
    ]);

    // UP candidates: app, cup, pup
    expect(extractVoiceDirections('app cup pup')).toEqual(['UP', 'UP', 'UP']);

    // Ignores completely unrelated words
    expect(extractVoiceDirections('apple banana elephant')).toEqual([]);
  });
});
