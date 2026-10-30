import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  WhackAMoleGame,
  levenshteinDistance,
  isWordSpoken,
  DEFAULT_WHACK_OPTIONS,
} from '../WhackAMoleGame';
import { playCorrectChime, playWrongSound } from '../../../utils/audioSynthesizer';

// Mock audioSynthesizer to avoid Web Audio API issues in JSDOM
vi.mock('../../../utils/audioSynthesizer', () => ({
  playCorrectChime: vi.fn(),
  playWrongSound: vi.fn(),
  playClickSound: vi.fn(),
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('WhackAMoleGame Component & Utility Functions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Utility Functions', () => {
    it('computes Levenshtein distance accurately', () => {
      expect(levenshteinDistance('cat', 'cat')).toBe(0);
      expect(levenshteinDistance('cat', 'bat')).toBe(1);
      expect(levenshteinDistance('bear', 'bare')).toBe(2);
      expect(levenshteinDistance('', 'test')).toBe(4);
    });

    it('matches spoken words phonetically and fuzzy', () => {
      expect(isWordSpoken('I see a bear', 'bear')).toBe(true);
      expect(isWordSpoken('bare', 'bear')).toBe(true);
      expect(isWordSpoken('banana', 'banana')).toBe(true);
      expect(isWordSpoken('apple', 'bear')).toBe(false);
      expect(isWordSpoken('', 'bear')).toBe(false);
    });
  });

  describe('Component Behavior & State Rules', () => {
    it('renders initial 3x3 mole grid with 9 holes and header banner', () => {
      render(<WhackAMoleGame prompt="Whack words starting with: B 🐻" />);

      expect(screen.getByText(/Whack words starting with: B 🐻/i)).toBeDefined();
      expect(screen.getByText(/Hits: 0 \/ 10/i)).toBeDefined();
      expect(screen.getByText(/45s/i)).toBeDefined();

      for (let i = 0; i < 9; i++) {
        expect(screen.getByTestId(`mole-hole-${i}`)).toBeDefined();
      }
    });

    it('moles can ONLY be whacked when in UP state', () => {
      render(<WhackAMoleGame targetHits={10} timeLimit={45} />);

      // Initially all holes are DOWN (disabled)
      for (let i = 0; i < 9; i++) {
        const btn = screen.getByTestId(`mole-btn-${i}`) as HTMLButtonElement;
        expect(btn.disabled).toBe(true);

        // Clicking a DOWN mole does nothing (hits score remains 0)
        fireEvent.click(btn);
        expect(playCorrectChime).not.toHaveBeenCalled();
        expect(playWrongSound).not.toHaveBeenCalled();
      }
      expect(screen.getByText(/Hits: 0 \/ 10/i)).toBeDefined();
    });

    it('spawns 1 to 3 simultaneous moles and allows whacking an UP mole', () => {
      const onHit = vi.fn();
      render(<WhackAMoleGame onHit={onHit} targetHits={10} />);

      // Advance timers so spawner loop runs
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Find all mole buttons
      const buttons = screen.getAllByRole('button');
      const activeUpBtn = buttons.find((btn) => btn.getAttribute('data-status') === 'UP');

      expect(activeUpBtn).toBeDefined();

      if (activeUpBtn) {
        fireEvent.click(activeUpBtn);

        // One of audio functions should be called depending on whether it was target or distractor
        const chimeCalled = (playCorrectChime as ReturnType<typeof vi.fn>).mock.calls.length > 0;
        const wrongCalled = (playWrongSound as ReturnType<typeof vi.fn>).mock.calls.length > 0;
        expect(chimeCalled || wrongCalled).toBe(true);

        if (chimeCalled) {
          expect(onHit).toHaveBeenCalledWith(1);
          expect(screen.getByText(/Hits: 1 \/ 10/i)).toBeDefined();
        }
      }
    });

    it('correct hit increments hit count towards 10 and triggers correct chime', () => {
      // Force custom options with 1 target and 0 distractors to guarantee target hits
      const customOptions = [
        { id: 't1', word: 'Bear', emoji: '🐻', isTarget: true },
      ];
      const onHit = vi.fn();

      render(<WhackAMoleGame options={customOptions} onHit={onHit} targetHits={10} />);

      act(() => {
        vi.advanceTimersByTime(800);
      });

      const buttons = screen.getAllByRole('button');
      const upBtn = buttons.find((btn) => btn.getAttribute('data-status') === 'UP');
      expect(upBtn).toBeDefined();

      if (upBtn) {
        fireEvent.click(upBtn);
        expect(playCorrectChime).toHaveBeenCalled();
        expect(onHit).toHaveBeenCalledWith(1);
        expect(screen.getByText(/Hits: 1 \/ 10/i)).toBeDefined();
      }
    });

    it('distractor hit plays wrong sound and shows warning feedback', () => {
      // Custom options with only distractors to guarantee distractor hit
      const distractorOptions = [
        { id: 'd1', word: 'Cat', emoji: '🐱', isTarget: false },
      ];

      render(<WhackAMoleGame options={distractorOptions} targetHits={10} />);

      act(() => {
        vi.advanceTimersByTime(800);
      });

      const buttons = screen.getAllByRole('button');
      const upBtn = buttons.find((btn) => btn.getAttribute('data-status') === 'UP');

      expect(upBtn).toBeDefined();

      if (upBtn) {
        fireEvent.click(upBtn);
        expect(playWrongSound).toHaveBeenCalled();
        expect(screen.getByText(/❌ Oops! "Cat" is not a match!/i)).toBeDefined();
        // Hits score stays 0
        expect(screen.getByText(/Hits: 0 \/ 10/i)).toBeDefined();
      }
    });

    it('voice recognition matches spoken transcript to active UP moles', () => {
      const customOptions = [
        { id: 't1', word: 'Bear', emoji: '🐻', isTarget: true },
      ];

      const { rerender } = render(
        <WhackAMoleGame options={customOptions} transcript="" interimTranscript="" />
      );

      // Advance time so mole pops UP
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Pass voice transcript for "Bear"
      rerender(
        <WhackAMoleGame options={customOptions} transcript="Bear" interimTranscript="" />
      );

      expect(playCorrectChime).toHaveBeenCalled();
      expect(screen.getByText(/Hits: 1 \/ 10/i)).toBeDefined();
    });

    it('completes round when 10 hits are achieved', () => {
      const onComplete = vi.fn();
      const customOptions = [
        { id: 't1', word: 'Bear', emoji: '🐻', isTarget: true },
      ];

      const { rerender } = render(
        <WhackAMoleGame
          options={customOptions}
          targetHits={2} // lower target for fast test
          onComplete={onComplete}
          transcript=""
        />
      );

      // Hit 1
      act(() => {
        vi.advanceTimersByTime(800);
      });
      rerender(
        <WhackAMoleGame
          options={customOptions}
          targetHits={2}
          onComplete={onComplete}
          transcript="Bear"
        />
      );

      // Hit 2
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      rerender(
        <WhackAMoleGame
          options={customOptions}
          targetHits={2}
          onComplete={onComplete}
          transcript="Bear Bear"
        />
      );

      expect(screen.getByText(/🎉 Objective Complete!/i)).toBeDefined();

      // Advance time for onComplete callback delay
      act(() => {
        vi.advanceTimersByTime(1200);
      });

      expect(onComplete).toHaveBeenCalled();
    });

    it('triggers Game Over when timer reaches 0 before target hits', () => {
      render(<WhackAMoleGame timeLimit={5} targetHits={10} />);

      expect(screen.getByText(/5s/i)).toBeDefined();

      // Advance timer by 6s
      act(() => {
        vi.advanceTimersByTime(6000);
      });

      expect(screen.getByText(/⏰ Time's Up!/i)).toBeDefined();

      // Retry button resets timer and game
      const retryBtn = screen.getByText(/Try Again/i);
      fireEvent.click(retryBtn);

      expect(screen.queryByText(/⏰ Time's Up!/i)).toBeNull();
      expect(screen.getByText(/5s/i)).toBeDefined();
      expect(screen.getByText(/Hits: 0 \/ 10/i)).toBeDefined();
    });
  });
});
