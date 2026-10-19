export type GradeBand = 'K-1' | '2-3' | '4-5';

export type KeypadType = 'numeric' | 'alphabet' | 'choice' | 'none';

export type WidgetType = 'shape' | 'clock' | 'dotgrid' | 'flashcard' | 'choice' | 'none';

export interface QuizOption {
  id: string;
  label: string;
  value: string;
}

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'cylinder' | 'cube';

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

export interface WidgetConfig {
  type: WidgetType;
  shapeProps?: ShapeProps;
  clockProps?: ClockProps;
  dotGridProps?: DotGridProps;
  flashcardProps?: FlashcardProps;
  choiceProps?: ChoiceGridProps;
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
