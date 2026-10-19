export type VisualWidgetType =
  | 'math-text'       // Math equations/formulas (e.g., "4 + 5 = ?")
  | 'text-flashcard'  // Sight words, letters, vocabulary prompts
  | 'svg-shape'       // Procedural 2D & 3D geometric shapes
  | 'svg-clock'       // Analog clock face with configurable hands
  | 'svg-dot-grid'    // Counting dots/counters up to 20
  | 'choice-grid';    // Visual/text choice tiles (rhymes, opposites, etc.)

export type KeypadType = 'numeric' | 'alphabet' | 'choice' | 'none';

export type GradeBand = 'Pre-K' | 'K' | '1st' | '2nd' | '3rd';

export type TopicCategory = 'math' | 'language-arts' | 'logic';

export interface TopicDefinition {
  id: string;
  title: string;
  category: TopicCategory;
  gradeBand: GradeBand;
  description: string;
  icon: string;
  defaultKeypadType: KeypadType;
  readAloudDefault?: boolean;
}

export interface QuizItem {
  id: string;
  topicId: string;
  gradeBand: GradeBand;

  // Visual configuration
  widget: {
    type: VisualWidgetType;
    primaryText?: string;
    params?: Record<string, any>;
  };

  // Audio / Speech Prompt
  narration?: {
    spokenPrompt?: string;
    autoPlay: boolean;
  };

  // Speech Recognition & Evaluation
  acceptedAnswers: string[];

  // Fallback UI
  keypad: {
    type: KeypadType;
    choices?: string[];
  };
}

export interface QuizEngineState {
  currentTopic: TopicDefinition | null;
  items: QuizItem[];
  currentIndex: number;
  readAloudEnabled: boolean;
}

export interface IQuizRepository {
  getTopics(): Promise<TopicDefinition[]>;
  getTopicDeck(topicId: string): Promise<QuizItem[]>;
  getRandomSession(topicId: string, count: number): Promise<QuizItem[]>;
}
