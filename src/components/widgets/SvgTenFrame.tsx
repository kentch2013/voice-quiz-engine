import React from 'react';
import type { TenFrameProps } from '../../types/quiz';

export const SvgTenFrame: React.FC<TenFrameProps> = ({
  count,
  total = 10,
  color = '#4f46e5',
}) => {
  const columns = 5;
  const rows = 2;
  const cellWidth = 48;
  const cellHeight = 48;
  const gap = 6;
  const padding = 8;

  const width = padding * 2 + columns * cellWidth + (columns - 1) * gap;
  const height = padding * 2 + rows * cellHeight + (rows - 1) * gap;

  const validCount = Math.min(Math.max(0, count), total);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="drop-shadow-sm select-none"
        aria-label={`Ten frame showing ${validCount} of ${total}`}
      >
        {/* Frame Outer Border */}
        <rect
          x={padding - 2}
          y={padding - 2}
          width={columns * cellWidth + (columns - 1) * gap + 4}
          height={rows * cellHeight + (rows - 1) * gap + 4}
          rx={12}
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth={3}
        />

        {/* 10 Cells */}
        {Array.from({ length: total }).map((_, i) => {
          const r = Math.floor(i / columns);
          const c = i % columns;
          const x = padding + c * (cellWidth + gap);
          const y = padding + r * (cellHeight + gap);
          const isFilled = i < validCount;

          return (
            <g key={i}>
              {/* Cell Container */}
              <rect
                x={x}
                y={y}
                width={cellWidth}
                height={cellHeight}
                rx={8}
                fill="#ffffff"
                stroke="#e2e8f0"
                strokeWidth={2}
              />

              {/* Dot inside Cell */}
              {isFilled ? (
                <circle
                  cx={x + cellWidth / 2}
                  cy={y + cellHeight / 2}
                  r={18}
                  fill={color}
                  className="transition-all duration-300"
                />
              ) : (
                <circle
                  cx={x + cellWidth / 2}
                  cy={y + cellHeight / 2}
                  r={12}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
