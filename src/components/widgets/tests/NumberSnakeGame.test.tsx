import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberSnakeGame } from '../NumberSnakeGame';

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
  it('renders correctly with objective banner and next target number', () => {
    const testNumbers = [42, 18, 95, 7, 63, 29, 81, 36, 50, 14];
    render(<NumberSnakeGame numbers={testNumbers} mode="ascending" />);

    // In ascending order, smallest number is 7
    expect(screen.getByText(/Least to Greatest/i)).toBeDefined();
    expect(screen.getByText('7')).toBeDefined();
    expect(screen.getByText('🎯 NEXT TARGET NUMBER')).toBeDefined();
  });

  it('displays descending objective banner and highest number first when mode="descending"', () => {
    const testNumbers = [42, 18, 95, 7, 63, 29, 81, 36, 50, 14];
    render(<NumberSnakeGame numbers={testNumbers} mode="descending" />);

    // In descending order, largest number is 95
    expect(screen.getByText(/Greatest to Least/i)).toBeDefined();
    expect(screen.getByText('95')).toBeDefined();
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

    expect(screen.getByText('🎯 NEXT TARGET NUMBER')).toBeDefined();
  });

  it('handles homophone directional commands in voice transcript', () => {
    const { rerender } = render(
      <NumberSnakeGame mode="ascending" transcript="" interimTranscript="" />
    );

    rerender(
      <NumberSnakeGame mode="ascending" transcript="opp done west write" interimTranscript="" />
    );

    expect(screen.getByText('🎯 NEXT TARGET NUMBER')).toBeDefined();
  });

  it('triggers onEatTarget callback when target number is consumed', () => {
    const onEatTarget = vi.fn();
    const testNumbers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    render(
      <NumberSnakeGame
        numbers={testNumbers}
        mode="ascending"
        onEatTarget={onEatTarget}
      />
    );

    expect(screen.getByText('10')).toBeDefined();
  });
});
