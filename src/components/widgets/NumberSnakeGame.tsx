import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import type { NumberSnakeProps } from '../../types/quiz';
import { playCorrectChime, playWrongSound } from '../../utils/audioSynthesizer';

const GRID_SIZE = 16;
const TICK_MS = 1100;

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
  onEatTarget?: (targetValue: number, eatenCount: number) => void;
  onComplete?: () => void;
}

/**
 * Compute Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Phonetic / consonant skeletal encoder for acoustic similarity matching.
 */
export function toPhonetic(word: string): string {
  if (!word) return '';
  let w = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!w) return '';

  // Common phonetic acoustic transformations
  w = w.replace(/ight/g, 'it');
  w = w.replace(/(ough|augh)/g, 'af');
  if (w.startsWith('wr')) w = 'r' + w.slice(2);
  if (w.startsWith('kn') || w.startsWith('gn')) w = 'n' + w.slice(2);
  w = w.replace(/ph/g, 'f');
  w = w.replace(/ck/g, 'k');
  w = w.replace(/mb$/g, 'm');
  w = w.replace(/gh$/g, 'f');
  w = w.replace(/th/g, 'd');
  w = w.replace(/qu/g, 'k');

  const result: string[] = [];
  const isInitialVowel = 'aeiouy'.includes(w[0]);
  if (isInitialVowel) {
    result.push('V');
  }

  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    if ('aeiouy'.includes(ch)) {
      continue;
    }
    let code = '';
    if (ch === 'r' || ch === 'w') code = 'R';
    else if (ch === 'l') code = 'L';
    else if (ch === 'f' || ch === 'v') code = 'F';
    else if (ch === 'd' || ch === 't') code = 'D';
    else if (ch === 'p' || ch === 'b') code = 'P';
    else if (ch === 'm' || ch === 'n') code = 'N';
    else if (ch === 's' || ch === 'z' || ch === 'j') code = 'S';
    else if (ch === 'k' || ch === 'g' || ch === 'c' || ch === 'q' || ch === 'x') code = 'K';
    else if (ch === 'h') code = i === 0 ? 'H' : '';

    if (code && (result.length === 0 || result[result.length - 1] !== code)) {
      result.push(code);
    }
  }

  return result.join('');
}

/**
 * Weighted distance between two phonetic skeletal strings.
 */
function phoneticDistance(p1: string, p2: string): number {
  if (p1 === p2) return 0;
  if (p1.length === 0) return p2.length;
  if (p2.length === 0) return p1.length;

  const dp: number[][] = Array.from({ length: p2.length + 1 }, () =>
    new Array(p1.length + 1).fill(0)
  );

  for (let j = 0; j <= p1.length; j++) dp[0][j] = j;
  for (let i = 0; i <= p2.length; i++) dp[i][0] = i;

  for (let i = 1; i <= p2.length; i++) {
    for (let j = 1; j <= p1.length; j++) {
      const c1 = p1[j - 1];
      const c2 = p2[i - 1];

      let subCost = 1.0;
      if (c1 === c2) {
        subCost = 0.0;
      } else if ((c1 === 'L' && c2 === 'R') || (c1 === 'R' && c2 === 'L')) {
        subCost = 0.3; // Liquid / Rhotic proximity
      } else if ((c1 === 'F' && c2 === 'P') || (c1 === 'P' && c2 === 'F')) {
        subCost = 0.4; // Fricative / Stop labial proximity
      } else if ((c1 === 'D' && c2 === 'N') || (c1 === 'N' && c2 === 'D')) {
        subCost = 0.5; // Alveolar stop / Nasal proximity
      }

      dp[i][j] = Math.min(
        dp[i - 1][j - 1] + subCost,
        dp[i][j - 1] + 1.0,
        dp[i - 1][j] + 1.0
      );
    }
  }

  return dp[p2.length][p1.length];
}

/**
 * Simplify acoustic spellings prior to string distance comparison.
 */
function simplifyAcoustic(word: string): string {
  let w = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  w = w.replace(/ight/g, 'it');
  w = w.replace(/(ough|augh)/g, 'af');
  if (w.startsWith('wr')) w = 'r' + w.slice(2);
  if (w.startsWith('kn') || w.startsWith('gn')) w = 'n' + w.slice(2);
  w = w.replace(/ph/g, 'f');
  w = w.replace(/ck/g, 'k');
  w = w.replace(/gh$/g, 'f');
  w = w.replace(/th/g, 'd');
  return w;
}

/**
 * Programmatic distance and phonetic acoustic similarity matcher for directional commands.
 */
