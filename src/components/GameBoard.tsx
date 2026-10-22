import React from 'react';
import { Mic, MicOff, Volume2, Timer, MessageSquareHeart } from 'lucide-react';
import type { QuizItem } from '../types/quiz';
import type { VoiceLanguage } from '../hooks/useVoiceRecognition';
import { LanguageToggle } from './LanguageToggle';
import { SvgShape } from './widgets/SvgShape';
import { SvgClock } from './widgets/SvgClock';
import { SvgDotGrid } from './widgets/SvgDotGrid';
import { FlashcardWidget } from './widgets/FlashcardWidget';
import { ChoiceGrid } from './widgets/ChoiceGrid';
import { SvgTenFrame } from './widgets/SvgTenFrame';
import { SvgPlaceValueBlocks } from './widgets/SvgPlaceValueBlocks';
import { SvgCoin } from './widgets/SvgCoin';
import { SvgEquationCard } from './widgets/SvgEquationCard';
import { SvgSpatialScene } from './widgets/SvgSpatialScene';
import { NumberSnakeGame } from './widgets/NumberSnakeGame';
import { LetterHeroGame } from './widgets/LetterHeroGame';
import { PlinkoBonusGame } from './widgets/PlinkoBonusGame';

interface GameBoardProps {
  item: QuizItem;
  timeLeft: number;
  showSilenceNudge: boolean;
  showExpiredAnswer?: boolean;
  isPlinkoActive?: boolean;
  questionIndex?: number;
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  volumeLevel: number;
  isSpeechDetected: boolean;
  keypadInput: string;
  language: VoiceLanguage;
  onLanguageChange: (lang: VoiceLanguage) => void;
  onOptionSelect?: (option: { id: string; label: string; value: string }) => void;
  onReadAloud?: () => void;
  onEatTarget?: (targetValue: number, eatenCount: number) => void;
  onSnakeComplete?: () => void;
  onPlinkoComplete?: (wellNumber: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  item,
  timeLeft,
  showSilenceNudge,
  showExpiredAnswer = false,
  isPlinkoActive = false,
  questionIndex,
  transcript,
  interimTranscript,
  isListening,
  volumeLevel,
  isSpeechDetected,
  keypadInput,
  language,
  onLanguageChange,
  onOptionSelect,
  onReadAloud,
  onEatTarget,
  onSnakeComplete,
  onPlinkoComplete,
}) => {
  const currentDisplayedTranscript = interimTranscript || transcript;

  const renderWidget = () => {
    if (isPlinkoActive || item.widget?.type === 'plinko') {
      return (
        <PlinkoBonusGame
          {...(item.widget?.plinkoProps || {})}
          transcript={transcript}
          interimTranscript={interimTranscript}
          onComplete={onPlinkoComplete}
        />
      );
    }

    if (!item.widget || item.widget.type === 'none') {
      return null;
    }

    switch (item.widget.type) {
      case 'shape':
        return item.widget.shapeProps ? (
          <SvgShape {...item.widget.shapeProps} />
        ) : null;

      case 'clock':
        return item.widget.clockProps ? (
          <SvgClock {...item.widget.clockProps} />
        ) : null;

      case 'dotgrid':
        return item.widget.dotGridProps ? (
          <SvgDotGrid {...item.widget.dotGridProps} />
        ) : null;

      case 'flashcard':
        return item.widget.flashcardProps ? (
          <FlashcardWidget {...item.widget.flashcardProps} />
        ) : null;

      case 'choice':
        return item.widget.choiceProps ? (
          <ChoiceGrid
            {...item.widget.choiceProps}
            onSelectOption={onOptionSelect}
          />
        ) : null;

      case 'tenframe':
        return item.widget.tenFrameProps ? (
          <SvgTenFrame {...item.widget.tenFrameProps} />
        ) : null;

      case 'placevalue':
        return item.widget.placeValueProps ? (
          <SvgPlaceValueBlocks {...item.widget.placeValueProps} />
        ) : null;

      case 'coin':
        return item.widget.coinProps ? (
          <SvgCoin
            {...item.widget.coinProps}
            questionIndex={questionIndex}
            showExpiredAnswer={showExpiredAnswer}
          />
        ) : null;

      case 'equation':
        return item.widget.equationProps ? (
          <SvgEquationCard {...item.widget.equationProps} />
        ) : null;

      case 'spatialscene':
        return item.widget.spatialSceneProps ? (
          <SvgSpatialScene {...item.widget.spatialSceneProps} />
        ) : null;

      case 'numbersnake':
        return (
          <NumberSnakeGame
            key={item.id}
            {...item.widget.numberSnakeProps}
            transcript={transcript}
            interimTranscript={interimTranscript}
            onEatTarget={onEatTarget}
            onComplete={() => {
              onSnakeComplete?.();
              onOptionSelect?.({
                id: 'completed',
                label: 'completed',
                value: 'completed',
              });
            }}
          />
        );

      case 'letterhero':
        return (
          <LetterHeroGame
            key={item.id}
            {...item.widget.letterHeroProps}
            transcript={transcript}
            interimTranscript={interimTranscript}
            onComplete={() => {
              onSnakeComplete?.();
              onOptionSelect?.({
                id: 'completed',
                label: 'completed',
                value: 'completed',
              });
            }}
          />
        );

      case 'plinko':
        return (
          <PlinkoBonusGame
            {...item.widget.plinkoProps}
            transcript={transcript}
            interimTranscript={interimTranscript}
            onComplete={onPlinkoComplete}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center">
      {/* Timer and Status Bar */}
      <div className="w-full flex justify-between items-center bg-white rounded-2xl p-4 shadow-md mb-6 border border-slate-200 gap-2 flex-wrap sm:flex-nowrap">
        {item.widget?.type !== 'numbersnake' && item.widget?.type !== 'letterhero' && item.widget?.type !== 'plinko' && !isPlinkoActive ? (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center p-2 rounded-xl ${
                timeLeft <= 5 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Timer size={24} />
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Time Left
              </span>
              <span
                className={`text-2xl font-black ${
                  timeLeft <= 5 ? 'text-rose-600' : 'text-slate-800'
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-extrabold text-xs uppercase tracking-wider">
            🎯 Interactive Board Mode
          </div>
        )}

        {/* In-game Language Switcher */}
        <LanguageToggle language={language} onLanguageChange={onLanguageChange} />

        {/* Live Microphone Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Voice Input
            </span>
            <span className="text-sm font-bold text-slate-700">
              {isListening ? (isSpeechDetected ? 'Speaking...' : 'Listening...') : 'Mic Off'}
            </span>
          </div>
          <div
            className={`relative flex items-center justify-center p-3 rounded-full transition-colors ${
              isListening
                ? isSpeechDetected
                  ? 'bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-200 animate-pulse'
                  : 'bg-indigo-600 text-white'
                : 'bg-slate-300 text-slate-600'
            }`}
          >
            {isListening ? <Mic size={22} /> : <MicOff size={22} />}
            {isListening && volumeLevel > 0 && (
              <span
                className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 -z-10 transition-transform duration-75"
                style={{ transform: `scale(${1 + Math.min(volumeLevel, 100) / 100})` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Question Display */}
      <div className="w-full bg-gradient-to-b from-white to-indigo-50/50 border-4 border-indigo-200 rounded-3xl p-6 sm:p-10 shadow-xl text-center mb-6 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            {item.prompt}
          </span>
          {onReadAloud && (
            <button
              type="button"
              onClick={onReadAloud}
              className="p-1 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-colors cursor-pointer"
              title="Read prompt aloud"
            >
              <Volume2 size={18} />
            </button>
          )}
        </div>

        {/* Parametric / Flashcard Widget Area */}
        <div className="w-full my-2 flex items-center justify-center min-h-[160px]">
          {renderWidget()}
        </div>

        {/* Timeout Expired Answer or Default Prompt */}
        {showExpiredAnswer ? (
          <div className="font-black text-rose-600 tracking-tight select-none my-2 animate-bounce text-3xl sm:text-4xl">
            Answer: {item.expectedAnswer}
          </div>
        ) : item.widget?.type === 'none' ? (
          <div
            className="font-black text-indigo-900 tracking-tight select-none my-4"
            style={{ fontSize: '72px', lineHeight: '1.1' }}
          >
            {item.prompt}
          </div>
        ) : null}

        {/* Keypad Display or Voice Feedback */}
        <div className="min-h-[48px] flex items-center justify-center mt-2">
          {keypadInput ? (
            <div className="text-2xl sm:text-3xl font-black text-purple-700 bg-purple-100 px-6 py-2 rounded-2xl border-2 border-purple-300 animate-fade-in">
              {keypadInput}
            </div>
          ) : currentDisplayedTranscript ? (
            <div className="flex items-center justify-center gap-2 text-indigo-700 bg-indigo-100/80 px-4 py-2 rounded-xl text-lg font-semibold border border-indigo-200">
              <Volume2 size={20} className="animate-bounce text-indigo-600" />
              <span>"{currentDisplayedTranscript}"</span>
            </div>
          ) : (
            <div className="text-slate-400 text-xs sm:text-sm italic">
              Say answer out loud or use the keypad below...
            </div>
          )}
        </div>
      </div>

      {/* Silence Encouragement Banner */}
      {showSilenceNudge && (
        <div className="w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4 text-amber-900 flex items-center gap-3 shadow-md animate-bounce">
          <MessageSquareHeart size={28} className="text-amber-600 shrink-0" />
          <div className="text-left">
            <p className="font-bold text-sm sm:text-base">Take a guess!</p>
            <p className="text-xs sm:text-sm text-amber-800">
              Say the answer out loud or tap the keypad below!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
