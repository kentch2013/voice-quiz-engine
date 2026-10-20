import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import type { NumberSnakeProps } from '../../types/quiz';
import { playCorrectChime, playWrongSound } from '../../utils/audioSynthesizer';

const GRID_SIZE = 16;
const TICK_MS = 380;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

interface GridNumber {
  id: string;
  value: number;
  x: number;
  y: number;
}

export interface NumberSnakeGameProps extends NumberSnakeProps {
  transcript?: string;
  interimTranscript?: string;
}

/**
 * Utility function to parse directional speech commands from transcripts.
 */
export function parseVoiceDirection(text: string): Direction | null {
  if (!text) return null;
  const normalized = text.toLowerCase().trim();

  // Check right before left/up/down in case of compound strings
  if (
    normalized.includes('go right') ||
    normalized.includes('turn right') ||
    normalized.includes('move right') ||
    normalized.includes('right') ||
    normalized.includes('向右') ||
    normalized.includes('右')
  ) {
    return 'RIGHT';
  }

  if (
    normalized.includes('go left') ||
    normalized.includes('turn left') ||
    normalized.includes('move left') ||
    normalized.includes('left') ||
    normalized.includes('向左') ||
    normalized.includes('左')
  ) {
    return 'LEFT';
  }

  if (
    normalized.includes('go up') ||
    normalized.includes('turn up') ||
    normalized.includes('move up') ||
    normalized.includes('up') ||
    normalized.includes('向上') ||
    normalized.includes('上')
  ) {
    return 'UP';
  }

  if (
    normalized.includes('go down') ||
    normalized.includes('turn down') ||
    normalized.includes('move down') ||
    normalized.includes('down') ||
    normalized.includes('向下') ||
    normalized.includes('下')
  ) {
    return 'DOWN';
  }

  return null;
}

/**
 * Helper to compute next wrapped coordinate on a 16x16 grid board.
 */
export function getWrappedCoordinate(pos: Position, dir: Direction, gridSize = GRID_SIZE): Position {
  let { x, y } = pos;
  switch (dir) {
    case 'UP':
      y -= 1;
      break;
    case 'DOWN':
      y += 1;
      break;
    case 'LEFT':
      x -= 1;
      break;
    case 'RIGHT':
      x += 1;
      break;
  }
  return {
    x: (x + gridSize) % gridSize,
    y: (y + gridSize) % gridSize,
  };
}

/**
 * Helper to generate 10 non-overlapping grid number placements.
 */
export function placeNumbersOnGrid(numbers: number[], initialSnake: Position[]): GridNumber[] {
  const occupied = new Set<string>();
  initialSnake.forEach((p) => occupied.add(`${p.x},${p.y}`));

  const result: GridNumber[] = [];
  numbers.forEach((val, index) => {
    let x: number;
    let y: number;
    let key: string;
    do {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
      key = `${x},${y}`;
    } while (occupied.has(key));

    occupied.add(key);
    result.push({
      id: `num-${val}-${index}`,
      value: val,
      x,
      y,
    });
  });

  return result;
}

