import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight, ArrowDownCircle, Sparkles } from 'lucide-react';
import type { PlinkoProps } from '../../types/quiz';
import { playCorrectChime, playClickSound } from '../../utils/audioSynthesizer';

export interface PlinkoBonusGameProps extends PlinkoProps {
  transcript?: string;
  interimTranscript?: string;
  onComplete?: (wellNumber: number) => void;
}

export type PlinkoVoiceCommand = 'LEFT' | 'RIGHT' | 'DROP';

const BOARD_WIDTH = 400;
const BOARD_HEIGHT = 500;
const DROP_SLOTS_COUNT = 5;
const BALL_RADIUS = 15;
const PEG_RADIUS = 6;
const WELL_COUNT = 9;

function shuffleWellNumbers(): number[] {
  const wells = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = wells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wells[i], wells[j]] = [wells[j], wells[i]];
  }
  return wells;
}

// Calculate drop slot X coordinates
const SLOT_PADDING = 50;
const SLOT_SPACING = (BOARD_WIDTH - 2 * SLOT_PADDING) / (DROP_SLOTS_COUNT - 1);
const DROP_SLOT_X = Array.from({ length: DROP_SLOTS_COUNT }, (_, i) => SLOT_PADDING + i * SLOT_SPACING);

interface Peg {
  id: string;
  x: number;
  y: number;
}

// Generate staggered peg grid layout
function generatePegs(): Peg[] {
  const pegs: Peg[] = [];
  const rows = 8;
  const startY = 100;
  const rowHeight = 40;

  for (let r = 0; r < rows; r++) {
    const y = startY + r * rowHeight;
    const isEven = r % 2 === 0;
    const count = isEven ? 7 : 6;
    const padding = isEven ? 50 : 75;
    const spacing = (BOARD_WIDTH - 2 * padding) / (count - 1);

    for (let c = 0; c < count; c++) {
      const x = padding + c * spacing;
      pegs.push({
        id: `peg-${r}-${c}`,
        x,
        y,
      });
    }
  }

  return pegs;
}

const PEGS = generatePegs();

/**
 * Tokenize voice transcripts into Plinko commands ('LEFT', 'RIGHT', 'DROP').
 */
export function extractPlinkoVoiceCommands(text: string): PlinkoVoiceCommand[] {
  if (!text) return [];

  let normalized = text.toLowerCase().trim();

  // Handle Chinese voice equivalents
  normalized = normalized
    .replace(/向左/g, ' left ')
    .replace(/左/g, ' left ')
    .replace(/向右/g, ' right ')
    .replace(/右/g, ' right ')
    .replace(/放下/g, ' drop ')
    .replace(/掉落/g, ' drop ')
    .replace(/下/g, ' drop ')
    .replace(/落/g, ' drop ');

  const words = normalized.split(/[\s,.!?;:]+/).filter(Boolean);
  const commands: PlinkoVoiceCommand[] = [];

  const leftSet = new Set(['left', 'lef', 'l', 'zuo', 'west', 'move left']);
  const rightSet = new Set(['right', 'rig', 'r', 'you', 'east', 'move right']);
  const dropSet = new Set(['drop', 'fall', 'release', 'down', 'go', 'start', 'luo', 'xia']);

  let i = 0;
  while (i < words.length) {
    const w = words[i];

    if (leftSet.has(w) || w.startsWith('lef')) {
      commands.push('LEFT');
    } else if (rightSet.has(w) || w.startsWith('rig') || w.startsWith('you')) {
      commands.push('RIGHT');
    } else if (dropSet.has(w) || w.startsWith('dro') || w.startsWith('fal') || w.startsWith('rel')) {
      commands.push('DROP');
    }

    i++;
  }

  return commands;
}

