import React from 'react';
import type { ShapeProps } from '../../types/quiz';

export const SvgShape: React.FC<ShapeProps> = ({
  shape,
  color = '#4f46e5',
  size = 180,
  rotation = 0,
}) => {
  const strokeColor = '#312e81';
  const center = size / 2;
  const padding = 20;
  const renderArea = size - padding * 2;
  const radius = renderArea / 2;

  const getShapeContent = () => {
    switch (shape) {
      case 'circle':
        return (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill={color}
            stroke={strokeColor}
            strokeWidth="4"
          />
        );

      case 'square': {
        const side = renderArea * 0.9;
        const offset = (size - side) / 2;
        return (
          <rect
            x={offset}
            y={offset}
            width={side}
            height={side}
            rx="8"
            fill={color}
            stroke={strokeColor}
            strokeWidth="4"
          />
        );
      }

      case 'triangle': {
        const p1 = `${center},${padding}`;
        const p2 = `${size - padding},${size - padding}`;
        const p3 = `${padding},${size - padding}`;
        return (
          <polygon
            points={`${p1} ${p2} ${p3}`}
            fill={color}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        );
      }

      case 'hexagon': {
        const points: string[] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          points.push(`${x},${y}`);
        }
        return (
          <polygon
            points={points.join(' ')}
            fill={color}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        );
      }

      case 'cylinder': {
        // Isometric / 3D cylinder representation
        const rx = radius * 0.85;
        const ry = radius * 0.3;
        const topY = padding + ry + 10;
        const bottomY = size - padding - ry - 10;

        return (
          <g>
            {/* Body */}
            <path
              d={`M ${center - rx} ${topY} L ${center - rx} ${bottomY} A ${rx} ${ry} 0 0 0 ${center + rx} ${bottomY} L ${center + rx} ${topY} Z`}
              fill={color}
              stroke={strokeColor}
              strokeWidth="4"
            />
            {/* Bottom dashed curve */}
            <path
              d={`M ${center - rx} ${bottomY} A ${rx} ${ry} 0 0 1 ${center + rx} ${bottomY}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Top ellipse */}
            <ellipse
              cx={center}
              cy={topY}
              rx={rx}
              ry={ry}
              fill={color}
              stroke={strokeColor}
              strokeWidth="4"
              className="brightness-110"
            />
          </g>
        );
      }

      case 'cube': {
        // Isometric 3D Cube
        const r = radius * 0.8;
        const topPoint = [center, center - r];
        const rightTop = [center + r * 0.866, center - r * 0.5];
        const rightBottom = [center + r * 0.866, center + r * 0.5];
        const bottomPoint = [center, center + r];
        const leftBottom = [center - r * 0.866, center + r * 0.5];
        const leftTop = [center - r * 0.866, center - r * 0.5];

        return (
          <g>
            {/* Top face */}
            <polygon
              points={`${topPoint.join(',')} ${rightTop.join(',')} ${center},${center} ${leftTop.join(',')}`}
              fill={color}
              stroke={strokeColor}
              strokeWidth="3"
              className="brightness-115"
            />
            {/* Left face */}
            <polygon
              points={`${leftTop.join(',')} ${center},${center} ${bottomPoint.join(',')} ${leftBottom.join(',')}`}
              fill={color}
              stroke={strokeColor}
              strokeWidth="3"
              className="brightness-90"
            />
            {/* Right face */}
            <polygon
              points={`${center},${center} ${rightTop.join(',')} ${rightBottom.join(',')} ${bottomPoint.join(',')}`}
              fill={color}
              stroke={strokeColor}
              strokeWidth="3"
              className="brightness-75"
            />
          </g>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
        className="transition-transform duration-300 drop-shadow-md"
      >
        {getShapeContent()}
      </svg>
      <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {shape}
      </span>
    </div>
  );
};
