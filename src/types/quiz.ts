export type GradeBand = 'K-1' | '2-3' | '4-5';

export type KeypadType = 'numeric' | 'alphabet' | 'choice' | 'none';

export type WidgetType =
  | 'shape'
  | 'clock'
  | 'dotgrid'
  | 'flashcard'
  | 'choice'
  | 'tenframe'
  | 'placevalue'
  | 'coin'
  | 'equation'
  | 'colorswatch'
  | 'spatialscene'
  | 'none';

export interface QuizOption {
  id: string;
  label: string;
  value: string;
}

export type ShapeType =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'rectangle'
  | 'oval'
  | 'diamond'
  | 'rhombus'
  | 'star'
  | 'heart'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'cube'
  | 'sphere'
  | 'cylinder'
  | 'cone';

export interface ShapeProps {
  shape: ShapeType;
  color?: string;
  size?: number;
  rotation?: number;
}

export interface ClockProps {
  hours: number;
  minutes: number;
  showDigital?: boolean;
}

export interface DotGridProps {
  count: number;
  layout?: 'grid' | 'scattered';
  color?: string;
}

export interface FlashcardProps {
  text: string;
  subtext?: string;
  category?: 'sight-word' | 'letter' | 'phonics';
  fontSize?: string;
}

export interface ChoiceGridProps {
  options: QuizOption[];
  selectedOptionId?: string;
  onSelectOption?: (option: QuizOption) => void;
}

export interface TenFrameProps {
  count: number;
  total?: number;
  color?: string;
}

export interface PlaceValueProps {
  tens: number;
  ones: number;
}

export type CoinType = 'penny' | 'nickel' | 'dime' | 'quarter';

export interface CoinProps {
  coin?: CoinType;
  coins?: CoinType[];
  size?: number;
  questionIndex?: number;
  isFirstQuestion?: boolean;
  isAnswerRevealed?: boolean;
  showExpiredAnswer?: boolean;
}

export interface EquationProps {
  operandA?: number | string;
  operandB?: number | string;
  operator?: '+' | '-' | '×' | '÷' | '=' | '?' | 'vs' | '___';
  sequence?: (number | string)[];
  displayFormat?: 'equation' | 'sequence' | 'comparison';
}

export interface ColorSwatchProps {
  colorName: string;
  hexColor: string;
  label?: string;
}

export interface SpatialSceneProps {
  subject: string;
  target: string;
  preposition: 'under' | 'on' | 'in' | 'above' | 'behind' | 'next to';
  subjectEmoji?: string;
  targetEmoji?: string;
}

export interface WidgetConfig {
  type: WidgetType;
  shapeProps?: ShapeProps;
  clockProps?: ClockProps;
  dotGridProps?: DotGridProps;
  flashcardProps?: FlashcardProps;
  choiceProps?: ChoiceGridProps;
  tenFrameProps?: TenFrameProps;
  placeValueProps?: PlaceValueProps;
  coinProps?: CoinProps;
  equationProps?: EquationProps;
  colorSwatchProps?: ColorSwatchProps;
  spatialSceneProps?: SpatialSceneProps;
}

export interface KeypadConfig {
  type: KeypadType;
  options?: QuizOption[];
}

export interface QuizItem {
  id: string;
  topicId: string;
  gradeBand: GradeBand;
  prompt: string;
  ttsPrompt?: string;
  ttsPromptConcise?: string;
  ttsPromptZh?: string;
  ttsPromptZhConcise?: string;
  expectedAnswer: string | number;
  acceptableAnswers?: (string | number)[];
  widget?: WidgetConfig;
  keypad?: KeypadConfig;
  operandA?: number;
  operandB?: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradeBands: GradeBand[];
}
