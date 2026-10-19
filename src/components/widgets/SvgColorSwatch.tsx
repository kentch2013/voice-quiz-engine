import React from 'react';
import type { ColorSwatchProps } from '../../types/quiz';

export const SvgColorSwatch: React.FC<ColorSwatchProps> = ({
  colorName,
  hexColor,
  label,
}) => {
  return (
    <div className="w-full max-w-xs mx-auto my-2 flex flex-col items-center justify-center">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl p-4 bg-white border-4 border-slate-200 shadow-xl flex items-center justify-center transition-all hover:scale-105">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full rounded-2xl drop-shadow-md"
          role="img"
          aria-label={`Color swatch for ${colorName}`}
        >
          {/* Outer Rounded Box */}
          <rect
            x="10"
            y="10"
            width="180"
            height="180"
            rx="24"
            fill={hexColor}
            stroke="#ffffff"
            strokeWidth="6"
          />

          {/* Paint Splash Decorative Swirls / Accents */}
          <path
            d="M 30 50 Q 80 20 140 40 Q 180 80 150 140 Q 100 180 50 150 Q 20 100 30 50 Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            opacity="0.25"
          />

          {/* Center highlight circle */}
          <circle cx="70" cy="70" r="16" fill="#ffffff" opacity="0.3" />
        </svg>
      </div>

      {label && (
        <span className="mt-3 text-sm font-extrabold text-slate-600 uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};
