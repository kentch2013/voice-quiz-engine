import React from 'react';
import type { CoinProps, CoinType } from '../../types/quiz';

export const COIN_DETAILS: Record<
  CoinType,
  {
    name: string;
    value: number;
    valueLabel: string;
    diameter: number;
  }
> = {
  dime: {
    name: 'Dime',
    value: 10,
    valueLabel: '10¢',
    diameter: 68,
  },
  penny: {
    name: 'Penny',
    value: 1,
    valueLabel: '1¢',
    diameter: 72,
  },
  nickel: {
    name: 'Nickel',
    value: 5,
    valueLabel: '5¢',
    diameter: 80,
  },
  quarter: {
    name: 'Quarter',
    value: 25,
    valueLabel: '25¢',
    diameter: 92,
  },
};

const CoinEdgeOverlay: React.FC<{ coin: CoinType; size: number }> = ({ coin, size }) => {
  if (coin === 'penny') {
    return (
      <div
        data-testid="penny-edge"
        data-coin-edge="smooth-copper"
        className="absolute inset-0 rounded-full border-[3px] border-amber-800/90 bg-gradient-to-r from-amber-700/20 via-amber-600/30 to-amber-900/20 shadow-[inset_0_0_6px_rgba(120,53,15,0.8),0_2px_6px_rgba(0,0,0,0.3)] pointer-events-none"
        aria-hidden="true"
      />
    );
  }

  if (coin === 'nickel') {
    return (
      <div
        data-testid="nickel-edge"
        data-coin-edge="smooth-bevel"
        className="absolute inset-0 rounded-full border-[4px] border-slate-300/90 bg-gradient-to-br from-slate-100/30 via-slate-300/40 to-slate-500/30 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.3)] pointer-events-none"
        aria-hidden="true"
      />
    );
  }

  if (coin === 'dime') {
    return (
      <div
        data-testid="dime-edge"
        data-coin-edge="reeded-ridges"
        className="absolute inset-0 rounded-full pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
        >
          <circle cx="50" cy="50" r="48.5" fill="none" stroke="#cbd5e1" strokeWidth="3" />
          <circle
            cx="50"
            cy="50"
            r="48.5"
            fill="none"
            stroke="#475569"
            strokeWidth="2.5"
            strokeDasharray="2, 2.5"
          />
        </svg>
      </div>
    );
  }

  // Quarter
  return (
    <div
      data-testid="quarter-edge"
      data-coin-edge="reeded-ridges"
      className="absolute inset-0 rounded-full pointer-events-none flex items-center justify-center"
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
      >
        <circle cx="50" cy="50" r="48.5" fill="none" stroke="#cbd5e1" strokeWidth="3.5" />
        <circle
          cx="50"
          cy="50"
          r="48.5"
          fill="none"
          stroke="#334155"
          strokeWidth="3"
          strokeDasharray="2.5, 3"
        />
      </svg>
    </div>
  );
};

const SingleCoinPhoto: React.FC<{ coin: CoinType; size?: number }> = ({ coin, size }) => {
  const cfg = COIN_DETAILS[coin] || COIN_DETAILS.quarter;
  const dimension = size ? Math.round(cfg.diameter * (size / 68)) : cfg.diameter;

  return (
    <div
      className="flex flex-col items-center justify-center p-1 select-none"
      aria-label={`US ${cfg.name}`}
    >
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{ width: `${dimension}px`, height: `${dimension}px` }}
      >
        <img
          src={`/assets/coins/${coin}.png`}
          alt={`US ${cfg.name}`}
          width={dimension}
          height={dimension}
          style={{ width: `${dimension}px`, height: `${dimension}px` }}
          className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)] object-contain transition-transform duration-200 hover:scale-105 rounded-full"
        />
        <CoinEdgeOverlay coin={coin} size={dimension} />
      </div>
    </div>
  );
};

const ScaleReferenceTray: React.FC = () => {
  const referenceCoins: CoinType[] = ['dime', 'penny', 'nickel', 'quarter'];

  return (
    <div className="mt-4 pt-3 border-t border-indigo-100/80 w-full flex flex-col items-center">
      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-2">
        Size Reference Tray
      </div>
      <div className="flex items-end justify-center gap-3 sm:gap-5 bg-slate-50/90 px-4 py-3 rounded-2xl border border-slate-200/80 shadow-inner">
        {referenceCoins.map((coin) => {
          const cfg = COIN_DETAILS[coin];
          const displaySize = Math.round(cfg.diameter * 0.65);
          return (
            <div key={coin} className="flex flex-col items-center gap-1.5">
              <div
                className="relative flex items-center justify-center rounded-full"
                style={{ width: `${displaySize}px`, height: `${displaySize}px` }}
              >
                <img
                  src={`/assets/coins/${coin}.png`}
                  alt={`Reference ${cfg.name}`}
                  width={displaySize}
                  height={displaySize}
                  style={{ width: `${displaySize}px`, height: `${displaySize}px` }}
                  className="drop-shadow-sm select-none object-contain rounded-full"
                />
                <CoinEdgeOverlay coin={coin} size={displaySize} />
              </div>
              <span className="text-[11px] font-bold text-slate-600">
                {cfg.name} <span className="text-slate-400 font-normal">({cfg.valueLabel})</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SvgCoin: React.FC<CoinProps> = ({
  coin,
  coins,
  size,
  questionIndex,
  isFirstQuestion,
  isAnswerRevealed,
  showExpiredAnswer,
}) => {
  const isFirst =
    isFirstQuestion ?? (questionIndex !== undefined ? questionIndex === 0 : true);
  const isRevealed = Boolean(isAnswerRevealed || showExpiredAnswer);
  const shouldShowTray = isFirst || isRevealed;

  if (coins && coins.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-lg">
        <div
          className="flex flex-wrap items-center justify-center gap-3 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 shadow-inner w-full"
          aria-label="Collection of US coins"
        >
          {coins.map((c, idx) => (
            <SingleCoinPhoto key={`${c}-${idx}`} coin={c} size={size} />
          ))}
        </div>
        {shouldShowTray && <ScaleReferenceTray />}
      </div>
    );
  }

  const singleCoin = coin || 'quarter';
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg">
      <div className="p-2">
        <SingleCoinPhoto coin={singleCoin} size={size} />
      </div>
      {shouldShowTray && <ScaleReferenceTray />}
    </div>
  );
};