export const NumberSnakeGame: React.FC<NumberSnakeGameProps> = ({
  numbers = [12, 45, 3, 89, 27, 64, 51, 98, 33, 76],
  mode = 'ascending',
  transcript = '',
  interimTranscript = '',
  onComplete,
}) => {
  // Sort numbers according to objective mode
  const sortedTargets = useRef<number[]>([]);
  useEffect(() => {
    const copy = [...numbers];
    if (mode === 'ascending') {
      copy.sort((a, b) => a - b);
    } else {
      copy.sort((a, b) => b - a);
    }
    sortedTargets.current = copy;
  }, [numbers, mode]);

  const initialSnake: Position[] = [
    { x: 8, y: 7 },
    { x: 8, y: 8 },
    { x: 8, y: 9 },
  ];

  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [direction, setDirection] = useState<Direction>('UP');
  const [gridNumbers, setGridNumbers] = useState<GridNumber[]>(() =>
    placeNumbersOnGrid(numbers, initialSnake)
  );
  const [currentTargetIndex, setCurrentTargetIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastBounceMessage, setLastBounceMessage] = useState<string | null>(null);

  const pendingDirectionRef = useRef<Direction>('UP');
  const currentDirectionRef = useRef<Direction>('UP');
  const lastProcessedTranscriptRef = useRef<string>('');

  currentDirectionRef.current = direction;

  // Handle direction change request safely
  const changeDirection = useCallback((newDir: Direction) => {
    const current = currentDirectionRef.current;
    if (
      (newDir === 'UP' && current === 'DOWN') ||
      (newDir === 'DOWN' && current === 'UP') ||
      (newDir === 'LEFT' && current === 'RIGHT') ||
      (newDir === 'RIGHT' && current === 'LEFT')
    ) {
      return; // Do not allow instant 180-degree reverse into self
    }
    pendingDirectionRef.current = newDir;
    setDirection(newDir);
  }, []);

  // Voice command handling
  useEffect(() => {
    const combined = `${transcript} ${interimTranscript}`.trim();
    if (combined && combined !== lastProcessedTranscriptRef.current) {
      lastProcessedTranscriptRef.current = combined;
      const voiceDir = parseVoiceDirection(combined);
      if (voiceDir) {
        changeDirection(voiceDir);
      }
    }
  }, [transcript, interimTranscript, changeDirection]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection]);

  // Game tick interval
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const currentDir = pendingDirectionRef.current;
        const nextHead = getWrappedCoordinate(head, currentDir);

        // 1. Check self collision
        // Check if nextHead overlaps with body (excluding tail unless growing)
        const isSelfCollision = prevSnake
          .slice(0, -1)
          .some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

        if (isSelfCollision) {
          playWrongSound();
          setLastBounceMessage('Oops! Soft bounce off yourself!');
          setTimeout(() => setLastBounceMessage(null), 1200);
          return prevSnake; // Cancel move (soft bounce)
        }

        // 2. Check number collision
        const hitNumber = gridNumbers.find(
          (gn) => gn.x === nextHead.x && gn.y === nextHead.y
        );

        if (hitNumber) {
          const currentTargetVal = sortedTargets.current[currentTargetIndex];

          if (hitNumber.value === currentTargetVal) {
            // Correct Target Eaten!
            playCorrectChime();
            const newSnake = [nextHead, ...prevSnake]; // Snake grows by 1 segment

            // Remove eaten number from grid
            setGridNumbers((prev) => prev.filter((gn) => gn.id !== hitNumber.id));

            const nextIndex = currentTargetIndex + 1;
            setCurrentTargetIndex(nextIndex);

            if (nextIndex >= sortedTargets.current.length) {
              // Game Completed!
              setIsCompleted(true);
              try {
                confetti({
                  particleCount: 120,
                  spread: 80,
                  origin: { y: 0.6 },
                });
              } catch {
                // Ignore if confetti unavailable in test env
              }
              if (onComplete) {
                setTimeout(() => onComplete(), 1500);
              }
            }

            return newSnake;
          } else {
            // Wrong Number (Out of Order)!
            playWrongSound();
            setLastBounceMessage(
              `Wrong order! Target is ${sortedTargets.current[currentTargetIndex]}`
            );
            setTimeout(() => setLastBounceMessage(null), 1500);
            return prevSnake; // Soft bounce back, number remains on board
          }
        }

        // 3. Normal Empty Cell Movement
        const newSnake = [nextHead, ...prevSnake.slice(0, -1)];
        return newSnake;
      });
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [gridNumbers, currentTargetIndex, isCompleted, onComplete]);

  const currentTargetNumber = sortedTargets.current[currentTargetIndex];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Objective & Target Header Display */}
      <div className="w-full bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-lg mb-4 text-center border-2 border-indigo-200">
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap mb-2">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
            {mode === 'ascending' ? '📈 Least to Greatest' : '📉 Greatest to Least'}
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl font-black text-xs sm:text-sm">
            Eaten: {currentTargetIndex} / {sortedTargets.current.length}
          </div>
        </div>

        {/* Next Target Banner */}
        <div className="flex flex-col items-center justify-center bg-white/95 rounded-xl py-2 px-4 text-slate-900 shadow-inner">
          <span className="text-xs font-black uppercase text-indigo-600 tracking-widest">
            🎯 NEXT TARGET NUMBER
          </span>
          <span className="text-4xl font-black tracking-tight text-indigo-900 animate-pulse">
            {currentTargetNumber ?? <Trophy size={36} className="text-amber-500 inline" />}
          </span>
        </div>

        {lastBounceMessage && (
          <div className="mt-2 text-xs sm:text-sm font-extrabold text-amber-200 animate-bounce">
            ⚠️ {lastBounceMessage}
          </div>
        )}
      </div>

      {/* 16x16 Snake Grid Board */}
      <div className="relative bg-slate-900 rounded-2xl p-2.5 shadow-2xl border-4 border-indigo-500/30 overflow-hidden w-full aspect-square max-w-[420px]">
        <div
          className="w-full h-full grid grid-cols-16 grid-rows-16 gap-[1px] bg-slate-800/60 rounded-xl overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);

            // Check if head, body, or number
            const isHead = snake[0]?.x === x && snake[0]?.y === y;
            const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
            const gridNum = gridNumbers.find((gn) => gn.x === x && gn.y === y);
            const isTarget = gridNum && gridNum.value === currentTargetNumber;

            let bgClass = 'bg-slate-900/40';
            if (isHead) {
              bgClass = 'bg-emerald-400 rounded-md shadow-md shadow-emerald-400/50 scale-95 border-2 border-white';
            } else if (isBody) {
              bgClass = 'bg-emerald-500/80 rounded-sm scale-90';
            }

            return (
              <div
                key={`${x}-${y}`}
                className={`relative flex items-center justify-center transition-all duration-75 ${bgClass}`}
              >
                {/* Snake Eyes on Head */}
                {isHead && (
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-ping" />
                )}

                {/* Number Food Tile */}
                {gridNum && (
                  <div
                    className={`absolute inset-0.5 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black shadow-md transition-transform duration-200 ${
                      isTarget
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-200 animate-bounce z-10'
                        : 'bg-indigo-600 text-white opacity-90'
                    }`}
                  >
                    {gridNum.value}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Celebration Overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-indigo-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 rounded-2xl animate-fade-in z-20">
            <Sparkles size={64} className="text-amber-400 animate-spin mb-3" />
            <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">
              🎉 Round Complete!
            </h2>
            <p className="text-sm text-indigo-100 font-bold">
              You ate all 10 numbers in correct sequence!
            </p>
          </div>
        )}
      </div>

      {/* Floating Touch D-Pad for Tablet & Mobile Thumb Access */}
      <div className="mt-4 flex flex-col items-center justify-center gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Voice / Touch D-Pad Controls
        </span>
        <button
          type="button"
          onClick={() => changeDirection('UP')}
          aria-label="Move Up"
          className="w-14 h-12 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl flex items-center justify-center shadow-md border-b-4 border-indigo-900 cursor-pointer transition-transform active:scale-95"
        >
          <ArrowUp size={24} />
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => changeDirection('LEFT')}
            aria-label="Move Left"
            className="w-14 h-12 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl flex items-center justify-center shadow-md border-b-4 border-indigo-900 cursor-pointer transition-transform active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center text-indigo-700 font-extrabold text-xs">
            🐍
          </div>
          <button
            type="button"
            onClick={() => changeDirection('RIGHT')}
            aria-label="Move Right"
            className="w-14 h-12 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl flex items-center justify-center shadow-md border-b-4 border-indigo-900 cursor-pointer transition-transform active:scale-95"
          >
            <ArrowRight size={24} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => changeDirection('DOWN')}
          aria-label="Move Down"
          className="w-14 h-12 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl flex items-center justify-center shadow-md border-b-4 border-indigo-900 cursor-pointer transition-transform active:scale-95"
        >
          <ArrowDown size={24} />
        </button>
      </div>
    </div>
  );
};
