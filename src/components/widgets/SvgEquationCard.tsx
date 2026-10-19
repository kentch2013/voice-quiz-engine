import React from 'react';
import type { EquationProps } from '../../types/quiz';

export const SvgEquationCard: React.FC<EquationProps> = ({
  operandA,
  operandB,
  operator = '+',
  sequence = [],
  displayFormat = 'equation',
}) => {
  if (displayFormat === 'sequence') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-indigo-50/80 rounded-2xl border-2 border-indigo-200">
        {sequence.map((item, idx) => {
          const isBlank = item === '___' || item === '?';
          return (
            <div
              key={idx}
              className={`px-4 py-3 rounded-2xl font-black text-2xl sm:text-3xl transition-all shadow-sm ${
                isBlank
                  ? 'bg-amber-100 text-amber-700 border-2 border-dashed border-amber-400 animate-pulse'
                  : 'bg-white text-indigo-900 border-2 border-indigo-200'
              }`}
            >
              {item}
            </div>
          );
        })}
      </div>
    );
  }

  if (displayFormat === 'comparison') {
    return (
      <div className="flex items-center justify-center gap-4 sm:gap-8 p-4">
        <div className="flex-1 bg-white border-4 border-indigo-200 hover:border-indigo-400 rounded-3xl p-6 text-center shadow-lg transition-all">
          <span className="text-4xl sm:text-5xl font-black text-indigo-900">
            {operandA}
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-black text-indigo-400 uppercase tracking-widest px-2">
          {operator === 'vs' ? 'VS' : operator}
        </div>

        <div className="flex-1 bg-white border-4 border-indigo-200 hover:border-indigo-400 rounded-3xl p-6 text-center shadow-lg transition-all">
          <span className="text-4xl sm:text-5xl font-black text-indigo-900">
            {operandB}
          </span>
        </div>
      </div>
    );
  }

  // Default: equation format e.g. 4 + 5 = ?
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 rounded-3xl border-2 border-indigo-200 shadow-inner">
      <span className="text-4xl sm:text-6xl font-black text-indigo-950">
        {operandA}
      </span>
      <span className="text-3xl sm:text-5xl font-black text-purple-600">
        {operator}
      </span>
      <span className="text-4xl sm:text-6xl font-black text-indigo-950">
        {operandB}
      </span>
      <span className="text-3xl sm:text-5xl font-black text-purple-600">
        =
      </span>
      <span className="text-4xl sm:text-6xl font-black text-amber-600 bg-amber-100 px-4 py-1 rounded-2xl border-2 border-dashed border-amber-400">
        ?
      </span>
    </div>
  );
};
