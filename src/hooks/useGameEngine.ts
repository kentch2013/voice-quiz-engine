import { useState, useEffect, useRef, useCallback } from 'react';
import type { MathProblem, QuestionResult, GameSession } from '../types';
import type { QuizItem, GradeBand } from '../types/quiz';
import { generateQuizItems, getTTSPrompt } from '../utils/quizGenerator';
import { checkUtteranceMatchesAnswer } from '../utils/numberWords';
import { playCorrectChime } from '../utils/audioSynthesizer';
import { useVoiceRecognition, type VoiceLanguage } from './useVoiceRecognition';
import { useTTS } from './useTTS';

export type GameStatus = 'lobby' | 'playing' | 'completed';

export const QUESTION_TIME_LIMIT = 30; // 30 seconds
export const SILENCE_NUDGE_TIME = 10;   // 10 seconds silence detection nudge
export const AUTO_RESTART_TIME = 15;   // 15 seconds session restart countdown

export function useGameEngine() {
  const [status, setStatus] = useState<GameStatus>('lobby');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('math-sprint');
  const [selectedGradeBand, setSelectedGradeBand] = useState<GradeBand>('K-1');
  const [readAloudEnabled, setReadAloudEnabled] = useState<boolean>(true);

  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [language, setLanguage] = useState<VoiceLanguage>('en-US');

  // Timers
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(QUESTION_TIME_LIMIT);
  const [showSilenceNudge, setShowSilenceNudge] = useState<boolean>(false);
  const [restartCountdown, setRestartCountdown] = useState<number>(AUTO_RESTART_TIME);

  // Expired answer display state
  const [showExpiredAnswer, setShowExpiredAnswer] = useState<boolean>(false);

  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [keypadInput, setKeypadInput] = useState<string>('');
  const [session, setSession] = useState<GameSession | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());
  const silenceTimeRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);

  const currentItem: QuizItem | undefined = quizItems[currentIndex];

  // Legacy MathProblem compatibility getter
  const currentProblem: MathProblem | undefined = currentItem
    ? {
        id: currentItem.id,
        operandA: currentItem.operandA ?? 0,
        operandB: currentItem.operandB ?? 0,
        expectedAnswer: typeof currentItem.expectedAnswer === 'number' ? currentItem.expectedAnswer : 0,
      }
    : undefined;

  const currentItemRef = useRef<QuizItem | undefined>(currentItem);
  const statusRef = useRef<GameStatus>(status);
  const finishGameRef = useRef<(finalResults: QuestionResult[]) => void>(() => {});
  const resetTranscriptRef = useRef<() => void>(() => {});

  useEffect(() => {
    currentItemRef.current = currentItem;
    statusRef.current = status;
  }, [currentItem, status]);

  // Voice recognition hook
  const handleVoiceTranscript = useCallback((text: string) => {
    const activeStatus = statusRef.current;
    const activeItem = currentItemRef.current;

    if (activeStatus !== 'playing' || !text || isTransitioningRef.current || !activeItem) return;

    silenceTimeRef.current = 0;
    setShowSilenceNudge(false);

    // Evaluate whole sentence or any substring token against expected answer
    const expected = activeItem.expectedAnswer;
    const isStringMatch =
      typeof expected === 'string' &&
      text.toLowerCase().includes(expected.toString().toLowerCase());

    const isNumberMatch =
      typeof expected === 'number' &&
      checkUtteranceMatchesAnswer(text, expected);

    const isAcceptableMatch =
      activeItem.acceptableAnswers?.some((acc) => {
        if (typeof acc === 'number') {
          return checkUtteranceMatchesAnswer(text, acc);
        }
        return text.toLowerCase().includes(acc.toString().toLowerCase());
      }) ?? false;

    if (isStringMatch || isNumberMatch || isAcceptableMatch) {
      submitAnswerRef.current(expected, 'voice');
    }
  }, []);

  const voiceRecognition = useVoiceRecognition({
    onTranscriptChange: handleVoiceTranscript,
    language,
  });

  // TTS Hook with audio pipeline microphone mute guard
  const tts = useTTS({
    language,
    onSpeechStart: () => {
      // Temporarily pause mic listening while TTS reads prompt
      voiceRecognition.stopListening();
    },
    onSpeechEnd: () => {
      // Resume mic listening when audio finishes
      if (statusRef.current === 'playing') {
        voiceRecognition.startListening();
      }
    },
  });

  // Auto read prompt when item changes and TTS read-aloud is enabled
  useEffect(() => {
    if (status === 'playing' && currentItem && readAloudEnabled) {
      const textToRead = getTTSPrompt(currentItem, language, currentIndex);
      tts.speak(textToRead);
    }
  }, [currentIndex, status, readAloudEnabled, currentItem, language]);

  // Submit an answer (voice, keypad, choice, or timeout)
  const submitAnswer = useCallback(
    (
      answer: number | string | undefined,
      inputMethod: 'voice' | 'keypad' | 'choice' | 'timeout'
    ) => {
      if (!currentItem || status !== 'playing' || isTransitioningRef.current) return;

      const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));

      const expectedStr = currentItem.expectedAnswer.toString().toLowerCase().trim();
      const answerStr = answer !== undefined ? answer.toString().toLowerCase().trim() : '';

      const isCorrect =
        answerStr === expectedStr ||
        (currentItem.acceptableAnswers?.some(
          (acc) => acc.toString().toLowerCase().trim() === answerStr
        ) ?? false);

      if (!isCorrect && inputMethod !== 'timeout') {
        setAttemptsCount((prev) => prev + 1);
        return;
      }

      if (isCorrect) {
        playCorrectChime();
      }

      const newResult: QuestionResult = {
        questionId: currentItem.id,
        problem: currentItem.prompt,
        expectedAnswer: currentItem.expectedAnswer,
        userAnswer: answer,
        isCorrect,
        timeSpentSeconds: timeSpent,
        inputMethod,
        attemptsCount: attemptsCount + 1,
      };

      const updatedResults = [...results, newResult];
      setResults(updatedResults);

      const advanceToNext = () => {
        resetTranscriptRef.current();
        setKeypadInput('');
        setAttemptsCount(0);
        setShowSilenceNudge(false);
        setShowExpiredAnswer(false);
        silenceTimeRef.current = 0;
        isTransitioningRef.current = false;

        const nextIndex = currentIndex + 1;
        if (nextIndex < quizItems.length) {
          setCurrentIndex(nextIndex);
          setQuestionTimeLeft(QUESTION_TIME_LIMIT);
          questionStartTimeRef.current = Date.now();
        } else {
          finishGameRef.current(updatedResults);
        }
      };

      resetTranscriptRef.current();

      if (inputMethod === 'timeout') {
        isTransitioningRef.current = true;
        setShowExpiredAnswer(true);
        setTimeout(() => {
          advanceToNext();
        }, 3000);
      } else {
        advanceToNext();
      }
    },
    [currentItem, status, attemptsCount, results, currentIndex, quizItems.length]
  );

  const submitAnswerRef = useRef(submitAnswer);
  useEffect(() => {
    submitAnswerRef.current = submitAnswer;
  }, [submitAnswer]);

  useEffect(() => {
    resetTranscriptRef.current = voiceRecognition.resetTranscript;
  }, [voiceRecognition.resetTranscript]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en-US' ? 'zh-CN' : 'en-US'));
  }, []);

  // Start new game session
  const startGame = useCallback(() => {
    const items = generateQuizItems(selectedTopicId, selectedGradeBand, 10);
    setQuizItems(items);
    setCurrentIndex(0);
    setResults([]);
    setStatus('playing');
    setQuestionTimeLeft(QUESTION_TIME_LIMIT);
    setShowSilenceNudge(false);
    setShowExpiredAnswer(false);
    silenceTimeRef.current = 0;
    setAttemptsCount(0);
    setKeypadInput('');
    setRestartCountdown(AUTO_RESTART_TIME);
    isTransitioningRef.current = false;

    const now = Date.now();
    startTimeRef.current = now;
    questionStartTimeRef.current = now;

    voiceRecognition.resetTranscript();
    voiceRecognition.startListening();
  }, [selectedTopicId, selectedGradeBand, voiceRecognition]);

  // Finish current game session
  const finishGame = useCallback(
    (finalResults: QuestionResult[]) => {
      tts.stop();
      voiceRecognition.stopListening();
      setStatus('completed');
      const correctCount = finalResults.filter((r) => r.isCorrect).length;
      const totalDurationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      const completedSession: GameSession = {
        sessionId: `session-${Date.now()}`,
        startedAt: new Date(startTimeRef.current).toISOString(),
        completedAt: new Date().toISOString(),
        totalQuestions: finalResults.length,
        correctCount,
        totalDurationSeconds,
        results: finalResults,
        topicId: selectedTopicId,
        gradeBand: selectedGradeBand,
      };

      setSession(completedSession);
      setRestartCountdown(AUTO_RESTART_TIME);
    },
    [selectedTopicId, selectedGradeBand, tts, voiceRecognition]
  );

  useEffect(() => {
    finishGameRef.current = finishGame;
  }, [finishGame]);

  const returnToLobby = useCallback(() => {
    tts.stop();
    voiceRecognition.stopListening();
    setStatus('lobby');
  }, [tts, voiceRecognition]);

  // Timers
  useEffect(() => {
    if (status !== 'playing') return;

    const timer = setInterval(() => {
      if (isTransitioningRef.current) return;

      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          submitAnswer(undefined, 'timeout');
          return 0;
        }
        return prev - 1;
      });

      silenceTimeRef.current += 1;
      if (silenceTimeRef.current >= SILENCE_NUDGE_TIME) {
        setShowSilenceNudge(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status, submitAnswer]);

  useEffect(() => {
    if (status !== 'completed') return;

    const autoRestartTimer = setInterval(() => {
      setRestartCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(autoRestartTimer);
          startGame();
          return AUTO_RESTART_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(autoRestartTimer);
  }, [status, startGame]);

  return {
    status,
    selectedTopicId,
    setSelectedTopicId,
    selectedGradeBand,
    setSelectedGradeBand,
    readAloudEnabled,
    setReadAloudEnabled,
    currentItem,
    currentProblem,
    currentIndex,
    totalQuestions: quizItems.length || 10,
    results,
    questionTimeLeft,
    showSilenceNudge,
    showExpiredAnswer,
    restartCountdown,
    keypadInput,
    setKeypadInput,
    session,
    language,
    setLanguage,
    toggleLanguage,
    voiceRecognition,
    tts,
    startGame,
    submitAnswer,
    returnToLobby,
  };
}
