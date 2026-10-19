import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import type { KeypadType, QuizOption } from '../../types/quiz';

interface AdaptiveKeypadProps {
  type?: KeypadType;
  options?: QuizOption[];
  value?: string;
  onKeyPress: (char: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onOptionSelect?: (option: QuizOption) => void;
}

export const AdaptiveKeypad: React.FC<AdaptiveKeypadProps> = ({
  type = 'numeric',
  options = [],
  value = '',
  onKeyPress,
  onDelete,
  onSubmit,
  onOptionSelect,
}) => {
  if (type === 'none') {
    return null;
  }

  if (type === 'choice' && options.length > 0) {
    return (
      <div className="w-full max-w-md mx-auto mt-4 p-4 bg-slate-100 rounded-3xl border-2 border-slate-200">
        <div className="text-center mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Select an option
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onOptionSelect && onOptionSelect(opt)}
              className="p-4 bg-white hover:bg-indigo-50 active:bg-indigo-100 text-indigo-900 font-bold text-xl rounded-2xl shadow border-2 border-slate-200 hover:border-indigo-300 active:scale-95 transition-all cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'alphabet') {
    const letters = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G',
      'H', 'I', 'J', 'K', 'L', 'M', 'N',
      'O', 'P', 'Q', 'R', 'S', 'T', 'U',
      'V', 'W', 'X', 'Y', 'Z'
    ];

    return (
      <div className="w-full max-w-lg mx-auto mt-4 p-4 bg-slate-100 rounded-3xl border-2 border-slate-200">
        <div className="text-center mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Alphabet Keypad
          </span>
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto p-1">
          {letters.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => onKeyPress(letter)}
              className="w-10 h-10 bg-white hover:bg-indigo-50 active:bg-indigo-100 text-indigo-900 font-bold text-lg rounded-xl shadow border-2 border-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
            >
              {letter}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center gap-3 mt-4">
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 h-12 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border-2 border-rose-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Delete size={20} /> Clear
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!value}
            className={`flex-1 h-12 ${
              value
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            } font-bold rounded-xl border-2 border-emerald-600 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all`}
          >
            <CornerDownLeft size={20} /> Submit
          </button>
        </div>
      </div>
    );
  }

  // Default: Numeric keypad
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="w-full max-w-xs mx-auto mt-4 p-4 bg-slate-100 rounded-3xl border-2 border-slate-200">
      <div className="text-center mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Touch Keypad
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 justify-items-center">
        {digits.slice(0, 9).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onKeyPress(num)}
            className="w-16 h-16 min-w-[64px] min-h-[64px] bg-white hover:bg-indigo-50 active:bg-indigo-100 text-indigo-900 text-2xl font-bold rounded-2xl shadow border-2 border-slate-200 hover:border-indigo-300 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={onDelete}
          className="w-16 h-16 min-w-[64px] min-h-[64px] bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-bold rounded-2xl shadow border-2 border-rose-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
          aria-label="Delete"
        >
          <Delete size={24} />
        </button>

        <button
          type="button"
          onClick={() => onKeyPress('0')}
          className="w-16 h-16 min-w-[64px] min-h-[64px] bg-white hover:bg-indigo-50 active:bg-indigo-100 text-indigo-900 text-2xl font-bold rounded-2xl shadow border-2 border-slate-200 hover:border-indigo-300 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
        >
          0
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!value}
          className={`w-16 h-16 min-w-[64px] min-h-[64px] ${
            value
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          } font-bold rounded-2xl border-2 border-emerald-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none`}
          aria-label="Enter"
        >
          <CornerDownLeft size={24} />
        </button>
      </div>
    </div>
  );
};
