import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Flame } from 'lucide-react';
import type { LetterHeroProps } from '../../types/quiz';
import { LETTER_SPOKEN_NAMES } from '../../utils/quizGenerator';
import { playCorrectChime, playWrongSound } from '../../utils/audioSynthesizer';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const FALL_DURATION_MS = 5000;
export const SPAWN_INTERVAL_MS = 4000;
export const STRIKE_ZONE_START = 60; // 60% to 100% is strike zone (lenient for children)

export interface FallingLetterItem {
  id: string;
  letter: string;
  spawnTime: number;
  hit?: boolean;
  rating?: 'Perfect!' | 'Good!' | 'Miss';
}

export interface LetterHeroGameProps extends LetterHeroProps {
  transcript?: string;
  interimTranscript?: string;
}

/**
 * Speech recognition matcher for single letter phonetics/names.
 */
export function isLetterSpoken(text: string, letter: string): boolean {
  if (!text || !letter) return false;
  const lowerLetter = letter.toLowerCase();
  const normalized = text.toLowerCase().trim();

  const words = normalized.split(/[\s,.!?;:]+/).filter(Boolean);

  // 1. Direct word token match
  if (words.includes(lowerLetter)) return true;

  // 2. Phonetic aliases (e.g. "bee", "cee", "aye", "zee", "zed", "apple", etc.)
  const phonetics = LETTER_SPOKEN_NAMES[lowerLetter] || [];
  for (const ph of phonetics) {
    const phLower = ph.toLowerCase();
    if (phLower.length === 1 && words.includes(phLower)) return true;
    if (phLower.length > 1 && normalized.includes(phLower)) return true;
  }

  return false;
}