export function matchFuzzyDirection(word: string): Direction | null {
  if (!word || word.length < 2) return null;
  const cleaned = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!cleaned) return null;

  const CANONICAL_DIRECTIONS: { dir: Direction; canonical: string }[] = [
    { dir: 'UP', canonical: 'up' },
    { dir: 'DOWN', canonical: 'down' },
    { dir: 'LEFT', canonical: 'left' },
    { dir: 'RIGHT', canonical: 'right' },
  ];

  const simplifiedInput = simplifyAcoustic(cleaned);
  const wordPhonetic = toPhonetic(cleaned);

  const scores: { dir: Direction; score: number }[] = [];

  for (const { dir, canonical } of CANONICAL_DIRECTIONS) {
    // Length guard: directional words up/down/left/right are short (2-5 chars).
    // Misheard variants are typically 3-5 chars. Ignore words with length difference > 2 (or > 1 for 'up').
    const lenDiff = Math.abs(cleaned.length - canonical.length);
    if (dir === 'UP' && (cleaned.length > 4 || cleaned.length < 2)) continue;
    if (dir !== 'UP' && lenDiff > 2) continue;

    const simplifiedCanonical = simplifyAcoustic(canonical);
    const rawEdit = levenshteinDistance(simplifiedInput, simplifiedCanonical);
    const maxTextLen = Math.max(simplifiedInput.length, simplifiedCanonical.length);
    let textSim = 1 - rawEdit / maxTextLen;
    if (textSim < 0) textSim = 0;

    const canonicalPhonetic = toPhonetic(canonical);
    const phonDist = phoneticDistance(wordPhonetic, canonicalPhonetic);
    const maxPhonLen = Math.max(wordPhonetic.length, canonicalPhonetic.length) || 1;
    let phonSim = 1 - phonDist / maxPhonLen;
    if (phonSim < 0) phonSim = 0;

    let composite = 0.5 * textSim + 0.5 * phonSim;

    // Initial consonant / acoustic frame alignment bonuses
    if (dir === 'RIGHT') {
      if (cleaned.startsWith('r') || cleaned.startsWith('wr')) composite += 0.12;
      else if (cleaned.startsWith('l') && (cleaned.includes('i') || cleaned.includes('y'))) composite += 0.08;
    } else if (dir === 'LEFT') {
      if (cleaned.startsWith('l')) composite += 0.12;
    } else if (dir === 'DOWN') {
      if (cleaned.startsWith('d') || cleaned.startsWith('t')) composite += 0.12;
    } else if (dir === 'UP') {
      if (cleaned.startsWith('u') || cleaned.startsWith('a') || cleaned.startsWith('o')) composite += 0.12;
      if (cleaned.endsWith('p') || cleaned.endsWith('b')) composite += 0.08;
    }

    // Penalty for large text distance or length mismatches
    if (rawEdit >= 3 || textSim < 0.25) {
      composite *= 0.5;
    }

    scores.push({ dir, score: composite });
  }

  if (scores.length === 0) return null;

  // Sort candidates by highest score
  scores.sort((a, b) => b.score - a.score);

  const top = scores[0];
  const second = scores[1];

  const ACCEPTANCE_THRESHOLD = 0.55;
  const MARGIN_THRESHOLD = 0.10;

  if (top && top.score >= ACCEPTANCE_THRESHOLD) {
    if (!second || (top.score - second.score) >= MARGIN_THRESHOLD) {
      return top.dir;
    }
  }

  return null;
}

/**
 * Tokenize incoming speech transcript into sequential directional commands.
 */
