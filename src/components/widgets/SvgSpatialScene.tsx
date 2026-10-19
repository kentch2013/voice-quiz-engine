import React from 'react';
import type { SpatialSceneProps } from '../../types/quiz';

export const SvgSpatialScene: React.FC<SpatialSceneProps> = ({
  subject,
  target,
  preposition,
  subjectEmoji = '🐱',
  targetEmoji = '🪑',
}) => {
  // Compute positions based on preposition
  // Canvas width = 320, height = 200, center = (160, 100)
  let targetPos = { x: 160, y: 120 };
  let subjectPos = { x: 160, y: 60 };

  switch (preposition) {
    case 'under':
      targetPos = { x: 160, y: 85 };
      subjectPos = { x: 160, y: 145 };
      break;
    case 'on':
      targetPos = { x: 160, y: 130 };
      subjectPos = { x: 160, y: 75 };
      break;
    case 'above':
      targetPos = { x: 160, y: 140 };
      subjectPos = { x: 160, y: 50 };
      break;
    case 'in':
      targetPos = { x: 160, y: 110 };
      subjectPos = { x: 160, y: 105 };
      break;
    case 'behind':
      targetPos = { x: 175, y: 110 };
      subjectPos = { x: 140, y: 100 };
      break;
    case 'next to':
      targetPos = { x: 210, y: 110 };
      subjectPos = { x: 110, y: 110 };
      break;
  }

  const ariaLabel = `${subject} ${preposition} ${target}`;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg
        width="320"
        height="200"
        viewBox="0 0 320 200"
        className="bg-gradient-to-b from-sky-100 to-indigo-50 rounded-2xl border-2 border-indigo-200 shadow-inner"
        role="img"
        aria-label={ariaLabel}
      >
        {/* Ground reference line if relevant */}
        <line
          x1="20"
          y1="175"
          x2="300"
          y2="175"
          stroke="#cbd5e1"
          strokeWidth="3"
          strokeDasharray="6 4"
        />

        {/* If 'behind', subject renders before target */}
        {preposition === 'behind' ? (
          <>
            <text
              x={subjectPos.x}
              y={subjectPos.y}
              fontSize="48"
              textAnchor="middle"
              dominantBaseline="central"
              className="opacity-75"
            >
              {subjectEmoji}
            </text>
            <text
              x={targetPos.x}
              y={targetPos.y}
              fontSize="64"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {targetEmoji}
            </text>
          </>
        ) : (
          <>
            <text
              x={targetPos.x}
              y={targetPos.y}
              fontSize="64"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {targetEmoji}
            </text>
            <text
              x={subjectPos.x}
              y={subjectPos.y}
              fontSize="48"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {subjectEmoji}
            </text>
          </>
        )}

        {/* Caption text */}
        <text
          x="160"
          y="188"
          fontSize="14"
          fontWeight="bold"
          fill="#475569"
          textAnchor="middle"
        >
          {subject.charAt(0).toUpperCase() + subject.slice(1)} & {target}
        </text>
      </svg>
    </div>
  );
};
