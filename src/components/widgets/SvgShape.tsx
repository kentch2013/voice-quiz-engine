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

  const getRegularPolygonPoints = (sides: number, startAngleOffset = -Math.PI / 2): string => {
    const points: string[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (2 * Math.PI / sides) * i + startAngleOffset;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

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

      case 'rectangle': {
        const rectWidth = renderArea;
        const rectHeight = renderArea * 0.6;
        const offsetX = padding;
        const offsetY = center - rectHeight / 2;
        return (
          <rect
            x={offsetX}
            y={offsetY}
            width={rectWidth}
            height={rectHeight}
            rx="8"
            fill={color}
            stroke={strokeColor}
            strokeWidth="4"
          />
        );
      }

      case 'oval': {
        return (
          <ellipse
            cx={center}
            cy={center}
            rx={radius}
            ry={radius * 0.6}
            fill={color}
            stroke={strokeColor}
            strokeWidth="4"
          />
        );
      }

      case 'diamond':
      case 'rhombus': {
        const pTop = `${center},${padding}`;
        const pRight = `${size - padding},${center}`;
        const pBottom = `${center},${size - padding}`;
        const pLeft = `${padding},${center}`;
        return (
          <polygon
            points={`${pTop} ${pRight} ${pBottom} ${pLeft}`}
            fill={color}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        );
      }

      case 'star': {
        const points: string[] = [];
        const outerR = radius;
        const innerR = radius * 0.4;
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
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

      case 'heart': {
        const d = `M ${center} ${center + radius * 0.75} C ${center - radius * 1.3} ${center - radius * 0.2}, ${center - radius * 0.7} ${center - radius * 0.9}, ${center} ${center - radius * 0.3} C ${center + radius * 0.7} ${center - radius * 0.9}, ${center + radius * 1.3} ${center - radius * 0.2}, ${center} ${center + radius * 0.75} Z`;
        return (
          <path
            d={d}
            fill={color}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        );
      }

      case 'pentagon':
        return (
          <polygon
            points={getRegularPolygonPoints(5)}
            fill={color}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        );

      case 'hexagon':
        return (
          <polygon
            points={getRegularPolygonPoints(6, -Math.PI / 6)}
            fill={color}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        );

      case 'octagon':
        return (
          <polygon
            points={getRegularPolygonPoints(8, -Math.PI / 8)}
            fill={color}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        );

      case 'sphere': {
        const rx = radius * 0.9;
        return (
          <g>
            <circle
              cx={center}
              cy={center}
              r={rx}
              fill={color}
              stroke={strokeColor}
              strokeWidth="4"
            />
            <ellipse
              cx={center}
              cy={center}
              rx={rx}
              ry={rx * 0.3}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <ellipse
              cx={center - rx * 0.25}
              cy={center - rx * 0.25}
              rx={rx * 0.4}
              ry={rx * 0.25}
              fill="#ffffff"
              opacity="0.35"
            />
          </g>
        );
      }

      case 'cylinder': {
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

      case 'cone': {
        const rx = radius * 0.85;
        const ry = radius * 0.25;
        const apexY = padding + 10;
        const baseY = size - padding - ry - 10;

        return (
          <g>
            {/* Body */}
            <path
              d={`M ${center - rx} ${baseY} L ${center} ${apexY} L ${center + rx} ${baseY} A ${rx} ${ry} 0 0 1 ${center - rx} ${baseY} Z`}
              fill={color}
              stroke={strokeColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Dashed back ellipse curve */}
            <path
              d={`M ${center - rx} ${baseY} A ${rx} ${ry} 0 0 1 ${center + rx} ${baseY}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </g>
        );
      }

      case 'cube': {
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
      <span className="sr-only">{shape}</span>
    </div>
  );
};