export function extractVoiceDirections(text: string): Direction[] {
  if (!text) return [];

  let normalized = text.toLowerCase().trim();

  // Preprocess Chinese directional synonyms
  normalized = normalized
    .replace(/向上/g, ' up ')
    .replace(/上/g, ' up ')
    .replace(/向下/g, ' down ')
    .replace(/下/g, ' down ')
    .replace(/向左/g, ' left ')
    .replace(/左/g, ' left ')
    .replace(/向右/g, ' right ')
    .replace(/右/g, ' right ');

  const words = normalized.split(/[\s,.!?;:]+/).filter(Boolean);
  const directions: Direction[] = [];

  const upSet = new Set(['up', 'opp', 'op', 'north', 'hop', 'cup', 'u', 'shang']);
  const downSet = new Set(['down', 'done', 'south', 'd', 'dow', 'xia']);
  const leftSet = new Set(['left', 'west', 'l', 'lef', 'zuo']);
  const rightSet = new Set(['right', 'write', 'ite', 'east', 'r', 'rig', 'ri', 'you']);

  let i = 0;
  while (i < words.length) {
    // Check 2-word compound phrases
    if (i + 1 < words.length) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (phrase === 'go up' || phrase === 'turn up' || phrase === 'move up') {
        directions.push('UP');
        i += 2;
        continue;
      }
      if (phrase === 'go down' || phrase === 'turn down' || phrase === 'move down') {
        directions.push('DOWN');
        i += 2;
        continue;
      }
      if (phrase === 'go left' || phrase === 'turn left' || phrase === 'move left') {
        directions.push('LEFT');
        i += 2;
        continue;
      }
      if (phrase === 'go right' || phrase === 'turn right' || phrase === 'move right') {
        directions.push('RIGHT');
        i += 2;
        continue;
      }
    }

    // Check single word token / homophone / prefix / partial syllable
    const w = words[i];
    if (upSet.has(w) || w.startsWith('up') || w.startsWith('op')) {
      directions.push('UP');
    } else if (downSet.has(w) || w.startsWith('dow') || w.startsWith('don')) {
      directions.push('DOWN');
    } else if (leftSet.has(w) || w.startsWith('lef')) {
      directions.push('LEFT');
    } else if (rightSet.has(w) || w.startsWith('rig') || w.startsWith('ri') || w.startsWith('wri')) {
      directions.push('RIGHT');
    } else {
      // Programmatic distance / acoustic similarity fuzzy matching
      const fuzzyDir = matchFuzzyDirection(w);
      if (fuzzyDir) {
        directions.push(fuzzyDir);
      }
    }

    i++;
  }

  return directions;
}

/**
 * Utility function to parse single directional speech commands from transcripts.
 */
