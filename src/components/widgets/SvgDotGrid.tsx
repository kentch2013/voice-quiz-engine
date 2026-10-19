import React from 'react';
import type { DotGridProps } from '../../types/quiz';

export const SvgDotGrid: React.FC<DotGridProps> = ({
  count,
  layout = 'grid',
  color = '#4f46e5',
}) => {
  const safeCount = Math.min(Math.max(1, count), 20);

  // Helper to generate deterministic scattered positions within a 200x200 canvas
  const getScatteredPositions = (n: number) => {
    const coords = [
      { x: 40, y: 40 },
      { x: 100, y: 35 },
      { x: 160, y: 45 },
      { x: 60, y: 80 },
      { x: 130, y: 75 },
      { x: 175, y: 95 },
      { x: 30, y: 120 },
      { x: 85, y: 115 },
      { x: 145, y: 125 },
      { x: 180, y: 150 },
      { x: 50, y: 160 },
      { x: 110, y: 165 },
      { x: 35, y: 85 },
      { x: 165, y: 35 },
      { x: 75, y: 45 },
      { x: 125, y: 145 },
      { x: 90, y: 180 },
      { x: 155, y: 180 },
      { x: 25, y: 175 },
      { x: 175, y: 175 },
    ];
    return coords.slice(0, n);
  };

  const dots = Array.from({ length: safeCount }, (_, i) => i);

  if (layout === 'scattered') {
    const positions = getScatteredPositions(safeCount);
    return (
      <div className="flex flex-col items-center justify-center p-2">
        <svg
          width={220}
          height={220}
          viewBox="0 0 200 200"
          className="bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-inner p-2"
        >
          {positions.map((pos, idx) => (
            <circle
              key={idx}
              cx={pos.x}
              cy={pos.y}
              r={12}
              fill={color}
              stroke="#312e81"
              strokeWidth="2"
              className="transition-all hover:scale-110"
            />
          ))}
        </svg>
        <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Count the dots ({safeCount})
        </span>
      </div>
    );
  }

  // Grid layout: 2 rows of 5 for up to 10, or 2 rows of 10 for up to 20
  const cols = safeCount <= 10 ? 5 : 10;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div
        className="grid gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {dots.map((idx) => (
          <div
            key={idx}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-indigo-900 shadow-sm transition-all transform hover:scale-105"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Dot Array ({safeCount})
      </span>
    </div>
  );
};
