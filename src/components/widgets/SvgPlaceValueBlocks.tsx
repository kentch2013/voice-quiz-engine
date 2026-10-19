import React from 'react';
import type { PlaceValueProps } from '../../types/quiz';

export const SvgPlaceValueBlocks: React.FC<PlaceValueProps> = ({ tens, ones }) => {
  const cubeSize = 14;
  const gap = 3;
  const rodWidth = cubeSize + 4;
  const rodHeight = 10 * cubeSize + 9 * gap + 4;

  const validTens = Math.min(Math.max(0, tens), 9);
  const validOnes = Math.min(Math.max(0, ones), 9);

  return (
    <div className="flex flex-wrap items-end justify-center gap-6 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 max-w-full">
      {/* Tens Rods Section */}
      {validTens > 0 && (
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
            {validTens} {validTens === 1 ? 'Ten' : 'Tens'}
          </span>
          <div className="flex items-end gap-2">
            {Array.from({ length: validTens }).map((_, rodIdx) => (
              <svg
                key={`rod-${rodIdx}`}
                width={rodWidth}
                height={rodHeight}
                viewBox={`0 0 ${rodWidth} ${rodHeight}`}
                className="drop-shadow-sm select-none"
                aria-label="Ten rod"
              >
                {/* Rod Background Container */}
                <rect
                  x={0}
                  y={0}
                  width={rodWidth}
                  height={rodHeight}
                  rx={4}
                  fill="#4338ca"
                  stroke="#3730a3"
                  strokeWidth={1}
                />
                {/* 10 Stacked Cubes */}
                {Array.from({ length: 10 }).map((_, cubeIdx) => {
                  const cy = 2 + cubeIdx * (cubeSize + gap);
                  return (
                    <g key={`cube-${cubeIdx}`}>
                      <rect
                        x={2}
                        y={cy}
                        width={cubeSize}
                        height={cubeSize}
                        rx={2}
                        fill="#6366f1"
                        stroke="#4338ca"
                        strokeWidth={1}
                      />
                      {/* Top highlight */}
                      <line
                        x1={3}
                        y1={cy + 1}
                        x2={2 + cubeSize - 1}
                        y2={cy + 1}
                        stroke="#a5b4fc"
                        strokeWidth={1}
                      />
                    </g>
                  );
                })}
              </svg>
            ))}
          </div>
        </div>
      )}

      {/* Ones Unit Cubes Section */}
      {validOnes > 0 && (
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            {validOnes} {validOnes === 1 ? 'One' : 'Ones'}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: validOnes }).map((_, unitIdx) => (
              <svg
                key={`unit-${unitIdx}`}
                width={cubeSize + 6}
                height={cubeSize + 6}
                viewBox={`0 0 ${cubeSize + 6} ${cubeSize + 6}`}
                className="drop-shadow-sm select-none"
                aria-label="Unit cube"
              >
                <rect
                  x={3}
                  y={3}
                  width={cubeSize}
                  height={cubeSize}
                  rx={3}
                  fill="#f59e0b"
                  stroke="#d97706"
                  strokeWidth={1.5}
                />
                <line
                  x1={4}
                  y1={4}
                  x2={3 + cubeSize - 1}
                  y2={4}
                  stroke="#fde68a"
                  strokeWidth={1}
                />
              </svg>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
