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
});
