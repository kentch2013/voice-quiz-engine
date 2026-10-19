import React from 'react';
import type { ClockProps } from '../../types/quiz';

export const SvgClock: React.FC<ClockProps> = ({
  hours,
  minutes,
  showDigital = true,
}) => {
  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 12;

  // Trigonometric angle calculations (12 o'clock is -90 degrees or -PI/2)
  const minuteAngle = (minutes / 60) * 360;
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

  const minuteRad = ((minuteAngle - 90) * Math.PI) / 180;
  const hourRad = ((hourAngle - 90) * Math.PI) / 180;

  const minuteHandLength = radius * 0.75;
  const hourHandLength = radius * 0.5;

  const minuteX = center + minuteHandLength * Math.cos(minuteRad);
  const minuteY = center + minuteHandLength * Math.sin(minuteRad);

  const hourX = center + hourHandLength * Math.cos(hourRad);
  const hourY = center + hourHandLength * Math.sin(hourRad);

  // Hour numerals (1..12)
  const numerals = Array.from({ length: 12 }, (_, i) => i + 1);

  const formattedDigital = `${hours % 12 === 0 ? 12 : hours % 12}:${minutes.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-lg"
      >
        {/* Outer Clock Face */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#ffffff"
          stroke="#312e81"
          strokeWidth="6"
        />

        {/* Inner ring decoration */}
        <circle
          cx={center}
          cy={center}
          r={radius - 8}
          fill="none"
          stroke="#e0e7ff"
          strokeWidth="2"
        />

        {/* Hour markers and numbers */}
        {numerals.map((num) => {
          const angleRad = (((num * 30 - 90) * Math.PI) / 180);
          const textRadius = radius - 22;
          const x = center + textRadius * Math.cos(angleRad);
          const y = center + textRadius * Math.sin(angleRad);
          return (
            <text
              key={num}
              x={x}
              y={y + 5}
              textAnchor="middle"
              className="text-xs font-black fill-indigo-950 select-none"
              style={{ fontSize: '13px' }}
            >
              {num}
            </text>
          );
        })}

        {/* Hour Hand */}
        <line
          x1={center}
          y1={center}
          x2={hourX}
          y2={hourY}
          stroke="#312e81"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Minute Hand */}
        <line
          x1={center}
          y1={center}
          x2={minuteX}
          y2={minuteY}
          stroke="#e11d48"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Center pin */}
        <circle cx={center} cy={center} r="6" fill="#312e81" />
        <circle cx={center} cy={center} r="2" fill="#ffffff" />
      </svg>

      {showDigital && (
        <div className="mt-3 px-4 py-1.5 bg-indigo-50 border-2 border-indigo-200 rounded-xl text-lg font-black text-indigo-900 tracking-wider">
          {formattedDigital}
        </div>
      )}
    </div>
  );
};
