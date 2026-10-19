import React from 'react';
import type { CoinProps, CoinType } from '../../types/quiz';

const COIN_DETAILS: Record<
  CoinType,
  {
    name: string;
    radius: number;
    outerColor: string;
    innerColor: string;
    strokeColor: string;
    gradId: string;
    gradColors: [string, string];
  }
> = {
  penny: {
    name: 'Penny',
    radius: 32,
    outerColor: '#9a3412',
    innerColor: '#b87333',
    strokeColor: '#78350f',
    gradId: 'pennyGrad',
    gradColors: ['#d97706', '#854d0e'],
  },
  nickel: {
    name: 'Nickel',
    radius: 38,
    outerColor: '#64748b',
    innerColor: '#cbd5e1',
    strokeColor: '#334155',
    gradId: 'nickelGrad',
    gradColors: ['#f1f5f9', '#94a3b8'],
  },
  dime: {
    name: 'Dime',
    radius: 26,
    outerColor: '#64748b',
    innerColor: '#cbd5e1',
    strokeColor: '#334155',
    gradId: 'dimeGrad',
    gradColors: ['#ffffff', '#94a3b8'],
  },
  quarter: {
    name: 'Quarter',
    radius: 44,
    outerColor: '#475569',
    innerColor: '#e2e8f0',
    strokeColor: '#1e293b',
    gradId: 'quarterGrad',
    gradColors: ['#ffffff', '#94a3b8'],
  },
};

const SingleCoinSvg: React.FC<{ coin: CoinType; size?: number }> = ({ coin, size }) => {
  const cfg = COIN_DETAILS[coin] || COIN_DETAILS.quarter;
  const radius = size ? size / 2 : cfg.radius;
  const dimension = radius * 2 + 16;
  const center = dimension / 2;

  const renderArtwork = () => {
    switch (coin) {
      case 'penny':
        return (
          <g transform={`translate(${center}, ${center})`}>
            {/* Lincoln Bust Silhouette */}
            <path
              d="M 0 -14 C -6 -14 -10 -9 -9 -3 C -8 2 -6 5 -4 8 C -3 10 -6 13 -8 16 L 10 16 C 8 12 7 8 5 5 C 4 2 4 -1 2 -3 C 5 -5 5 -14 0 -14 Z"
              fill="#5c2c0c"
              opacity="0.75"
            />
            {/* Curved rim accent text */}
            <path
              id={`penny-arc-${center}`}
              d={`M ${-radius + 8} 0 A ${radius - 8} ${radius - 8} 0 0 1 ${radius - 8} 0`}
              fill="none"
            />
            <text fill="#78350f" fontSize="7" fontWeight="bold" textAnchor="middle">
              <textPath href={`#penny-arc-${center}`} startOffset="50%">
                LIBERTY
              </textPath>
            </text>
          </g>
        );

      case 'nickel':
        return (
          <g transform={`translate(${center}, ${center})`}>
            {/* Monticello Building Silhouette */}
            <path d="M -8 -4 A 8 8 0 0 1 8 -4 Z" fill="#334155" opacity="0.7" />
            <rect x="-10" y="-4" width="20" height="3" fill="#334155" opacity="0.7" />
            <rect x="-12" y="-1" width="24" height="10" fill="#334155" opacity="0.7" />
            <rect x="-14" y="9" width="28" height="3" fill="#334155" opacity="0.7" />
            {/* Pillars */}
            <line x1="-8" y1="-1" x2="-8" y2="9" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="-3" y1="-1" x2="-3" y2="9" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="3" y1="-1" x2="3" y2="9" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="8" y1="-1" x2="8" y2="9" stroke="#cbd5e1" strokeWidth="1.5" />
          </g>
        );

      case 'dime':
        return (
          <g transform={`translate(${center}, ${center})`}>
            {/* Torch & Olive/Oak Branch Motif */}
            <rect x="-2" y="-10" width="4" height="20" rx="1" fill="#334155" opacity="0.75" />
            <path d="M 0 -15 C -3 -12 -1 -10 0 -10 C 1 -10 3 -12 0 -15 Z" fill="#d97706" />
            <path
              d="M -9 -4 C -5 0 -5 5 -9 8 M 9 -4 C 5 0 5 5 9 8"
              stroke="#334155"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.75"
            />
          </g>
        );

      case 'quarter':
      default:
        return (
          <g transform={`translate(${center}, ${center})`}>
            {/* Bald Eagle Motif */}
            <path
              d="M 0 -6 L -18 -14 C -14 -2 -8 3 -4 7 L 0 12 L 4 7 C 8 3 14 -2 18 -14 Z"
              fill="#334155"
              opacity="0.75"
            />
            <path d="M -5 1 L 5 1 L 4 9 L 0 11 L -4 9 Z" fill="#475569" />
            {/* Stars */}
            <circle cx="-10" cy="12" r="1" fill="#334155" />
            <circle cx="-5" cy="14" r="1" fill="#334155" />
            <circle cx="0" cy="15" r="1" fill="#334155" />
            <circle cx="5" cy="14" r="1" fill="#334155" />
            <circle cx="10" cy="12" r="1" fill="#334155" />
          </g>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-1">
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        className="drop-shadow-md select-none"
        aria-label={`US ${cfg.name}`}
      >
        <defs>
          <radialGradient
            id={`${cfg.gradId}-${dimension}`}
            cx="35%"
            cy="35%"
            r="65%"
          >
            <stop offset="0%" stopColor={cfg.gradColors[0]} />
            <stop offset="100%" stopColor={cfg.gradColors[1]} />
          </radialGradient>
        </defs>

        {/* Outer Reeded Edge / Border */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={cfg.outerColor}
          stroke={cfg.strokeColor}
          strokeWidth={2}
        />

        {/* Metallic Body */}
        <circle
          cx={center}
          cy={center}
          r={radius - 3}
          fill={`url(#${cfg.gradId}-${dimension})`}
          stroke={cfg.strokeColor}
          strokeWidth={1.5}
        />

        {/* Inner Dashed Rim Accent */}
        <circle
          cx={center}
          cy={center}
          r={radius - 6}
          fill="none"
          stroke={cfg.strokeColor}
          strokeWidth={1}
          strokeDasharray="3 2"
          opacity={0.5}
        />

        {/* Center Realistic Artwork (No spoiler text) */}
        {renderArtwork()}
      </svg>
    </div>
  );
};

export const SvgCoin: React.FC<CoinProps> = ({ coin, coins, size }) => {
  if (coins && coins.length > 0) {
    return (
      <div
        className="flex flex-wrap items-center justify-center gap-2 p-3 max-w-lg bg-indigo-50/60 rounded-2xl border border-indigo-100 shadow-inner"
        aria-label="Collection of US coins"
      >
        {coins.map((c, idx) => (
          <SingleCoinSvg key={`${c}-${idx}`} coin={c} size={size} />
        ))}
      </div>
    );
  }

  const singleCoin = coin || 'quarter';
  return <SingleCoinSvg coin={singleCoin} size={size} />;
};