export const PlinkoBonusGame: React.FC<PlinkoBonusGameProps> = ({
  transcript = '',
  interimTranscript = '',
  onComplete,
}) => {
  const [wellNumbers, setWellNumbers] = useState<number[]>(() => shuffleWellNumbers());
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(2); // Center slot (0..4)
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);
  const [hitPegs, setHitPegs] = useState<Record<string, number>>({});
  const [landedWell, setLandedWell] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const processedCommandCountRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const wellNumbersRef = useRef(wellNumbers);
  wellNumbersRef.current = wellNumbers;

  // Physics state refs to avoid stale closure in requestAnimationFrame loop
  const ballPhysicsRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
  }>({ x: 0, y: 0, vx: 0, vy: 0 });

  const moveSlotLeft = useCallback(() => {
    if (isDropping) return;
    playClickSound();
    setSelectedSlotIndex((prev) => Math.max(0, prev - 1));
  }, [isDropping]);

  const moveSlotRight = useCallback(() => {
    if (isDropping) return;
    playClickSound();
    setSelectedSlotIndex((prev) => Math.min(DROP_SLOTS_COUNT - 1, prev + 1));
  }, [isDropping]);

  const dropBall = useCallback(() => {
    if (isDropping) return;
    playClickSound();

    if (isFinished) {
      setIsFinished(false);
      setLandedWell(null);
      const newWells = shuffleWellNumbers();
      setWellNumbers(newWells);
      wellNumbersRef.current = newWells;
    }

    setIsDropping(true);

    const startX = DROP_SLOT_X[selectedSlotIndex];
    const startY = 30;

    // Slowed initial velocities (50% scale reduction)
    const initialVx = (Math.random() - 0.5) * 0.6;
    const initialVy = 0.5;

    ballPhysicsRef.current = {
      x: startX,
      y: startY,
      vx: initialVx,
      vy: initialVy,
    };

    setBallPos({ x: startX, y: startY });
  }, [isDropping, isFinished, selectedSlotIndex]);

  // Handle voice commands
  useEffect(() => {
    const combined = `${transcript} ${interimTranscript}`.trim();
    if (!combined) {
      processedCommandCountRef.current = 0;
      return;
    }

    const commands = extractPlinkoVoiceCommands(combined);

    if (commands.length < processedCommandCountRef.current) {
      processedCommandCountRef.current = 0;
    }

    if (commands.length > processedCommandCountRef.current) {
      for (let i = processedCommandCountRef.current; i < commands.length; i++) {
        const cmd = commands[i];
        if (cmd === 'LEFT') {
          moveSlotLeft();
        } else if (cmd === 'RIGHT') {
          moveSlotRight();
        } else if (cmd === 'DROP') {
          dropBall();
        }
      }
      processedCommandCountRef.current = commands.length;
    }
  }, [transcript, interimTranscript, moveSlotLeft, moveSlotRight, dropBall]);

  // Main 2D Physics Animation Loop
  useEffect(() => {
    if (!isDropping || isFinished) return;

    // Slowed gravity (50% reduction: 0.16)
    const gravity = 0.16;
    const restitution = 0.65;
    const friction = 0.985;
    const wellY = 440;

    let lastTime = performance.now();

    const updatePhysics = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2.0); // normalize dt to 60fps
      lastTime = time;

      const p = ballPhysicsRef.current;

      // Apply gravity & friction
      p.vy += gravity * dt;
      p.vx *= Math.pow(friction, dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Wall collisions (left/right bounds)
      const leftBound = BALL_RADIUS + 4;
      const rightBound = BOARD_WIDTH - BALL_RADIUS - 4;

      if (p.x < leftBound) {
        p.x = leftBound;
        p.vx = -p.vx * restitution;
        if (Math.abs(p.vx) < 0.2) p.vx = 0.4;
      } else if (p.x > rightBound) {
        p.x = rightBound;
        p.vx = -p.vx * restitution;
        if (Math.abs(p.vx) < 0.2) p.vx = -0.4;
      }

      // Anti-jamming / unsticking measure: nudge downward & deflect horizontally if downward speed stalls near zero while dropping
      if (p.y > 60 && p.y < wellY && Math.abs(p.vy) < 0.2) {
        p.vy += 0.3 * dt;
        const deflectionDir = p.x < BOARD_WIDTH / 2 ? 1 : -1;
        p.vx += (Math.random() * 0.4 + 0.2) * deflectionDir * dt;
      }

      // Check collisions against pegs
      PEGS.forEach((peg) => {
        const dx = p.x - peg.x;
        const dy = p.y - peg.y;
        const distSq = dx * dx + dy * dy;
        const minDist = BALL_RADIUS + PEG_RADIUS;

        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq) || 0.001;
          const nx = dx / dist; // Normal vector x
          const ny = dy / dist; // Normal vector y

          // Separate ball from peg
          const overlap = minDist - dist;
          p.x += nx * overlap;
          p.y += ny * overlap;

          // Dot product of velocity and normal vector
          const dot = p.vx * nx + p.vy * ny;

          if (dot < 0) {
            // Reflect velocity along normal with restitution & small randomized bounce deflection (50% scale)
            const bounceRand = (Math.random() - 0.5) * 0.4;
            p.vx = (p.vx - (1 + restitution) * dot * nx) + bounceRand;
            p.vy = (p.vy - (1 + restitution) * dot * ny) + Math.abs(bounceRand) * 0.2;
          }

          // Register peg collision flash
          setHitPegs((prev) => ({ ...prev, [peg.id]: Date.now() }));
        }
      });

      // Check bottom well landing
      if (p.y >= wellY) {
        // Calculate well index and look up randomized well number
        const wellWidth = BOARD_WIDTH / WELL_COUNT;
        let wellIndex = Math.floor(p.x / wellWidth);
        wellIndex = Math.max(0, Math.min(WELL_COUNT - 1, wellIndex));
        const currentWellNumbers = wellNumbersRef.current;
        const wellNumber = currentWellNumbers[wellIndex] ?? (wellIndex + 1);

        // Lock position in well center
        p.y = wellY + 20;
        p.vx = 0;
        p.vy = 0;

        setBallPos({ x: p.x, y: p.y });
        setLandedWell(wellNumber);
        setIsFinished(true);

        playCorrectChime();

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.7 },
          });
        } catch {
          // Vitest env guard
        }

        setTimeout(() => {
          if (onCompleteRef.current) {
            onCompleteRef.current(wellNumber);
          }
        }, 1200);

        return;
      }

      setBallPos({ x: p.x, y: p.y });
      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isDropping, isFinished]);

  const wellWidth = BOARD_WIDTH / WELL_COUNT;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none">
      {/* Plinko Game Header Banner */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-3 text-white shadow-lg mb-3 text-center border-2 border-indigo-200">
        <div className="flex items-center justify-between px-2">
          <span className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
            <Sparkles size={18} className="text-amber-300 animate-spin" />
            🎯 Plinko Number Bond Bonus!
          </span>
          <span className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold">
            Drop ball to pick next question!
          </span>
        </div>
      </div>

      {/* Main Interactive Plinko Board */}
      <div className="relative bg-slate-900 rounded-3xl p-3 shadow-2xl border-4 border-indigo-500/40 overflow-hidden w-full max-w-[400px]">
        {/* Top Drop Slot Selector & Indicators */}
        <div className="w-full h-12 relative flex items-center mb-1">
          {DROP_SLOT_X.map((xPos, idx) => {
            const isSelected = selectedSlotIndex === idx && !isDropping;
            const isLeftOfSelected = idx < selectedSlotIndex;
            return (
              <button
                key={`slot-${idx}`}
                type="button"
                aria-label={`Drop Slot ${idx + 1}`}
                onClick={() => {
                  if (!isDropping) {
                    playClickSound();
                    setSelectedSlotIndex(idx);
                  }
                }}
                disabled={isDropping}
                style={{ left: `${xPos}px`, transform: 'translateX(-50%)' }}
                className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 border-white text-slate-900 scale-125 shadow-lg shadow-amber-400/50 ring-2 ring-amber-300 animate-bounce'
                    : isDropping
                    ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-900/80 border-indigo-400 text-indigo-200 hover:bg-indigo-700 hover:scale-110'
                }`}
              >
                {isSelected ? (
                  <ArrowDownCircle size={18} className="text-slate-900 animate-pulse" />
                ) : isLeftOfSelected ? (
                  <ChevronLeft size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            );
          })}
        </div>

        {/* SVG Plinko Physics Board */}
        <div className="w-full aspect-[4/5] relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
          <svg viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} className="w-full h-full">
            <defs>
              {/* Ball Gradient */}
              <radialGradient id="ballGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </radialGradient>

              {/* Peg Highlight Glow */}
              <filter id="pegGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Well Separator Walls at Bottom */}
            {Array.from({ length: WELL_COUNT - 1 }).map((_, idx) => {
              const wallX = (idx + 1) * wellWidth;
              return (
                <line
                  key={`wall-${idx}`}
                  x1={wallX}
                  y1={420}
                  x2={wallX}
                  y2={BOARD_HEIGHT}
                  stroke="#475569"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Staggered Peg Obstacle Array */}
            {PEGS.map((peg) => {
              const hitTime = hitPegs[peg.id];
              const isHit = hitTime && Date.now() - hitTime < 350;

              return (
                <g key={peg.id}>
                  {isHit && (
                    <circle
                      cx={peg.x}
                      cy={peg.y}
                      r={PEG_RADIUS * 2.2}
                      fill="#38bdf8"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  )}
                  <circle
                    cx={peg.x}
                    cy={peg.y}
                    r={PEG_RADIUS}
                    fill={isHit ? '#67e8f9' : '#94a3b8'}
                    stroke={isHit ? '#ffffff' : '#475569'}
                    strokeWidth="1.5"
                    filter={isHit ? 'url(#pegGlow)' : undefined}
                    className="transition-colors duration-150"
                  />
                </g>
              );
            })}

            {/* Simulated Plinko Ball */}
            {ballPos && (
              <g>
                <circle
                  cx={ballPos.x}
                  cy={ballPos.y}
                  r={BALL_RADIUS}
                  fill="url(#ballGrad)"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="shadow-xl"
                />
              </g>
            )}

            {/* Well Numbers (1 to 9 randomized) */}
            {wellNumbers.map((wellNum, idx) => {
              const wellX = idx * wellWidth + wellWidth / 2;
              const isLanded = landedWell === wellNum;

              return (
                <g key={`well-label-${idx}-${wellNum}`}>
                  {isLanded && (
                    <rect
                      x={idx * wellWidth + 2}
                      y={430}
                      width={wellWidth - 4}
                      height={65}
                      fill="#10b981"
                      rx="8"
                      opacity="0.85"
                      className="animate-pulse"
                    />
                  )}
                  <text
                    x={wellX}
                    y={470}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isLanded ? '#ffffff' : '#cbd5e1'}
                    fontSize={isLanded ? '22' : '16'}
                    fontWeight="900"
                    className="font-black select-none pointer-events-none transition-all duration-200"
                  >
                    {wellNum}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Landing Celebration Overlay */}
          {landedWell !== null && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 animate-fade-in">
              <div className="text-4xl sm:text-5xl mb-2 animate-bounce">🎉</div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 text-center">
                Next Operand: {landedWell}!
              </div>
              <div className="text-xs text-indigo-200 font-semibold mt-1">
                Building question: {landedWell} + ? = 10
              </div>
            </div>
          )}
        </div>

        {/* Interactive Controls Bar: Left / Right / Drop Buttons */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={moveSlotLeft}
            disabled={isDropping || selectedSlotIndex <= 0}
            aria-label="Move Slot Left"
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 text-white font-black rounded-xl shadow-md border-b-4 border-indigo-900 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-xs sm:text-sm"
          >
            <ChevronLeft size={20} />
            Left
          </button>

          <button
            type="button"
            onClick={dropBall}
            disabled={isDropping}
            aria-label="Drop Plinko Ball"
            className="flex-[1.5] py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-40 text-slate-950 font-black rounded-xl shadow-lg border-b-4 border-amber-800 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-sm sm:text-base animate-pulse"
          >
            <ArrowDownCircle size={22} />
            DROP!
          </button>

          <button
            type="button"
            onClick={moveSlotRight}
            disabled={isDropping || selectedSlotIndex >= DROP_SLOTS_COUNT - 1}
            aria-label="Move Slot Right"
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 text-white font-black rounded-xl shadow-md border-b-4 border-indigo-900 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-xs sm:text-sm"
          >
            Right
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="text-[10px] text-slate-400 text-center mt-2 font-medium">
          🎙️ Voice Controls: Say "Left", "Right", or "Drop" out loud!
        </div>
      </div>
    </div>
  );
};
