import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Target, Timer, RotateCcw, Sparkles } from 'lucide-react';
import type { WhackAMoleProps, WhackAMoleOption, QuizOption } from '../../types/quiz';
import { playCorrectChime, playWrongSound } from '../../utils/audioSynthesizer';

export interface WhackAMoleGameProps extends WhackAMoleProps {
  transcript?: string;
  interimTranscript?: string;
  onComplete?: () => void;
  onHit?: (score: number) => void;
  clearTranscript?: () => void;
  resetTranscript?: () => void;
}

export type MoleStatus = 'DOWN' | 'UP' | 'RETRACTING' | 'HIT';

export interface MoleState {
  id: number; // 0..8
  status: MoleStatus;
  option: WhackAMoleOption | null;
}

/**
 * Default vocabulary/phonetics options used if none provided.
 */
export const DEFAULT_WHACK_OPTIONS: WhackAMoleOption[] = [
  // Targets (words starting with B)
  { id: 'b1', word: 'Bear', emoji: '🐻', isTarget: true },
  { id: 'b2', word: 'Ball', emoji: '⚽', isTarget: true },
  { id: 'b3', word: 'Bird', emoji: '🐦', isTarget: true },
  { id: 'b4', word: 'Bee', emoji: '🐝', isTarget: true },
  { id: 'b5', word: 'Banana', emoji: '🍌', isTarget: true },
  { id: 'b6', word: 'Boat', emoji: '⛵', isTarget: true },
  { id: 'b7', word: 'Bus', emoji: '🚌', isTarget: true },
  { id: 'b8', word: 'Book', emoji: '📖', isTarget: true },

  // Distractors
  { id: 'd1', word: 'Cat', emoji: '🐱', isTarget: false },
  { id: 'd2', word: 'Dog', emoji: '🐶', isTarget: false },
  { id: 'd3', word: 'Apple', emoji: '🍎', isTarget: false },
  { id: 'd4', word: 'Fish', emoji: '🐟', isTarget: false },
  { id: 'd5', word: 'Sun', emoji: '☀️', isTarget: false },
  { id: 'd6', word: 'Tree', emoji: '🌲', isTarget: false },
  { id: 'd7', word: 'Frog', emoji: '🐸', isTarget: false },
  { id: 'd8', word: 'Duck', emoji: '🦆', isTarget: false },
];

/**
 * Calculate Levenshtein distance for fuzzy speech matching.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Normalize and match spoken transcript against a target mole word.
 */
export function isWordSpoken(spokenText: string, targetWord: string): boolean {
  if (!spokenText || !targetWord) return false;
  const normSpoken = spokenText.toLowerCase().trim();
  const normTarget = targetWord.toLowerCase().trim();

  if (!normSpoken || !normTarget) return false;

  // Exact or substring match
  if (normSpoken.includes(normTarget)) return true;

  // Homophones / common speech recognition misrecognitions
  const homophoneMap: Record<string, string[]> = {
    bear: ['bare', 'bear'],
    ball: ['bawl', 'ball', 'bowl'],
    bee: ['be', 'bee'],
    bird: ['byrd', 'burd', 'bird'],
    sun: ['son', 'sun'],
    cat: ['kat', 'cat'],
  };

  const equivalents = homophoneMap[normTarget] || [];

  // Word token matching
  const tokens = normSpoken.split(/[\s,.\-!_?]+/).filter(Boolean);
  for (const token of tokens) {
    if (token === normTarget) return true;
    if (equivalents.includes(token)) return true;
    const maxDist = normTarget.length <= 4 ? 1 : 2;
    if (normTarget.length >= 3 && levenshteinDistance(token, normTarget) <= maxDist) {
      return true;
    }
  }

  return false;
}

/**
 * Convert WhackAMoleOption or QuizOption into WhackAMoleOption.
 */
function normalizeOptions(
  rawOptions?: WhackAMoleOption[] | QuizOption[],
  targetWord?: string
): WhackAMoleOption[] {
  if (!rawOptions || rawOptions.length === 0) {
    return DEFAULT_WHACK_OPTIONS;
  }

  return rawOptions.map((opt, idx) => {
    if ('word' in opt && typeof opt.word === 'string') {
      return opt as WhackAMoleOption;
    }
    const quizOpt = opt as QuizOption;
    const wordStr = quizOpt.label || quizOpt.value || quizOpt.id;
    const isTarget = targetWord
      ? wordStr.toLowerCase().trim() === targetWord.toLowerCase().trim()
      : idx === 0;

    return {
      id: quizOpt.id || `opt-${idx}`,
      word: wordStr,
      isTarget,
    };
  });
}

