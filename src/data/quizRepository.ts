import type { IQuizRepository, QuizItem, TopicDefinition } from '../types/quiz';
import { TOPIC_REGISTRY } from './topicRegistry';

// Seed decks for Phase 1
import additionSingle from './topics/addition-single.json';
import countingDots from './topics/counting-dots.json';
import shapesNaming from './topics/shapes-naming.json';
import tellingTime from './topics/telling-time.json';
import sightWords from './topics/sight-words.json';

const SEED_DECKS: Record<string, QuizItem[]> = {
  'addition-single': additionSingle as QuizItem[],
  'counting-dots': countingDots as QuizItem[],
  'shapes-naming': shapesNaming as QuizItem[],
  'telling-time': tellingTime as QuizItem[],
  'sight-words': sightWords as QuizItem[],
};

export class StaticJsonRepository implements IQuizRepository {
  async getTopics(): Promise<TopicDefinition[]> {
    return TOPIC_REGISTRY;
  }

  async getTopicDeck(topicId: string): Promise<QuizItem[]> {
    return SEED_DECKS[topicId] || [];
  }

  async getRandomSession(topicId: string, count: number = 10): Promise<QuizItem[]> {
    const deck = await this.getTopicDeck(topicId);
    if (!deck.length) return [];
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}

export const quizRepository = new StaticJsonRepository();
