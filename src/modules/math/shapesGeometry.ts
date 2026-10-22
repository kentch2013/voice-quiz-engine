import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

export function generateShapeItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const shapeDefs: { name: string; acceptable: string[] }[] = [
    { name: 'circle', acceptable: ['circle', 'Circle'] },
    { name: 'square', acceptable: ['square', 'Square'] },
    { name: 'triangle', acceptable: ['triangle', 'Triangle'] },
    { name: 'rectangle', acceptable: ['rectangle', 'Rectangle'] },
    { name: 'oval', acceptable: ['oval', 'Oval', 'ellipse', 'Ellipse'] },
    { name: 'diamond', acceptable: ['diamond', 'Diamond', 'rhombus', 'Rhombus'] },
    { name: 'star', acceptable: ['star', 'Star'] },
    { name: 'heart', acceptable: ['heart', 'Heart'] },
    { name: 'pentagon', acceptable: ['pentagon', 'Pentagon'] },
    { name: 'hexagon', acceptable: ['hexagon', 'Hexagon'] },
    { name: 'octagon', acceptable: ['octagon', 'Octagon'] },
    { name: 'cube', acceptable: ['cube', 'Cube'] },
    { name: 'sphere', acceptable: ['sphere', 'Sphere', 'ball'] },
    { name: 'cylinder', acceptable: ['cylinder', 'Cylinder', 'can'] },
    { name: 'cone', acceptable: ['cone', 'Cone'] },
  ];

  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const targetDef = shapeDefs[i % shapeDefs.length];
    const shapeName = targetDef.name;

    const distractors = shapeDefs
      .filter((s) => s.name !== shapeName)
      .map((s) => s.name);

    // Pick 3 distractors
    const chosenDistractors = distractors
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [shapeName, ...chosenDistractors]
      .sort(() => Math.random() - 0.5)
      .map((name) => ({
        id: name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
        value: name,
      }));

    items.push({
      id: `shape-${i}-${Date.now()}`,
      topicId: 'shapes-geometry',
      gradeBand,
      prompt: `What shape is this?`,
      ttsPrompt: `What shape is this?`,
      ttsPromptConcise: ``,
      ttsPromptZh: `这是什么形状？`,
      ttsPromptZhConcise: ``,
      expectedAnswer: shapeName,
      acceptableAnswers: Array.from(
        new Set([shapeName, shapeName.toLowerCase(), shapeName.toUpperCase(), ...targetDef.acceptable])
      ),
      widget: {
        type: 'shape',
        shapeProps: {
          shape: shapeName as any,
          color: ['#4f46e5', '#059669', '#d97706', '#dc2626'][i % 4],
          size: 180,
        },
      },
      keypad: {
        type: 'choice',
        options,
      },
    });
  }

  return items;
}

export const shapesGeometryModule: QuizModule = {
  topic: {
    id: 'shapes-geometry',
    title: '📐 Shapes & Geometry',
    description: 'Identify 2D shapes and 3D geometric figures.',
    icon: '📐',
    gradeBands: ['K-1', '2-3', '4-5'],
  },
  generate: generateShapeItems,
};