export const LetterHeroGame: React.FC<LetterHeroGameProps> = ({
  letters,
  transcript = '',
  interimTranscript = '',
  onComplete,
  onScoreUpdate,
}) => {
  // Generate or use provided 10 letters for the round
  const targetLetters = useMemo(() => {
    if (letters && letters.length > 0) {
      return letters;
    }
    const pool: string[] = [];
    for (let i = 0; i < 10; i++) {
      pool.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
    }
    return pool;
  }, [letters]);

  const [activeLetters, setActiveLetters] = useState<FallingLetterItem[]>([]);
  const [spawnIndex, setSpawnIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [perfectCount, setPerfectCount] = useState<number>(0);
  const [goodCount, setGoodCount] = useState<number>(0);
  const [missCount, setMissCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [recentRating, setRecentRating] = useState<{
    text: 'Perfect!' | 'Good!' | 'Miss';
    letter: string;
    points: number;
    id: number;
  } | null>(null);

  const [now, setNow] = useState<number>(() => Date.now());

  const activeLettersRef = useRef<FallingLetterItem[]>(activeLetters);
  activeLettersRef.current = activeLetters;

  const lastProcessedSpeechRef = useRef<string>('');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onScoreUpdateRef = useRef(onScoreUpdate);
  onScoreUpdateRef.current = onScoreUpdate;

  // Animation frame loop for smooth rendering of falling letters
  useEffect(() => {
    if (isCompleted) return;

    let animId: number;
    const tick = () => {
      setNow(Date.now());
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isCompleted]);

  // 1. Spawner interval (spawns 1 letter every 4 seconds up to 10 letters)
  useEffect(() => {
    if (isCompleted) return;

    // Spawn initial letter at t=0 if not started
    if (spawnIndex === 0 && activeLetters.length === 0) {
      const firstLetter = targetLetters[0];
      const newItem: FallingLetterItem = {
        id: `falling-0-${Date.now()}`,
        letter: firstLetter,
        spawnTime: Date.now(),
      };
      setActiveLetters([newItem]);
      setSpawnIndex(1);
    }

    const timer = setInterval(() => {
      setSpawnIndex((prevIndex) => {
        if (prevIndex >= targetLetters.length) {
          clearInterval(timer);
          return prevIndex;
        }

        const nextLetter = targetLetters[prevIndex];
        const newItem: FallingLetterItem = {
          id: `falling-${prevIndex}-${Date.now()}`,
          letter: nextLetter,
          spawnTime: Date.now(),
        };

        setActiveLetters((prev) => [...prev, newItem]);
        return prevIndex + 1;
      });
    }, SPAWN_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [spawnIndex, targetLetters, isCompleted, activeLetters.length]);

  // 2. Check for miss expiration and round completion on frame updates
  useEffect(() => {
    if (isCompleted) return;

    let updated = false;

    const nextList = activeLettersRef.current.map((item) => {
      if (item.hit) return item;

      const progress = ((now - item.spawnTime) / FALL_DURATION_MS) * 100;
      if (progress >= 100) {
        // Reached bottom without being spoken -> Miss!
        updated = true;
        playWrongSound();
        setMissCount((m) => m + 1);
        setRecentRating({
          text: 'Miss',
          letter: item.letter,
          points: 0,
          id: Date.now(),
        });
        if (onScoreUpdateRef.current) {
          onScoreUpdateRef.current(0, 'Miss');
        }
        return {
          ...item,
          hit: true,
          rating: 'Miss' as const,
        };
      }
      return item;
    });

    if (updated) {
      setActiveLetters(nextList);
      activeLettersRef.current = nextList;
    }

    // Check if round is complete (10 letters spawned & all processed)
    if (
      activeLettersRef.current.length >= targetLetters.length &&
      nextList.every((item) => item.hit)
    ) {
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore in test envs
      }
      if (onCompleteRef.current) {
        const cb = onCompleteRef.current;
        setTimeout(() => cb(), 1500);
      }
    }
  }, [now, isCompleted, targetLetters.length]);

  // Function to register a hit on a falling letter
  const registerHit = (fallingItem: FallingLetterItem, progress: number) => {
    const isPerfect = progress >= STRIKE_ZONE_START && progress < 100;
    const ratingText: 'Perfect!' | 'Good!' = isPerfect ? 'Perfect!' : 'Good!';
    const points = isPerfect ? 100 : 50;

    playCorrectChime();

    setScore((s) => s + points);
    if (isPerfect) setPerfectCount((p) => p + 1);
    else setGoodCount((g) => g + 1);

    setRecentRating({
      text: ratingText,
      letter: fallingItem.letter,
      points,
      id: Date.now(),
    });

    if (onScoreUpdateRef.current) {
      onScoreUpdateRef.current(points, ratingText);
    }

    setActiveLetters((prev) =>
      prev.map((item) =>
        item.id === fallingItem.id
          ? { ...item, hit: true, rating: ratingText }
          : item
      )
    );
  };

  // 3. Speech transcript matching listener
  useEffect(() => {
    const combinedSpeech = `${transcript} ${interimTranscript}`.trim();
    if (!combinedSpeech || combinedSpeech === lastProcessedSpeechRef.current) {
      return;
    }

    // Find all unhit falling letters sorted by lowest position down track
    const now = Date.now();
    const unhitCandidates = activeLettersRef.current
      .filter((item) => !item.hit)
      .map((item) => {
        const progress = ((now - item.spawnTime) / FALL_DURATION_MS) * 100;
        return { item, progress };
      })
      .filter(({ progress }) => progress >= 0 && progress < 100)
      .sort((a, b) => b.progress - a.progress); // Lowest down track first

    if (unhitCandidates.length === 0) return;

    for (const { item, progress } of unhitCandidates) {
      if (isLetterSpoken(combinedSpeech, item.letter)) {
        lastProcessedSpeechRef.current = combinedSpeech;
        registerHit(item, progress);
        break; // Match one letter per spoken phrase/update
      }
    }
  }, [transcript, interimTranscript]);

  // Set of uppercase letters currently actively falling on track
  const currentlyFallingLettersSet = useMemo(() => {
    const set = new Set<string>();
    const now = Date.now();
    activeLetters.forEach((item) => {
      if (!item.hit) {
        const progress = ((now - item.spawnTime) / FALL_DURATION_MS) * 100;
        if (progress >= 0 && progress < 100) {
          set.add(item.letter.toUpperCase());
        }
      }
    });
    return set;
  }, [activeLetters]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none font-sans">
      {/* Top Alphabet Banner A through Z */}
      <div className="w-full bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-2.5 mb-4 shadow-xl">
        <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center mb-1 flex items-center justify-center gap-1">
          <Flame size={12} className="text-amber-400 animate-bounce" />
          <span>Alphabet Target Banner</span>
        </div>
        <div className="grid grid-cols-13 gap-1 text-center">
          {ALPHABET.map((char) => {
            const isGlowing = currentlyFallingLettersSet.has(char);
            return (
              <div
                key={char}
                className={`py-1 rounded-lg font-black text-xs transition-all duration-300 ${
                  isGlowing
                    ? 'bg-amber-400 text-slate-950 scale-125 shadow-lg shadow-amber-400/80 ring-2 ring-white animate-pulse z-10'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                }`}
              >
                {char}
              </div>
            );
          })}
        </div>
      </div>

      {/* Score & Rating Bar */}
      <div className="w-full bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 rounded-2xl p-3 text-white shadow-md mb-3 border-2 border-indigo-300/40 flex items-center justify-between px-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-amber-300 animate-pulse" />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold block">
              Score
            </span>
            <span className="text-xl font-black text-amber-300">{score} pts</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-black">
          <span className="bg-emerald-500/30 px-2 py-1 rounded-lg border border-emerald-400/40 text-emerald-200">
            Perfect: {perfectCount}
          </span>
          <span className="bg-blue-500/30 px-2 py-1 rounded-lg border border-blue-400/40 text-blue-200">
            Good: {goodCount}
          </span>
          <span className="bg-rose-500/30 px-2 py-1 rounded-lg border border-rose-400/40 text-rose-200">
            Miss: {missCount}
          </span>
        </div>
      </div>

      {/* Guitar Hero Vertical Highway Track */}
      <div className="relative w-full h-[380px] bg-slate-950 rounded-3xl border-4 border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Track Perspective Lines & Lane Stripes */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-slate-900/90 to-slate-950 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/4 w-[2px] bg-indigo-500/20 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 w-[2px] bg-indigo-500/30 pointer-events-none" />
        <div className="absolute inset-y-0 left-3/4 w-[2px] bg-indigo-500/20 pointer-events-none" />

        {/* Bottom Collection Target Strike Zone */}
        <div className="absolute bottom-0 inset-x-0 h-[40%] bg-gradient-to-t from-emerald-500/30 to-emerald-500/5 border-t-4 border-emerald-400 flex items-center justify-center pointer-events-none z-10">
          <div className="w-11/12 h-14 border-2 border-dashed border-emerald-300 rounded-2xl flex items-center justify-center bg-emerald-500/20 backdrop-blur-xs shadow-lg shadow-emerald-500/20">
            <span className="text-emerald-300 font-extrabold text-xs uppercase tracking-widest animate-pulse">
              🎯 STRIKE ZONE (Say Letter Now!) 🎯
            </span>
          </div>
        </div>

        {/* Floating Recent Feedback Badge */}
        {recentRating && (
          <div
            key={recentRating.id}
            className={`absolute top-4 z-30 px-4 py-1.5 rounded-2xl font-black text-sm sm:text-base shadow-xl border-2 animate-bounce ${
              recentRating.text === 'Perfect!'
                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-amber-400/50'
                : recentRating.text === 'Good!'
                ? 'bg-blue-500 text-white border-blue-200 shadow-blue-500/50'
                : 'bg-rose-600 text-white border-rose-300 shadow-rose-600/50'
            }`}
          >
            {recentRating.text} {recentRating.letter} {recentRating.points > 0 ? `+${recentRating.points}` : ''}
          </div>
        )}

        {/* Falling Letters Area */}
        <div className="relative w-full h-full">
          {activeLetters.map((item) => {
            if (item.hit) {
              return null; // Hide hit or missed letters immediately
            }

            const progress = ((now - item.spawnTime) / FALL_DURATION_MS) * 100;
            if (progress >= 100) {
              return null; // Hide expired letters immediately
            }

            const isInStrikeZone = progress >= STRIKE_ZONE_START && progress < 100;

            return (
              <div
                key={item.id}
                style={{
                  top: `${progress}%`,
                  transform: isInStrikeZone
                    ? 'translate(-50%, -50%) scale(1.1)'
                    : 'translate(-50%, -50%)',
                }}
                onClick={() => registerHit(item, progress)}
                className={`absolute left-1/2 cursor-pointer flex items-center justify-center w-14 h-14 rounded-2xl font-black text-2xl sm:text-3xl border-4 shadow-xl z-20 select-none ${
                  isInStrikeZone
                    ? 'bg-amber-400 text-slate-950 border-white shadow-amber-400/80 ring-4 ring-amber-300'
                    : 'bg-indigo-600 text-white border-indigo-300 shadow-indigo-600/60'
                }`}
              >
                {item.letter}
              </div>
            );
          })}
        </div>

        {/* Game Completed Overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 z-40 animate-fade-in">
            <Sparkles size={64} className="text-amber-400 animate-spin mb-3" />
            <h2 className="text-3xl font-black text-amber-300 mb-2">🎸 Round Complete!</h2>
            <div className="text-center font-bold text-sm text-indigo-100 mb-4">
              Final Score: <span className="text-2xl text-amber-400 font-black">{score} pts</span>
            </div>
            <div className="flex gap-3 text-xs font-extrabold mb-4">
              <span className="bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/40 text-emerald-300">
                Perfects: {perfectCount}
              </span>
              <span className="bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-400/40 text-blue-300">
                Goods: {goodCount}
              </span>
              <span className="bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-400/40 text-rose-300">
                Misses: {missCount}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
