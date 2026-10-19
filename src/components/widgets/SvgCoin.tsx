import React from 'react';
import type { CoinProps } from '../../types/quiz';

const COIN_CONFIGS = {
  penny: {
    name: 'Penny',
    value: '1¢',
    color: '#b87333',
    outerColor: '#d97706',
    innerColor: '#b87333',
    textColor: '#ffffff',
    radius: 40,
  },
  nickel: {
    name: 'Nickel',
    value: '5¢',
    color: '#9ca3af',
    outerColor: '#6b7280',
    innerColor: '#9ca3af',
    textColor: '#ffffff',
    radius: 46,
  },
  dime: {
    name: 'Dime',
    value: '10¢',
    color: '#9ca3af',
    outerColor: '#4b5563',
    innerColor: '#9ca3af',
    textColor: '#ffffff',
    radius: 36,
  },
  quarter: {
    name: 'Quarter',
    value: '25¢',
    color: '#9ca3af',
    outerColor: '#374151',
    innerColor: '#9ca3af',
    textColor: '#ffffff',
    radius: 54,
  },
};

export const SvgCoin: React.FC<CoinProps> = ({ coin, size }) => {
  const cfg = COIN_CONFIGS[coin] || COIN_CONFIGS.quarter;
  const dimension = (size || cfg.radius * 2) + 20;
  const center = dimension / 2;
  const radius = cfg.radius;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        className="drop-shadow-md select-none"
        aria-label={`${cfg.name} coin worth ${cfg.value}`}
      >
        {/* Outer Coin Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={cfg.outerColor}
          stroke="#1f2937"
          strokeWidth={2}
        />

        {/* Inner Coin Body */}
        <circle
          cx={center}
          cy={center}
          r={radius - 4}
          fill={cfg.innerColor}
          stroke={cfg.outerColor}
          strokeWidth={2}
        />

        {/* Inner Rim Accent */}
        <circle
          cx={center}
          cy={center}
          r={radius - 8}
          fill="none"
          stroke={cfg.outerColor}
          strokeWidth={1}
          strokeDasharray="4 2"
        />

        {/* Coin Label Value */}
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={cfg.textColor}
          fontSize={radius > 40 ? '22px' : '16px'}
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
        >
          {cfg.value}
        </text>

        {/* Coin Name */}
        <text
          x={center}
          y={center + radius / 2.5}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={cfg.textColor}
          fontSize={radius > 40 ? '11px' : '9px'}
          fontWeight="800"
          letterSpacing="1px"
          fontFamily="system-ui, sans-serif"
        >
          {cfg.name.toUpperCase()}
        </text>
      </svg>
    </div>
  );
};
