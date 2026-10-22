import type { QuizItem } from '../types/quiz';
import { TOPICS, generateQuizItems, LETTER_SPOKEN_NAMES } from '../modules';

export { TOPICS, generateQuizItems, LETTER_SPOKEN_NAMES };

export function getTTSPrompt(
  item: QuizItem,
  language: 'en-US' | 'zh-CN',
  index: number
): string {
  const isConcise = index > 0;

  if (language === 'zh-CN') {
    if (isConcise && item.ttsPromptZhConcise !== undefined) {
      return item.ttsPromptZhConcise;
    }
    if (item.ttsPromptZh) {
      return item.ttsPromptZh;
    }
    return item.prompt;
  }

  if (isConcise && item.ttsPromptConcise !== undefined) {
    return item.ttsPromptConcise;
  }
  return item.ttsPrompt || item.prompt;
}
