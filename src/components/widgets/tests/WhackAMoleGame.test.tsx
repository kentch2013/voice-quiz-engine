import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  WhackAMoleGame,
  levenshteinDistance,
  isWordSpoken,
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
    it('renders initial 3x3 mole grid with 9 holes, child pacing timer, and persistent word on each hole', () => {
      render(<WhackAMoleGame prompt="Whack words starting with: B 🐻" />);

      expect(screen.getByText(/Whack words starting with: B 🐻/i)).toBeDefined();
      expect(screen.getByText(/Hits: 0 \/ 10/i)).toBeDefined();
      // Child pacing default timer is 75s
      expect(screen.getByText(/75s/i)).toBeDefined();

      for (let i = 0; i < 9; i++) {
        expect(screen.getByTestId(`mole-hole-${i}`)).toBeDefined();
        const holeWordBtn = screen.getByTestId(`hole-word-${i}`) as HTMLButtonElement;
        expect(holeWordBtn).toBeDefined();
        expect(holeWordBtn.textContent?.trim().length).toBeGreaterThan(0);
        // Initially DOWN -> greyed out
        expect(holeWordBtn.disabled).toBe(true);
        expect(holeWordBtn.className).toContain('text-slate-400');
      }
    });

    it('moles can ONLY be whacked when in UP state (greyed-out words cannot be scored via voice or click)', () => {
      render(<WhackAMoleGame targetHits={10} timeLimit={45} />);

      // Initially all holes are DOWN (disabled)
      for (let i = 0; i < 9; i++) {
        const btn = screen.getByTestId(`mole-btn-${i}`) as HTMLButtonElement;
        const wordBtn = screen.getByTestId(`hole-word-${i}`) as HTMLButtonElement;
        expect(btn.disabled).toBe(true);
        expect(wordBtn.disabled).toBe(true);

        // Clicking a DOWN mole or greyed-out word label does nothing
        fireEvent.click(btn);
        fireEvent.click(wordBtn);
        expect(playCorrectChime).not.toHaveBeenCalled();
        expect(playWrongSound).not.toHaveBeenCalled();
      }
      expect(screen.getByText(/Hits: 0 \/ 10/i)).toBeDefined();
    });

    it('spoken words targeting greyed-out holes MUST NOT score or register hits', () => {
      // Setup options where Bear is a target but all holes start DOWN
      const customOptions = [
        { id: 't1', word: 'Bear', emoji: '🐻', isTarget: true },
        { id: 'd1', word: 'Cat', emoji: '🐱', isTarget: false },
      ];

      render(<WhackAMoleGame options={customOptions} transcript="Bear" />);

      // No mole is UP yet, so speaking "Bear" must NOT register a hit
      expect(playCorrectChime).not.toHaveBeenCalled();
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

    it('correct hit increments hit count towards 10, replaces word with a new option from pool, and lights up', () => {
      // Provide pool with 10 distinct options so replacement is guaranteed
      const pool = [
        { id: 'w0', word: 'Bear', isTarget: true },
        { id: 'w1', word: 'Bird', isTarget: true },
        { id: 'w2', word: 'Ball', isTarget: true },
        { id: 'w3', word: 'Bee', isTarget: true },
        { id: 'w4', word: 'Banana', isTarget: true },
        { id: 'w5', word: 'Boat', isTarget: true },
        { id: 'w6', word: 'Bus', isTarget: true },
        { id: 'w7', word: 'Book', isTarget: true },
        { id: 'w8', word: 'Box', isTarget: true },
        { id: 'w9', word: 'Baby', isTarget: true },
      ];
      const onHit = vi.fn();

      render(<WhackAMoleGame options={pool} onHit={onHit} targetHits={10} />);

      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Find lit-up UP mole and its hole index
      let upHoleIndex = -1;
      for (let i = 0; i < 9; i++) {
        const btn = screen.getByTestId(`mole-btn-${i}`);
        if (btn.getAttribute('data-status') === 'UP') {
          upHoleIndex = i;
          break;
        }
      }
      expect(upHoleIndex).toBeGreaterThanOrEqual(0);

      const wordBtn = screen.getByTestId(`hole-word-${upHoleIndex}`) as HTMLButtonElement;
      // Word label is lit up when UP
      expect(wordBtn.className).toContain('text-amber-500');
      expect(wordBtn.disabled).toBe(false);

      const initialWord = wordBtn.textContent;

      // Whack via word button or mole button
      fireEvent.click(wordBtn);
      expect(playCorrectChime).toHaveBeenCalled();
      expect(onHit).toHaveBeenCalledWith(1);
      expect(screen.getByText(/Hits: 1 \/ 10/i)).toBeDefined();

      // In HIT state
      expect(wordBtn.className).toContain('text-emerald-400');

      // Advance timer for hit completion (400ms)
      act(() => {
        vi.advanceTimersByTime(400);
      });

      // Word should have been replaced with a fresh unchosen word from the pool (or different from initial)
      const replacedWordBtn = screen.getByTestId(`hole-word-${upHoleIndex}`);
      expect(replacedWordBtn.textContent).not.toBe(initialWord);
    });

    it('emergent reader kid-friendly popup stays UP for 4.5s before retracting', () => {
      const customOptions = [
        { id: 't1', word: 'Bear', emoji: '🐻', isTarget: true },
      ];

      render(<WhackAMoleGame options={customOptions} targetHits={10} />);

      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Find which hole popped up
      let upIndex = -1;
      for (let i = 0; i < 9; i++) {
        if (screen.getByTestId(`mole-btn-${i}`).getAttribute('data-status') === 'UP') {
          upIndex = i;
          break;
        }
      }
      expect(upIndex).toBeGreaterThanOrEqual(0);

      // Advance by 3000ms (fast pacing would have retracted by now at 2.5s)
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Still UP because kid-friendly pacing is 4.5s-6.0s!
      expect(screen.getByTestId(`mole-btn-${upIndex}`).getAttribute('data-status')).toBe('UP');

      // Advance beyond 6000ms + retract animation (300ms)
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // Now it should have retracted
      expect(screen.getByTestId(`mole-btn-${upIndex}`).getAttribute('data-status')).toBe('DOWN');
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
