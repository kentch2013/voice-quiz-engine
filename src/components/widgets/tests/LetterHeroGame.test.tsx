import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LetterHeroGame, isLetterSpoken, FALL_DURATION_MS, STRIKE_ZONE_START, LANES } from '../LetterHeroGame';
import { playCorrectChime, playWrongSound } from '../../../utils/audioSynthesizer';

// Mock audioSynthesizer to avoid AudioContext issues in JSDOM
vi.mock('../../../utils/audioSynthesizer', () => ({
  playCorrectChime: vi.fn(),
  playWrongSound: vi.fn(),
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('LetterHeroGame Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders top alphabet banner A-Z and score bar', () => {
    render(<LetterHeroGame letters={['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']} />);

    // Alphabet Banner title
    expect(screen.getByText(/Alphabet Target Banner/i)).toBeDefined();

    // Check letters A-Z rendered in top banner
    expect(screen.getAllByText('A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Z').length).toBeGreaterThan(0);

    // Score bar
    expect(screen.getByText(/0 pts/i)).toBeDefined();
    expect(screen.getByText(/Perfect: 0/i)).toBeDefined();
    expect(screen.getByText(/Good: 0/i)).toBeDefined();
    expect(screen.getByText(/Miss: 0/i)).toBeDefined();
  });

  it('renders strike zone target on vertical highway track', () => {
    render(<LetterHeroGame letters={['A', 'B', 'C']} />);

    expect(screen.getByText(/STRIKE ZONE/i)).toBeDefined();
  });

  it('correctly matches spoken letters using phonetics', () => {
    // Letter A phonetics: 'a', 'ay', 'apple', 'eh'
    expect(isLetterSpoken('apple', 'A')).toBe(true);
    expect(isLetterSpoken('ay', 'A')).toBe(true);
    expect(isLetterSpoken('I see an A', 'A')).toBe(true);

    // Letter B phonetics: 'b', 'bee', 'boy'
    expect(isLetterSpoken('bee', 'B')).toBe(true);
    expect(isLetterSpoken('it is a B', 'B')).toBe(true);

    // Letter C phonetics: 'c', 'cee', 'see', 'cat'
    expect(isLetterSpoken('see', 'C')).toBe(true);
    expect(isLetterSpoken('cat', 'C')).toBe(true);

    // Unrelated words
    expect(isLetterSpoken('dog', 'A')).toBe(false);
  });

  it('spawns letters sequentially and awards "Good!" when hit early', () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const onScoreUpdate = vi.fn();

    const { rerender } = render(
      <LetterHeroGame letters={letters} onScoreUpdate={onScoreUpdate} transcript="" interimTranscript="" />
    );

    // Initial letter A spawned at t=0 at top of track (0% progress < 80%)
    // Trigger speech recognition for "A"
    rerender(
      <LetterHeroGame letters={letters} onScoreUpdate={onScoreUpdate} transcript="A" interimTranscript="" />
    );

    expect(playCorrectChime).toHaveBeenCalled();
    expect(onScoreUpdate).toHaveBeenCalledWith(50, 'Good!');
    expect(screen.getByText(/50 pts/i)).toBeDefined();
    expect(screen.getByText(/Good: 1/i)).toBeDefined();
  });

  it('exports STRIKE_ZONE_START = 60 and LANES multi-lane coordinates', () => {
    expect(STRIKE_ZONE_START).toBe(60);
    expect(LANES).toEqual([20, 40, 60, 80]);
  });

  it('awards "Perfect!" when hit within expanded strike zone (progress >= 60%)', () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const onScoreUpdate = vi.fn();

    const { rerender } = render(
      <LetterHeroGame letters={letters} onScoreUpdate={onScoreUpdate} transcript="" interimTranscript="" />
    );

    // Advance time so falling letter enters expanded strike zone (e.g. 3.2s out of 5s = 64% progress >= 60%)
    act(() => {
      vi.advanceTimersByTime(3200);
    });

    // Speak "apple" for letter A
    rerender(
      <LetterHeroGame letters={letters} onScoreUpdate={onScoreUpdate} transcript="apple" interimTranscript="" />
    );

    expect(playCorrectChime).toHaveBeenCalled();
    expect(onScoreUpdate).toHaveBeenCalledWith(100, 'Perfect!');
    expect(screen.getByText(/100 pts/i)).toBeDefined();
    expect(screen.getByText(/Perfect: 1/i)).toBeDefined();
  });

  it('immediately removes hit letter tile from DOM to prevent streaking/ghost trails', () => {
    const letters = ['A', 'B', 'C'];
    const { rerender } = render(
      <LetterHeroGame letters={letters} transcript="" interimTranscript="" />
    );

    // Initially letter A is on the track (2 instances: banner + track)
    expect(screen.getAllByText('A').length).toBe(2);

    // Speak letter A
    rerender(
      <LetterHeroGame letters={letters} transcript="A" interimTranscript="" />
    );

    // After hit, falling tile is removed immediately (only 1 instance remaining in top banner)
    expect(screen.getAllByText('A').length).toBe(1);
  });

  it('registers "Miss" when letter reaches bottom of track without being spoken', () => {
    const letters = ['A', 'B', 'C'];
    const onScoreUpdate = vi.fn();

    render(<LetterHeroGame letters={letters} onScoreUpdate={onScoreUpdate} />);

    // Advance time past 5s fall duration (5100ms)
    act(() => {
      vi.advanceTimersByTime(FALL_DURATION_MS + 200);
    });

    expect(playWrongSound).toHaveBeenCalled();
    expect(onScoreUpdate).toHaveBeenCalledWith(0, 'Miss');
    expect(screen.getByText(/Miss: 1/i)).toBeDefined();
  });

  it('supports click/tap interaction on falling letter tiles', () => {
    const letters = ['X', 'Y', 'Z'];

    render(<LetterHeroGame letters={letters} />);

    // Advance slightly so letter is falling
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Find falling letter tile 'X'
    const xTiles = screen.getAllByText('X');
    // xTiles[0] is top banner, xTiles[1] is falling tile on track
    const fallingTile = xTiles.length > 1 ? xTiles[1] : xTiles[0];
    expect(fallingTile).toBeDefined();

    fireEvent.click(fallingTile);

    expect(playCorrectChime).toHaveBeenCalled();
  });

  it('completes round when all 10 letters have been processed', () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const onComplete = vi.fn();

    render(<LetterHeroGame letters={letters} onComplete={onComplete} />);

    // Advance time step-by-step across 10 spawns (4s each) + 5s fall duration
    for (let i = 0; i < 11; i++) {
      act(() => {
        vi.advanceTimersByTime(4500);
      });
    }

    // Game completed overlay should show
    expect(screen.getByText(/Round Complete!/i)).toBeDefined();

    // Advance timer for completion callback delay
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('ensures single letter pacing and cleans up DOM elements on unmount', () => {
    const letters = ['A', 'B', 'C'];
    const { unmount } = render(<LetterHeroGame letters={letters} />);

    // Initially at t=0 only letter 'A' is falling on track (1 banner + 1 track = 2 instances)
    expect(screen.getAllByText('A').length).toBe(2);
    // B and C are not falling yet (only 1 instance in top banner)
    expect(screen.getAllByText('B').length).toBe(1);
    expect(screen.getAllByText('C').length).toBe(1);

    // Unmount component
    unmount();

    // All elements cleanly unmounted
    expect(screen.queryByText(/Alphabet Target Banner/i)).toBeNull();
  });
});