export const WhackAMoleGame: React.FC<WhackAMoleGameProps> = ({
  prompt = 'Whack words starting with: B 🐻',
  targetHits = 10,
  timeLimit = 45,
  options: rawOptions,
  targetWord,
  transcript = '',
  interimTranscript = '',
  onComplete,
  onHit,
}) => {
  const normalizedOptions = useMemo(
    () => normalizeOptions(rawOptions, targetWord),
    [rawOptions, targetWord]
  );

  const [moles, setMoles] = useState<MoleState[]>(() =>
    Array.from({ length: 9 }, (_, idx) => ({
      id: idx,
      status: 'DOWN',
      option: null,
    }))
  );

  const [hitsScore, setHitsScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const moleTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const processedCommandCountRef = useRef<number>(0);

  const molesRef = useRef(moles);
  molesRef.current = moles;

  const hitsScoreRef = useRef(hitsScore);
  hitsScoreRef.current = hitsScore;

  const isWonRef = useRef(isWon);
  isWonRef.current = isWon;

  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const onHitRef = useRef(onHit);
  onHitRef.current = onHit;

  // Clear timer for a specific hole
  const clearHoleTimer = useCallback((holeIdx: number) => {
    const existing = moleTimersRef.current.get(holeIdx);
    if (existing) {
      clearTimeout(existing);
      moleTimersRef.current.delete(holeIdx);
    }
  }, []);

  // Reset / Retry Game
  const handleRetry = useCallback(() => {
    // Clear all timers
    moleTimersRef.current.forEach((timer) => clearTimeout(timer));
    moleTimersRef.current.clear();

    setHitsScore(0);
    setTimeLeft(timeLimit);
    setIsWon(false);
    setIsGameOver(false);
    setWarningMsg(null);
    processedCommandCountRef.current = 0;

    setMoles(
      Array.from({ length: 9 }, (_, idx) => ({
        id: idx,
        status: 'DOWN',
        option: null,
      }))
    );
  }, [timeLimit]);

  // Overall Game Countdown Timer
  useEffect(() => {
    if (isWon || isGameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          isGameOverRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isWon, isGameOver]);

  // Retract mole helper
  const retractMole = useCallback((holeIdx: number) => {
    clearHoleTimer(holeIdx);

    setMoles((prev) =>
      prev.map((m) =>
        m.id === holeIdx ? { ...m, status: 'RETRACTING' } : m
      )
    );

    const retractTimer = setTimeout(() => {
      setMoles((prev) =>
        prev.map((m) =>
          m.id === holeIdx ? { ...m, status: 'DOWN', option: null } : m
        )
      );
      moleTimersRef.current.delete(holeIdx);
    }, 300);

    moleTimersRef.current.set(holeIdx, retractTimer);
  }, [clearHoleTimer]);

  // Handle whacking a mole (click or voice)
  const handleWhackMole = useCallback(
    (holeIdx: number) => {
      if (isWonRef.current || isGameOverRef.current) return;

      const currentMole = molesRef.current[holeIdx];
      // STRICT RULE: Mole can ONLY be whacked when in 'UP' position!
      if (!currentMole || currentMole.status !== 'UP' || !currentMole.option) {
        return;
      }

      clearHoleTimer(holeIdx);
      const isTarget = currentMole.option.isTarget;

      if (isTarget) {
        playCorrectChime();

        // Set to 'HIT' state for squish effect
        setMoles((prev) =>
          prev.map((m) =>
            m.id === holeIdx ? { ...m, status: 'HIT' } : m
          )
        );

        setHitsScore((prevScore) => {
          const nextScore = prevScore + 1;
          onHitRef.current?.(nextScore);

          if (nextScore >= targetHits) {
            setIsWon(true);
            isWonRef.current = true;
            try {
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            } catch {
              // Ignore in test environment
            }
            setTimeout(() => {
              onCompleteRef.current?.();
            }, 1000);
          }
          return nextScore;
        });

        const hitTimer = setTimeout(() => {
          setMoles((prev) =>
            prev.map((m) =>
              m.id === holeIdx ? { ...m, status: 'DOWN', option: null } : m
            )
          );
          moleTimersRef.current.delete(holeIdx);
        }, 400);

        moleTimersRef.current.set(holeIdx, hitTimer);
      } else {
        playWrongSound();
        setWarningMsg(`❌ Oops! "${currentMole.option.word}" is not a match!`);
        setTimeout(() => setWarningMsg(null), 1200);

        retractMole(holeIdx);
      }
    },
    [clearHoleTimer, targetHits, retractMole]
  );

  // Mole Pop Up Spawner Loop
  useEffect(() => {
    if (isWon || isGameOver) return;

    const spawnerInterval = setInterval(() => {
      const currentMoles = molesRef.current;
      const activeUpMoles = currentMoles.filter((m) => m.status === 'UP');

      // Maintain between 1 and 3 UP moles
      if (activeUpMoles.length < 3) {
        const availableDownHoles = currentMoles.filter((m) => m.status === 'DOWN');

        if (availableDownHoles.length > 0) {
          const randomHole =
            availableDownHoles[Math.floor(Math.random() * availableDownHoles.length)];

          // Ensure options are selected with a healthy mix of target and distractors
          const targets = normalizedOptions.filter((o) => o.isTarget);
          const distractors = normalizedOptions.filter((o) => !o.isTarget);

          const hasTargetUp = activeUpMoles.some((m) => m.option?.isTarget);
          let chosenOption: WhackAMoleOption;

          if (!hasTargetUp && targets.length > 0) {
            chosenOption = targets[Math.floor(Math.random() * targets.length)];
          } else {
            const pool = normalizedOptions;
            chosenOption = pool[Math.floor(Math.random() * pool.length)];
          }

          // Pop UP mole
          setMoles((prev) =>
            prev.map((m) =>
              m.id === randomHole.id
                ? { ...m, status: 'UP', option: chosenOption }
                : m
            )
          );

          // Staggered popup duration (1.5s - 2.5s)
          const duration = 1500 + Math.random() * 1000;

          const popupTimer = setTimeout(() => {
            retractMole(randomHole.id);
          }, duration);

          moleTimersRef.current.set(randomHole.id, popupTimer);
        }
      }
    }, 700);

    return () => clearInterval(spawnerInterval);
  }, [isWon, isGameOver, normalizedOptions, retractMole]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      moleTimersRef.current.forEach((t) => clearTimeout(t));
      moleTimersRef.current.clear();
    };
  }, []);

  // Voice transcript matching
  useEffect(() => {
    const combined = `${transcript} ${interimTranscript}`.trim();
    if (!combined) {
      processedCommandCountRef.current = 0;
      return;
    }

    const tokens = combined.split(/[\s,.\-!_?]+/).filter(Boolean);
    if (tokens.length < processedCommandCountRef.current) {
      processedCommandCountRef.current = tokens.length;
    }

    if (tokens.length > processedCommandCountRef.current) {
      const newTokens = tokens.slice(processedCommandCountRef.current);
      processedCommandCountRef.current = tokens.length;

      for (const token of newTokens) {
        const currentUpMoles = molesRef.current.filter((m) => m.status === 'UP' && m.option);

        for (const mole of currentUpMoles) {
          if (mole.option && isWordSpoken(token, mole.option.word)) {
            handleWhackMole(mole.id);
            break;
          }
        }
      }
    }
  }, [transcript, interimTranscript, handleWhackMole]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center select-none font-sans">
      {/* Objective & Status Header Banner */}
      <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-4 text-white shadow-xl mb-4 text-center border-4 border-amber-200">
        <div className="flex items-center justify-between gap-2 mb-2 px-2 flex-wrap sm:flex-nowrap">
          {/* Target Score Banner */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl font-black text-sm sm:text-base">
            <Target size={20} className="text-amber-200" />
            <span>Hits: {hitsScore} / {targetHits}</span>
          </div>

          {/* Countdown Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-black text-sm sm:text-base ${
            timeLeft <= 10 ? 'bg-rose-600 text-white animate-pulse' : 'bg-white/20 text-white'
          }`}>
            <Timer size={20} />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Objective Prompt Title */}
        <h2 className="text-lg sm:text-xl font-black tracking-wide text-amber-100 drop-shadow">
          {prompt}
        </h2>

        {/* Warning Banner Feedback */}
        {warningMsg && (
          <div className="mt-2 text-xs sm:text-sm font-extrabold text-yellow-200 bg-black/20 py-1 px-3 rounded-xl animate-bounce inline-block">
            {warningMsg}
          </div>
        )}
      </div>

      {/* 3x3 Whack-A-Mole Grid Area */}
      <div className="relative bg-gradient-to-b from-amber-900 to-amber-950 rounded-3xl p-4 sm:p-6 shadow-2xl border-8 border-amber-800/80 w-full max-w-[440px] overflow-hidden">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 justify-items-center">
          {moles.map((mole) => {
            const isUp = mole.status === 'UP';
            const isHit = mole.status === 'HIT';
            const isRetracting = mole.status === 'RETRACTING';

            return (
              <div
                key={mole.id}
                data-testid={`mole-hole-${mole.id}`}
                className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center"
              >
                {/* Hole Ground & Rim Background SVG */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full pointer-events-none z-0"
                >
                  {/* Dirt Hole Shadow */}
                  <ellipse cx="50" cy="70" rx="42" ry="22" fill="#2d1810" />
                  {/* Outer Rim */}
                  <ellipse cx="50" cy="68" rx="42" ry="20" fill="#4a2810" stroke="#1f0e08" strokeWidth="4" />
                  {/* Inner Hole Pit */}
                  <ellipse cx="50" cy="68" rx="36" ry="15" fill="#170a04" />
                </svg>

                {/* Mole Pop Up Interactive Button */}
                <button
                  type="button"
                  data-testid={`mole-btn-${mole.id}`}
                  data-status={mole.status}
                  onClick={() => handleWhackMole(mole.id)}
                  disabled={!isUp}
                  className={`absolute z-10 w-20 sm:w-24 h-20 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none ${
                    isHit
                      ? 'scale-110 bg-amber-400 text-amber-950 border-4 border-yellow-300 shadow-2xl animate-ping'
                      : isUp
                      ? 'top-0 scale-100 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-amber-950 shadow-xl border-4 border-amber-200 active:scale-95'
                      : isRetracting
                      ? 'top-4 scale-75 opacity-60 bg-amber-600 text-amber-950'
                      : 'top-10 scale-0 opacity-0 pointer-events-none'
                  }`}
                  style={{
                    top: isUp ? '2px' : isRetracting ? '24px' : '45px',
                  }}
                >
                  {isHit ? (
                    <div className="font-black text-lg sm:text-xl text-rose-800 animate-bounce">
                      💥 HIT!
                    </div>
                  ) : isUp && mole.option ? (
                    <>
                      {/* Mole Cute Face Header */}
                      <span className="text-xl sm:text-2xl leading-none">
                        {mole.option.emoji || '🐹'}
                      </span>
                      {/* Word Banner Label */}
                      <span className="text-xs sm:text-sm font-extrabold text-amber-950 tracking-tight max-w-[90%] truncate px-1 mt-0.5 bg-amber-100/90 rounded-md border border-amber-400">
                        {mole.option.word}
                      </span>
                    </>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>

        {/* Win / Celebration Overlay */}
        {isWon && (
          <div className="absolute inset-0 bg-amber-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 rounded-3xl animate-fade-in z-30">
            <Sparkles size={64} className="text-amber-400 animate-spin mb-3" />
            <h3 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">
              🎉 Objective Complete!
            </h3>
            <p className="text-sm sm:text-base font-bold text-amber-100 mb-4">
              You whacked {hitsScore} correct words!
            </p>
          </div>
        )}

        {/* Game Over / Time Out Overlay */}
        {isGameOver && !isWon && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 rounded-3xl animate-fade-in z-30">
            <Timer size={64} className="text-rose-500 animate-pulse mb-2" />
            <h3 className="text-2xl sm:text-3xl font-black text-rose-400 mb-1">
              ⏰ Time's Up!
            </h3>
            <p className="text-sm text-slate-300 font-semibold mb-4">
              You got {hitsScore} out of {targetHits} hits!
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base sm:text-lg rounded-2xl flex items-center gap-2 shadow-xl border-b-4 border-amber-800 cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw size={20} />
              <span>Try Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