export function parseVoiceDirection(text: string): Direction | null {
  const dirs = extractVoiceDirections(text);
  return dirs.length > 0 ? dirs[0] : null;
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
  onEatTarget,
  onComplete,
}) => {
  // Lock initial game configuration at mount to ensure state isolation across parent re-renders
  const [initialConfig] = useState(() => ({
    numbers,
    mode,
  }));

  // Sort numbers according to objective mode synchronously with strict numeric sorting
  const sortedTargets = useMemo(() => {
    const copy = [...initialConfig.numbers];
    if (initialConfig.mode === 'ascending') {
      copy.sort((a, b) => a - b);
    } else {
      copy.sort((a, b) => b - a);
    }
    return copy;
  }, [initialConfig]);

  const initialSnake: Position[] = [
    { x: 8, y: 7 },
    { x: 8, y: 8 },
    { x: 8, y: 9 },
  ];

  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [direction, setDirection] = useState<Direction>('UP');
  const [gridNumbers, setGridNumbers] = useState<GridNumber[]>(() =>
    placeNumbersOnGrid(initialConfig.numbers, initialSnake)
  );
  const [currentTargetIndex, setCurrentTargetIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastBounceMessage, setLastBounceMessage] = useState<string | null>(null);

  const pendingDirectionRef = useRef<Direction>('UP');
  const currentDirectionRef = useRef<Direction>('UP');
  const snakeRef = useRef<Position[]>(snake);
  const processedCommandCountRef = useRef<number>(0);

  // Refs for continuous timer access without tearing down interval
  const sortedTargetsRef = useRef<number[]>(sortedTargets);
  sortedTargetsRef.current = sortedTargets;

  const gridNumbersRef = useRef<GridNumber[]>(gridNumbers);
  gridNumbersRef.current = gridNumbers;

  const currentTargetIndexRef = useRef<number>(currentTargetIndex);
  currentTargetIndexRef.current = currentTargetIndex;

  const isCompletedRef = useRef<boolean>(isCompleted);
  isCompletedRef.current = isCompleted;

  const onEatTargetRef = useRef(onEatTarget);
  onEatTargetRef.current = onEatTarget;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  currentDirectionRef.current = direction;
  snakeRef.current = snake;

  // Handle direction change request safely without swallowing 180-degree turns
  const changeDirection = useCallback((newDir: Direction) => {
    const current = currentDirectionRef.current;
    const isOpposite =
      (newDir === 'UP' && current === 'DOWN') ||
      (newDir === 'DOWN' && current === 'UP') ||
      (newDir === 'LEFT' && current === 'RIGHT') ||
      (newDir === 'RIGHT' && current === 'LEFT');

    if (isOpposite) {
      if (snakeRef.current.length <= 1) {
        pendingDirectionRef.current = newDir;
        setDirection(newDir);
      } else {
        // Gracefully steer orthogonal to avoid swallowing commands or crashing directly into neck
        const head = snakeRef.current[0];
        const bodySet = new Set(
          snakeRef.current.slice(1).map((s) => `${s.x},${s.y}`)
        );

        let candidate1: Direction;
        let candidate2: Direction;

        if (current === 'UP' || current === 'DOWN') {
          candidate1 = 'LEFT';
          candidate2 = 'RIGHT';
        } else {
          candidate1 = 'UP';
          candidate2 = 'DOWN';
        }

        const pos1 = getWrappedCoordinate(head, candidate1);
        const safe1 = !bodySet.has(`${pos1.x},${pos1.y}`);

        const orthogonalDir = safe1 ? candidate1 : candidate2;
        pendingDirectionRef.current = orthogonalDir;
        setDirection(orthogonalDir);
      }
    } else {
      pendingDirectionRef.current = newDir;
      setDirection(newDir);
    }
  }, []);

  // Voice command handling with tokenized delta evaluation
  useEffect(() => {
    const combined = `${transcript} ${interimTranscript}`.trim();
    if (!combined) {
      processedCommandCountRef.current = 0;
      return;
    }

    const commands = extractVoiceDirections(combined);

    if (commands.length < processedCommandCountRef.current) {
      processedCommandCountRef.current = 0;
    }

    if (commands.length > processedCommandCountRef.current) {
      for (let i = processedCommandCountRef.current; i < commands.length; i++) {
        changeDirection(commands[i]);
      }
      processedCommandCountRef.current = commands.length;
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

  // Continuous game tick interval
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      if (isCompletedRef.current) return;

      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const currentDir = pendingDirectionRef.current;
        const nextHead = getWrappedCoordinate(head, currentDir);

        // 1. Check self collision
        const isSelfCollision = prevSnake
          .slice(0, -1)
          .some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

        if (isSelfCollision) {
          playWrongSound();
          setLastBounceMessage('Oops! Self collision!');
          setTimeout(() => setLastBounceMessage(null), 1200);
          // Continuous non-stop movement: continue forward without freezing in place
          return [nextHead, ...prevSnake.slice(0, -1)];
        }

        // 2. Check number collision
        const currentGridNumbers = gridNumbersRef.current;
        const hitNumber = currentGridNumbers.find(
          (gn) => gn.x === nextHead.x && gn.y === nextHead.y
        );

        if (hitNumber) {
          const targetIndex = currentTargetIndexRef.current;
          const currentTargetVal = sortedTargetsRef.current[targetIndex];

          if (hitNumber.value === currentTargetVal) {
            // Correct Target Eaten!
            playCorrectChime();
            const newSnake = [nextHead, ...prevSnake]; // Snake grows by 1 segment

            // Remove eaten number from grid
            setGridNumbers((prev) => prev.filter((gn) => gn.id !== hitNumber.id));

            const nextIndex = targetIndex + 1;
            currentTargetIndexRef.current = nextIndex;
            setCurrentTargetIndex(nextIndex);

            if (onEatTargetRef.current) {
              onEatTargetRef.current(hitNumber.value, nextIndex);
            }

            if (nextIndex >= sortedTargetsRef.current.length) {
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
              if (onCompleteRef.current) {
                const cb = onCompleteRef.current;
                setTimeout(() => cb(), 1500);
              }
            }

            return newSnake;
          } else {
            // Wrong Number (Out of Order)!
            playWrongSound();
            setLastBounceMessage('Wrong order! Keep going!');
            setTimeout(() => setLastBounceMessage(null), 1500);
            // Continuous non-stop movement: pass through cell without eating number or stopping
            return [nextHead, ...prevSnake.slice(0, -1)];
          }
        }

        // 3. Normal Empty Cell Movement
        return [nextHead, ...prevSnake.slice(0, -1)];
      });
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [isCompleted]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Objective & Progress Header Display */}
      <div className="w-full bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-lg mb-4 text-center border-2 border-indigo-200">
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
            {mode === 'ascending' ? '📈 Eat from Least to Greatest' : '📉 Eat from Greatest to Least'}
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl font-black text-xs sm:text-sm">
            Eaten: {currentTargetIndex} / {sortedTargets.length}
          </div>
        </div>

        {lastBounceMessage && (
          <div className="mt-2 text-xs sm:text-sm font-extrabold text-amber-200 animate-bounce">
            ⚠️ {lastBounceMessage}
          </div>
        )}
      </div>

      {/* 16x16 Snake Grid Board */}
      <div className="relative bg-slate-900 rounded-2xl p-2.5 shadow-2xl border-4 border-indigo-500/30 overflow-hidden w-full aspect-square max-w-[500px]">
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
                  <div className="absolute inset-0.5 rounded-lg flex items-center justify-center text-sm sm:text-base md:text-lg font-black shadow-md transition-transform duration-200 bg-indigo-600 text-white opacity-90">
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
