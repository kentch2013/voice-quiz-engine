import React from 'react';
import type { ChoiceGridProps } from '../../types/quiz';

export const ChoiceGrid: React.FC<ChoiceGridProps> = ({
  options,
  selectedOptionId,
  onSelectOption,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto grid grid-cols-2 gap-4 p-2">
      {options.map((opt) => {
        const isSelected = selectedOptionId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectOption && onSelectOption(opt)}
            className={`p-6 rounded-2xl border-4 text-center font-black text-2xl transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer min-h-[80px] ${
              isSelected
                ? 'bg-indigo-600 text-white border-indigo-800 ring-4 ring-indigo-300'
                : 'bg-white hover:bg-indigo-50 text-indigo-950 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
