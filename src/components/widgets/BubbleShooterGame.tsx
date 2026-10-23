import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, Zap, Sparkles } from 'lucide-react';
import type { BubbleShooterProps } from '../../types/quiz';
import { playCorrectChime, playWrongSound } from '../../utils/audioSynthesizer';

export interface BubbleShooterGameProps extends BubbleShooterProps {
  transcript?: string;
  interimTranscript?: string;
  onComplete?: () => void;
  targetTriplesCount?: number;
  onTripleMatched?: () => void;
}

export interface HexCoord {
  r: number; // row: 0 to NUM_ROWS - 1
  c: number; // col: 0 to 5 (even rows) or 0 to 4 (odd rows)
}

export interface BubbleNode {
  id: string;
  r: number;
  c: number;
  value: number;
}

export const NUM_ROWS = 8;
export const EVEN_COLS = 6;
export const ODD_COLS = 5;
export const TARGET_TRIPLES = 5;

/**
 * Calculate Levenshtein distance for fuzzy phonetic matching.
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
 * Get valid neighbor coordinates for a cell (r, c) on alternating 6/5 hex grid.
 */
export function getHexNeighbors(r: number, c: number): HexCoord[] {
  const isEven = r % 2 === 0;
  const maxCols = isEven ? EVEN_COLS : ODD_COLS;

  if (r < 0 || r >= NUM_ROWS || c < 0 || c >= maxCols) {
    return [];
  }

  const candidates: HexCoord[] = [];

  // Same row: left and right
  if (c > 0) candidates.push({ r, c: c - 1 });
  if (c < maxCols - 1) candidates.push({ r, c: c + 1 });

  // Adjacent rows (top: r - 1, bottom: r + 1)
  const adjRows = [r - 1, r + 1].filter((row) => row >= 0 && row < NUM_ROWS);

  for (const adjR of adjRows) {
    if (isEven) {
      // Even row (6 cols) connects to Odd row (5 cols):
      // (r, c) connects to (adjR, c - 1) and (adjR, c)
      if (c - 1 >= 0) candidates.push({ r: adjR, c: c - 1 });
      if (c < ODD_COLS) candidates.push({ r: adjR, c });
    } else {
      // Odd row (5 cols) connects to Even row (6 cols):
      // (r, c) connects to (adjR, c) and (adjR, c + 1)
      if (c < EVEN_COLS) candidates.push({ r: adjR, c });
      if (c + 1 < EVEN_COLS) candidates.push({ r: adjR, c: c + 1 });
    }
  }

  return candidates;
}

/**
 * String key for hex coordinate.
 */
export function coordKey(r: number, c: number): string {
  return `${r},${c}`;
}

/**
 * Check if 3 numbers satisfy n1 + n2 === n3 when sorted ascending.
 */
export function isValidSumTriple(v1: number, v2: number, v3: number): boolean {
  const [n1, n2, n3] = [v1, v2, v3].sort((a, b) => a - b);
  return n1 + n2 === n3;
}

/**
 * Find all triangles of 3 mutually adjacent bubbles on the grid that contain target (r, c).
 */
export function findTrianglesContaining(
  board: Map<string, BubbleNode>,
  targetR: number,
  targetC: number
): { coords: HexCoord[]; values: number[] }[] {
  const targetKey = coordKey(targetR, targetC);
  const targetNode = board.get(targetKey);
  if (!targetNode) return [];

  const neighbors = getHexNeighbors(targetR, targetC);
  const occupiedNeighbors = neighbors.filter((n) => board.has(coordKey(n.r, n.c)));

  const triangles: { coords: HexCoord[]; values: number[] }[] = [];

  for (let i = 0; i < occupiedNeighbors.length; i++) {
    for (let j = i + 1; j < occupiedNeighbors.length; j++) {
      const n1 = occupiedNeighbors[i];
      const n2 = occupiedNeighbors[j];

      // Check if n1 and n2 are adjacent to each other
      const n1Neighbors = getHexNeighbors(n1.r, n1.c);
      const isMutuallyAdjacent = n1Neighbors.some((n) => n.r === n2.r && n.c === n2.c);

      if (isMutuallyAdjacent) {
        const node1 = board.get(coordKey(n1.r, n1.c))!;
        const node2 = board.get(coordKey(n2.r, n2.c))!;
        triangles.push({
          coords: [
            { r: targetR, c: targetC },
            { r: n1.r, c: n1.c },
            { r: n2.r, c: n2.c },
          ],
          values: [targetNode.value, node1.value, node2.value],
        });
      }
    }
  }

  return triangles;
}

