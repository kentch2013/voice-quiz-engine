import type { QuizModule } from '../types';
import type { GradeBand, QuizItem } from '../../types/quiz';

const HOUR_WORDS: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
};

export function generateClockItems(gradeBand: GradeBand = 'K-1', count: number = 10): QuizItem[] {
  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    let hours = Math.floor(Math.random() * 12) + 1;
    let minutes = 0;

    if (gradeBand === 'K-1') {
      minutes = i % 2 === 0 ? 0 : 30;
    } else if (gradeBand === '2-3') {
      minutes = [0, 15, 30, 45][i % 4];
    } else {
      minutes = (i * 5) % 60;
    }

    const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;
    const hourWord = HOUR_WORDS[hours] || hours.toString();
    const nextHour = hours % 12 + 1;
    const nextHourWord = HOUR_WORDS[nextHour] || nextHour.toString();

    const acceptableSet = new Set<string | number>([
      timeStr,
      hours,
      hours.toString(),
    ]);

    if (minutes === 0) {
      acceptableSet.add(`${hours}:00`);
      acceptableSet.add(hourWord);
      acceptableSet.add(`${hours} o'clock`);
      acceptableSet.add(`${hours} oclock`);
      acceptableSet.add(`${hourWord} o'clock`);
      acceptableSet.add(`${hourWord} oclock`);
    } else if (minutes === 30) {
      acceptableSet.add(`${hours}:30`);
      acceptableSet.add(`${hours} 30`);
      acceptableSet.add(`${hours}-30`);
      acceptableSet.add(`${hourWord} thirty`);
      acceptableSet.add(`${hourWord}-thirty`);
      acceptableSet.add(`half past ${hours}`);
      acceptableSet.add(`half past ${hourWord}`);
    } else if (minutes === 15) {
      acceptableSet.add(`${hours}:15`);
      acceptableSet.add(`${hours} 15`);
      acceptableSet.add(`${hourWord} fifteen`);
      acceptableSet.add(`quarter past ${hours}`);
      acceptableSet.add(`quarter past ${hourWord}`);
    } else if (minutes === 45) {
      acceptableSet.add(`${hours}:45`);
      acceptableSet.add(`${hours} 45`);
      acceptableSet.add(`${hourWord} forty five`);
      acceptableSet.add(`${hourWord} forty-five`);
      acceptableSet.add(`quarter to ${nextHour}`);
      acceptableSet.add(`quarter to ${nextHourWord}`);
    }

    items.push({
      id: `clock-${i}-${Date.now()}`,
      topicId: 'clock-reading',
      gradeBand,
      prompt: `What time is shown on the clock?`,
      ttsPrompt: `What time is shown on the clock?`,
      ttsPromptConcise: ``,
      ttsPromptZh: `钟表上显示的是几点?`,
      ttsPromptZhConcise: ``,
      expectedAnswer: timeStr,
      acceptableAnswers: Array.from(acceptableSet),
      widget: {
        type: 'clock',
        clockProps: {
          hours,
          minutes,
          showDigital: false,
        },
      },
      keypad: {
        type: 'numeric',
      },
    });
  }

  return items;
}

export const clockReadingModule: QuizModule = {
  topic: {
    id: 'clock-reading',
    title: '🕒 Clock Reading',
    description: 'Read analog clock faces and tell the exact time.',
    icon: '🕒',
    gradeBands: ['K-1', '2-3', '4-5'],
  },
  generate: generateClockItems,
};
