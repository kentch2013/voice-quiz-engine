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

const SingleCoinPhoto: React.FC<{ coin: CoinType; size?: number }> = ({ coin, size }) => {
  const cfg = COIN_DETAILS[coin] || COIN_DETAILS.quarter;
  const dimension = size ? Math.round(cfg.diameter * (size / 68)) : cfg.diameter;

  return (
    <div
      className="flex flex-col items-center justify-center p-1 select-none"
      aria-label={`US ${cfg.name}`}
    >
      <img
        src={`/assets/coins/${coin}.png`}
        alt={`US ${cfg.name}`}
        width={dimension}
        height={dimension}
        style={{ width: `${dimension}px`, height: `${dimension}px` }}
        className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)] object-contain transition-transform duration-200 hover:scale-105"
      />
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
              <img
                src={`/assets/coins/${coin}.png`}
                alt={`Reference ${cfg.name}`}
                width={displaySize}
                height={displaySize}
                style={{ width: `${displaySize}px`, height: `${displaySize}px` }}
                className="drop-shadow-sm select-none object-contain"
              />
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

export const SvgCoin: React.FC<CoinProps> = ({ coin, coins, size }) => {
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
        <ScaleReferenceTray />
      </div>
    );
  }

  const singleCoin = coin || 'quarter';
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg">
      <div className="p-2">
        <SingleCoinPhoto coin={singleCoin} size={size} />
      </div>
      <ScaleReferenceTray />
    </div>
  );
};