/**
 * Check if entire board contains any sum triples.
 */
export function hasAnySumTriple(board: Map<string, BubbleNode>): boolean {
  for (const node of board.values()) {
    const triangles = findTrianglesContaining(board, node.r, node.c);
    for (const tri of triangles) {
      if (isValidSumTriple(tri.values[0], tri.values[1], tri.values[2])) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Find floating bubbles not attached to top row (r = 0).
 */
export function findFloatingBubbles(board: Map<string, BubbleNode>): HexCoord[] {
  const visited = new Set<string>();
  const queue: HexCoord[] = [];

  // Start BFS from all occupied nodes in Row 0
  for (let c = 0; c < EVEN_COLS; c++) {
    const key = coordKey(0, c);
    if (board.has(key)) {
      visited.add(key);
      queue.push({ r: 0, c });
    }
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = getHexNeighbors(curr.r, curr.c);
    for (const n of neighbors) {
      const key = coordKey(n.r, n.c);
      if (board.has(key) && !visited.has(key)) {
        visited.add(key);
        queue.push(n);
      }
    }
  }

  const floating: HexCoord[] = [];
  for (const node of board.values()) {
    const key = coordKey(node.r, node.c);
    if (!visited.has(key)) {
      floating.push({ r: node.r, c: node.c });
    }
  }

  return floating;
}

/**
 * Find all valid open hex target positions where a shot bubble can land.
 */
export function getCandidateOpenPositions(board: Map<string, BubbleNode>): HexCoord[] {
  if (board.size === 0) {
    // Top row open slots
    return Array.from({ length: EVEN_COLS }, (_, c) => ({ r: 0, c }));
  }

  const candidatesSet = new Set<string>();
  for (const node of board.values()) {
    const neighbors = getHexNeighbors(node.r, node.c);
    for (const n of neighbors) {
      const key = coordKey(n.r, n.c);
      if (!board.has(key)) {
        candidatesSet.add(key);
      }
    }
  }

  const candidates: HexCoord[] = Array.from(candidatesSet).map((key) => {
    const [r, c] = key.split(',').map(Number);
    return { r, c };
  });

  // Sort candidate hex positions visually from left to right, then top to bottom
  candidates.sort((a, b) => {
    const isAEven = a.r % 2 === 0;
    const isBEven = b.r % 2 === 0;
    const aX = a.c + (isAEven ? 0 : 0.5);
    const bX = b.c + (isBEven ? 0 : 0.5);

    if (Math.abs(aX - bX) > 0.01) return aX - bX;
    return a.r - b.r;
  });

  return candidates;
}

/**
 * Calculate SVG ViewBox coordinates for hex cell centers.
 */
export function getHexCenterSvgCoords(r: number, c: number): { x: number; y: number } {
  const isEven = r % 2 === 0;
  const x = isEven ? 60 + c * 76 : 98 + c * 76;
  const y = 36 + r * 40;
  return { x, y };
}

/**
 * Generate initial pre-filled board (Row 0: 6, Row 1: 5, Row 2: 6 = 17 bubbles)
 * ensuring strictly integers 1..10 and NO pre-existing triples.
 */
export function createInitialBoard(): Map<string, BubbleNode> {
  let board = new Map<string, BubbleNode>();
  let attempts = 0;

  while (attempts < 200) {
    attempts++;
    board.clear();

    const fillRow = (r: number, cols: number) => {
      for (let c = 0; c < cols; c++) {
        const val = Math.floor(Math.random() * 10) + 1; // 1..10
        const id = `initial-${r}-${c}`;
        board.set(coordKey(r, c), { id, r, c, value: val });
      }
    };

    fillRow(0, EVEN_COLS);
    fillRow(1, ODD_COLS);
    fillRow(2, EVEN_COLS);

    if (!hasAnySumTriple(board)) {
      return board;
    }
  }

  // Fallback: guaranteed safe initial board without sum triples
  board.clear();
  const safeVals = [
    [1, 1, 1, 1, 1, 1], // Row 0: 1+1!=1
    [1, 1, 1, 1, 1],    // Row 1
    [1, 1, 1, 1, 1, 1], // Row 2
  ];

  safeVals[0].forEach((v, c) => board.set(coordKey(0, c), { id: `s-0-${c}`, r: 0, c, value: v }));
  safeVals[1].forEach((v, c) => board.set(coordKey(1, c), { id: `s-1-${c}`, r: 1, c, value: v }));
  safeVals[2].forEach((v, c) => board.set(coordKey(2, c), { id: `s-2-${c}`, r: 2, c, value: v }));

  return board;
}

/**
 * Tokenize speech transcript string into individual word / character tokens.
 */
export function tokenizeTranscript(text: string): string[] {
  if (!text) return [];
  const normalized = text.toLowerCase().trim();
  if (!normalized) return [];

  // Match CJK characters individually or words separated by whitespace/punctuation
  const rawTokens = normalized.split(/[\s,.\-!_?]+/).filter(Boolean);
  const result: string[] = [];

  for (const raw of rawTokens) {
    if (/[\u4e00-\u9fa5]/.test(raw)) {
      if (raw === '向左' || raw === '向右' || raw === '发射' || raw === '开火' || raw === 'kaihuo') {
        result.push(raw);
      } else {
        for (const char of raw) {
          result.push(char);
        }
      }
    } else {
      result.push(raw);
    }
  }

  return result;
}

/**
 * Parse a single word token for aiming / shooting actions.
 */
export function parseSingleToken(token: string): 'LEFT' | 'RIGHT' | 'FIRE' | null {
  if (!token) return null;
  const normalized = token.toLowerCase().trim();

  // Chinese & pinyin matches
  if (normalized === '向左' || normalized === '左' || normalized === 'zuo') return 'LEFT';
  if (normalized === '向右' || normalized === '右' || normalized === 'you' || normalized === 'yau') return 'RIGHT';
  if (
    normalized === '发射' ||
    normalized === '开火' ||
    normalized === 'kaihuo' ||
    normalized === 'fa'
  ) return 'FIRE';

  const leftKeywords = new Set(['left', 'laugh', 'lift', 'let', 'l', 'lef']);
  const rightKeywords = new Set([
    'right',
    'light',
    'write',
    'rite',
    'rot',
    'white',
    'ride',
    'r',
    'rig',
  ]);
  const fireKeywords = new Set([
    'shoot',
    'fire',
    'shot',
    'chute',
    'shute',
    'shoo',
    'go',
    'launch',
    'bang',
  ]);

  if (leftKeywords.has(normalized)) return 'LEFT';
  if (rightKeywords.has(normalized)) return 'RIGHT';
  if (fireKeywords.has(normalized)) return 'FIRE';

  if (normalized.length >= 3) {
    if (levenshteinDistance(normalized, 'left') <= 1) return 'LEFT';
    if (levenshteinDistance(normalized, 'right') <= 1) return 'RIGHT';
    if (levenshteinDistance(normalized, 'shoot') <= 1) return 'FIRE';
    if (normalized !== 'free' && levenshteinDistance(normalized, 'fire') <= 1) return 'FIRE';
    if (levenshteinDistance(normalized, 'shot') <= 1) return 'FIRE';
  }

  return null;
}

/**
 * Extract all voice action commands sequentially from transcript text.
 */
export function extractVoiceCommands(text: string): ('LEFT' | 'RIGHT' | 'FIRE')[] {
  if (!text) return [];
  const tokens = tokenizeTranscript(text);
  const commands: ('LEFT' | 'RIGHT' | 'FIRE')[] = [];

  for (const token of tokens) {
    const action = parseSingleToken(token);
    if (action) {
      commands.push(action);
    }
  }

  return commands;
}

/**
 * Parse verbal voice commands with phonetic fuzzy matching and homophones tolerance.
 */
export function parseVoiceAction(text: string): 'LEFT' | 'RIGHT' | 'FIRE' | null {
  if (!text) return null;
  const commands = extractVoiceCommands(text);
  return commands.length > 0 ? commands[commands.length - 1] : null;
}

export const BubbleShooterGame: React.FC<BubbleShooterGameProps> = ({
  transcript = '',
  interimTranscript = '',
  onComplete,
  targetTriplesCount = TARGET_TRIPLES,
  onTripleMatched,
}) => {
  const [board, setBoard] = useState<Map<string, BubbleNode>>(() => createInitialBoard());
  const [clearedTriples, setClearedTriples] = useState<number>(0);
  const [nextBubbleValue, setNextBubbleValue] = useState<number>(() => Math.floor(Math.random() * 10) + 1);
  const [aimIndex, setAimIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const processedCommandCountRef = useRef<number>(0);
  const boardRef = useRef(board);
  boardRef.current = board;

  const aimIndexRef = useRef(aimIndex);
  aimIndexRef.current = aimIndex;

  const isCompletedRef = useRef(isCompleted);
  isCompletedRef.current = isCompleted;

  const nextBubbleValueRef = useRef(nextBubbleValue);
  nextBubbleValueRef.current = nextBubbleValue;

  const targetTriplesCountRef = useRef(targetTriplesCount);
  targetTriplesCountRef.current = targetTriplesCount;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const onTripleMatchedRef = useRef(onTripleMatched);
  onTripleMatchedRef.current = onTripleMatched;

  const candidatePositions = useMemo(() => getCandidateOpenPositions(board), [board]);
  const candidatePositionsRef = useRef(candidatePositions);
  candidatePositionsRef.current = candidatePositions;

  // Keep aim index bounded when candidate positions change
  useEffect(() => {
    if (candidatePositions.length > 0 && aimIndex >= candidatePositions.length) {
      const bounded = candidatePositions.length - 1;
      setAimIndex(bounded);
      aimIndexRef.current = bounded;
    }
  }, [candidatePositions, aimIndex]);

  const handleAimLeft = useCallback(() => {
    setAimIndex((prev) => {
      const next = Math.max(0, prev - 1);
      aimIndexRef.current = next;
      return next;
    });
  }, []);

  const handleAimRight = useCallback(() => {
    setAimIndex((prev) => {
      const maxIdx = Math.max(0, candidatePositionsRef.current.length - 1);
      const next = Math.min(maxIdx, prev + 1);
      aimIndexRef.current = next;
      return next;
    });
  }, []);

  const handleShoot = useCallback(() => {
    if (isCompletedRef.current || candidatePositionsRef.current.length === 0) return;

    const currentAimIndex = aimIndexRef.current;
    const targetPos = candidatePositionsRef.current[currentAimIndex] || candidatePositionsRef.current[0];
    if (!targetPos) return;

    const currentVal = nextBubbleValueRef.current;
    const newBubble: BubbleNode = {
      id: `bubble-${Date.now()}`,
      r: targetPos.r,
      c: targetPos.c,
      value: currentVal,
    };

    const newBoard = new Map(boardRef.current);
    newBoard.set(coordKey(targetPos.r, targetPos.c), newBubble);

    // Check for matching triples containing the newly snapped bubble
    const triangles = findTrianglesContaining(newBoard, targetPos.r, targetPos.c);
    const matchedTriangles = triangles.filter((tri) =>
      isValidSumTriple(tri.values[0], tri.values[1], tri.values[2])
    );

    if (matchedTriangles.length > 0) {
      playCorrectChime();
      const popCoordsSet = new Set<string>();
      matchedTriangles.forEach((tri) => {
        tri.coords.forEach((c) => popCoordsSet.add(coordKey(c.r, c.c)));
      });

      // Pop matched bubbles
      popCoordsSet.forEach((key) => newBoard.delete(key));

      // Gravity / Floating check: drop unanchored bubbles
      const floatingCoords = findFloatingBubbles(newBoard);
      floatingCoords.forEach((c) => newBoard.delete(coordKey(c.r, c.c)));

      const triplesMatchedCount = matchedTriangles.length;
      for (let i = 0; i < triplesMatchedCount; i++) {
        onTripleMatchedRef.current?.();
      }

      setClearedTriples((prev) => {
        const nextTotal = prev + triplesMatchedCount;
        if (nextTotal >= targetTriplesCountRef.current || newBoard.size === 0) {
          setIsCompleted(true);
          isCompletedRef.current = true;
          try {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          } catch {
            // Ignore if confetti unavailable in test env
          }
          setTimeout(() => onCompleteRef.current?.(), 1500);
        }
        return nextTotal;
      });

      setFeedbackMsg(`💥 Number Fact Matched! (+${triplesMatchedCount})`);
      setTimeout(() => setFeedbackMsg(null), 1500);
    } else {
      playWrongSound();
    }

    setBoard(newBoard);
    // Generate next bubble value 1..10
    const nextVal = Math.floor(Math.random() * 10) + 1;
    setNextBubbleValue(nextVal);
    nextBubbleValueRef.current = nextVal;
  }, []);

  // Voice transcript control handler (word-by-word instant processing)
  useEffect(() => {
    const combined = `${transcript} ${interimTranscript}`.trim();
    if (!combined) {
      processedCommandCountRef.current = 0;
      return;
    }

    const commands = extractVoiceCommands(combined);

    if (commands.length < processedCommandCountRef.current) {
      processedCommandCountRef.current = commands.length;
    }

    if (commands.length > processedCommandCountRef.current) {
      for (let i = processedCommandCountRef.current; i < commands.length; i++) {
        const action = commands[i];
        if (action === 'LEFT') handleAimLeft();
        else if (action === 'RIGHT') handleAimRight();
        else if (action === 'FIRE') handleShoot();
      }
      processedCommandCountRef.current = commands.length;
    }
  }, [transcript, interimTranscript, handleAimLeft, handleAimRight, handleShoot]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleAimLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleAimRight();
          break;
        case 'ArrowUp':
        case ' ':
        case 'Enter':
        case 'w':
        case 'W':
          e.preventDefault();
          handleShoot();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAimLeft, handleAimRight, handleShoot]);

  const currentTargetPos = candidatePositions[aimIndex];

  // SVG Cannon and Trajectory calculation
  const cannonX = 250;
  const cannonY = 430;
  const targetCoords = currentTargetPos ? getHexCenterSvgCoords(currentTargetPos.r, currentTargetPos.c) : null;

  let gunRotationDeg = 0;
  let nozzleX = cannonX;
  let nozzleY = cannonY - 58;

  if (targetCoords) {
    const dx = targetCoords.x - cannonX;
    const dy = targetCoords.y - cannonY;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = angleRad * (180 / Math.PI);
    gunRotationDeg = angleDeg + 90;

    const nozzleLen = 58;
    nozzleX = cannonX + nozzleLen * Math.cos(angleRad);
    nozzleY = cannonY + nozzleLen * Math.sin(angleRad);
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Objective & Progress Banner */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 text-white shadow-lg mb-4 text-center border-2 border-indigo-200">
        <div className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl font-black text-xs sm:text-sm">
            Triples Cleared: {clearedTriples} / {targetTriplesCount}
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-2 text-xs sm:text-sm font-extrabold text-amber-200 animate-bounce">
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* Hex Grid Board Area & SVG Cannon Overlay */}
      <div className="relative bg-slate-900 rounded-2xl p-4 shadow-2xl border-4 border-indigo-500/30 overflow-hidden w-full max-w-[500px] pb-20">
        {/* SVG Overlay for Laser Trajectory Line & Rotating Cannon */}
        <svg
          viewBox="0 0 500 480"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          data-testid="bubble-cannon-svg"
        >
          <defs>
            <style>{`
              @keyframes laserDash {
                0% { stroke-dashoffset: 28; }
                100% { stroke-dashoffset: 0; }
              }
              .animate-laser-dash {
                animation: laserDash 0.8s linear infinite;
              }
            `}</style>
            <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="cannon-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="bubble-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>

          {targetCoords && (
            <g data-testid="laser-aim-line">
              {/* Outer Laser Glow Trajectory */}
              <line
                x1={nozzleX}
                y1={nozzleY}
                x2={targetCoords.x}
                y2={targetCoords.y}
                stroke="#fbbf24"
                strokeWidth="8"
                strokeOpacity="0.3"
                strokeDasharray="8 6"
                filter="url(#laser-glow)"
              />
              {/* Animated Laser Dotted Trajectory Line */}
              <line
                x1={nozzleX}
                y1={nozzleY}
                x2={targetCoords.x}
                y2={targetCoords.y}
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-laser-dash"
              />
              {/* Destination Hex Highlight Ring */}
              <circle
                cx={targetCoords.x}
                cy={targetCoords.y}
                r="22"
                fill="rgba(251, 191, 36, 0.25)"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeDasharray="4 4"
                className="animate-pulse"
                data-testid="destination-hex-highlight"
              />
            </g>
          )}

          {/* Rotating Bubble Gun / Cannon Body & Nozzle */}
          <g transform={`translate(${cannonX}, ${cannonY})`} data-testid="bubble-cannon-gun">
            {/* Cannon Pedestal Base */}
            <path
              d="M -30 20 C -30 0, 30 0, 30 20 Z"
              fill="url(#cannon-metal)"
              stroke="#475569"
              strokeWidth="2"
            />
            <circle cx="0" cy="15" r="28" fill="#1e293b" stroke="#6366f1" strokeWidth="3" />

            {/* Rotating Gun Barrel */}
            <g transform={`rotate(${gunRotationDeg})`} data-testid="cannon-barrel-rotator">
              {/* Barrel Housing */}
              <rect
                x="-25"
                y="-56"
                width="50"
                height="56"
                rx="8"
                fill="#334155"
                stroke="#818cf8"
                strokeWidth="2"
              />
              {/* Nozzle Rim */}
              <rect
                x="-27"
                y="-62"
                width="54"
                height="10"
                rx="4"
                fill="#475569"
                stroke="#c084fc"
                strokeWidth="2"
              />
              {/* Active Projectile Bubble Loaded inside Nozzle */}
              <circle
                cx="0"
                cy="-30"
                r="22"
                fill="url(#bubble-gradient)"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x="0"
                y="-23"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="20"
                fontWeight="900"
              >
                {nextBubbleValue}
              </text>
            </g>
          </g>
        </svg>

        <div className="flex flex-col gap-2 items-center relative z-0">
          {Array.from({ length: NUM_ROWS }).map((_, r) => {
            const isEven = r % 2 === 0;
            const colsCount = isEven ? EVEN_COLS : ODD_COLS;

            return (
              <div
                key={`row-${r}`}
                className={`flex gap-2 justify-center ${
                  isEven ? 'w-full' : 'w-[90%]'
                }`}
              >
                {Array.from({ length: colsCount }).map((_, c) => {
                  const key = coordKey(r, c);
                  const node = board.get(key);
                  const isTarget =
                    currentTargetPos &&
                    currentTargetPos.r === r &&
                    currentTargetPos.c === c;

                  return (
                    <div
                      key={key}
                      data-testid={`hex-cell-${r}-${c}`}
                      className={`relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-black text-base sm:text-lg transition-all duration-200 ${
                        node
                          ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md border-2 border-indigo-300 scale-100'
                          : isTarget
                          ? 'bg-amber-400/30 border-2 border-dashed border-amber-400 text-amber-300 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                          : 'bg-slate-800/40 border border-slate-700/50'
                      }`}
                    >
                      {node ? node.value : isTarget ? '?' : ''}
                    </div>
                  );
                })}
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
              You cleared {clearedTriples} number fact triples!
            </p>
          </div>
        )}
      </div>

      {/* Shooter Launcher & Aim Controls */}
      <div className="mt-4 w-full flex flex-col items-center gap-3">
        {/* Next Shooter Bubble Preview */}
        <div className="flex items-center gap-3 bg-slate-800 text-white px-5 py-2.5 rounded-2xl border-2 border-indigo-400 shadow-lg">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
            Next Bubble:
          </span>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-lg flex items-center justify-center border-2 border-white shadow-md animate-bounce">
            {nextBubbleValue}
          </div>
        </div>

        {/* Interactive Controls (Left / Shoot / Right) */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleAimLeft}
            aria-label="Aim Left"
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-2xl flex items-center gap-1 shadow-md border-b-4 border-indigo-900 cursor-pointer transition-transform active:scale-95"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Left</span>
          </button>

          <button
            type="button"
            onClick={handleShoot}
            aria-label="Shoot Bubble"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black text-lg rounded-2xl flex items-center gap-2 shadow-lg border-b-4 border-emerald-800 cursor-pointer transition-transform active:scale-95"
          >
            <Zap size={22} className="fill-current" />
            <span>SHOOT</span>
          </button>

          <button
            type="button"
            onClick={handleAimRight}
            aria-label="Aim Right"
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-2xl flex items-center gap-1 shadow-md border-b-4 border-indigo-900 cursor-pointer transition-transform active:scale-95"
          >
            <span className="hidden sm:inline">Right</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
