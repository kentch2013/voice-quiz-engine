import React from 'react';
import type { FlashcardProps } from '../../types/quiz';

export const FlashcardWidget: React.FC<FlashcardProps> = ({
  text,
  subtext,
  category = 'sight-word',
  fontSize = '72px',
}) => {
  return (
    <div className="w-full max-w-sm mx-auto my-2 p-8 bg-amber-50 border-4 border-amber-200 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]">
      {category && (
        <span className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-200/80 px-3 py-1 rounded-full mb-4">
          {category.replace('-', ' ')}
        </span>
      )}

      <div
        className="font-black text-indigo-950 tracking-wide select-none my-2 drop-shadow-sm"
        style={{ fontSize, lineHeight: '1.1' }}
      >
        {text}
      </div>

      {subtext && (
        <p className="mt-2 text-base font-semibold text-slate-600 italic">
          {subtext}
        </p>
      )}
    </div>
  );
};
