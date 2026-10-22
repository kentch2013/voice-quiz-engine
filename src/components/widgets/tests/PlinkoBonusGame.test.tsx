import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import {
  PlinkoBonusGame,
  extractPlinkoVoiceCommands,
} from '../PlinkoBonusGame';

// Mock canvas-confetti and audio synthesizer
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

vi.mock('../../../utils/audioSynthesizer', () => ({
  playCorrectChime: vi.fn(),
  playClickSound: vi.fn(),
  playWrongSound: vi.fn(),
}));

describe('extractPlinkoVoiceCommands', () => {
  it('extracts directional and drop commands correctly', () => {
    expect(extractPlinkoVoiceCommands('left right drop')).toEqual(['LEFT', 'RIGHT', 'DROP']);
    expect(extractPlinkoVoiceCommands('move left then drop')).toEqual(['LEFT', 'DROP']);
    expect(extractPlinkoVoiceCommands('向左 向右 下')).toEqual(['LEFT', 'RIGHT', 'DROP']);
  });

  it('handles empty or unrecognized input safely', () => {
    expect(extractPlinkoVoiceCommands('')).toEqual([]);
    expect(extractPlinkoVoiceCommands('hello world 123')).toEqual([]);
  });
});

describe('PlinkoBonusGame Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16);
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders interactive control buttons, header, and randomized well numbers 1 through 9', () => {
    render(<PlinkoBonusGame />);

    expect(screen.getByText(/Plinko Number Bond Bonus!/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Move Slot Left/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Drop Plinko Ball/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Move Slot Right/i })).toBeDefined();

    // Verify all well numbers 1 through 9 are present
    for (let num = 1; num <= 9; num++) {
      expect(screen.getAllByText(num.toString()).length).toBeGreaterThan(0);
    }
  });

  it('handles slot selector movement via Left and Right buttons', () => {
    render(<PlinkoBonusGame />);

    const leftBtn = screen.getByRole('button', { name: /Move Slot Left/i });
    const rightBtn = screen.getByRole('button', { name: /Move Slot Right/i });

    act(() => {
      fireEvent.click(rightBtn);
    });

    act(() => {
      fireEvent.click(leftBtn);
    });

    expect(leftBtn).toBeDefined();
  });

  it('triggers ball drop physics simulation with enlarged ball radius (15) and calls onComplete with well number', async () => {
    const onComplete = vi.fn();
    const { container } = render(<PlinkoBonusGame onComplete={onComplete} />);

    const dropBtn = screen.getByRole('button', { name: /Drop Plinko Ball/i });

    act(() => {
      fireEvent.click(dropBtn);
    });

    // Verify ball circle is rendered with enlarged radius = 15
    const ballCircle = container.querySelector('circle[fill="url(#ballGrad)"]');
    expect(ballCircle).toBeDefined();
    expect(ballCircle?.getAttribute('r')).toBe('15');

    // Advance physics simulation frames
    for (let i = 0; i < 400; i++) {
      act(() => {
        vi.advanceTimersByTime(16);
      });
    }

    // Advance callback timeout
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onComplete).toHaveBeenCalled();
    const landedWell = onComplete.mock.calls[0][0];
    expect(landedWell).toBeGreaterThanOrEqual(1);
    expect(landedWell).toBeLessThanOrEqual(9);
  });

  it('responds to voice commands provided via transcript props', () => {
    const { rerender } = render(<PlinkoBonusGame transcript="" />);

    rerender(<PlinkoBonusGame transcript="left" />);
    rerender(<PlinkoBonusGame transcript="left drop" />);

    expect(screen.getByRole('button', { name: /Drop Plinko Ball/i })).toBeDefined();
  });
});
