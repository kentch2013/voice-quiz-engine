import React from 'react';
import type { QuizItem, QuizOption } from '../../types/quiz';
import { SvgShape } from './SvgShape';
import { SvgClock } from './SvgClock';
import { SvgDotGrid } from './SvgDotGrid';
import { FlashcardWidget } from './FlashcardWidget';
import { ChoiceGrid } from './ChoiceGrid';
import { SvgTenFrame } from './SvgTenFrame';
import { SvgPlaceValueBlocks } from './SvgPlaceValueBlocks';
import { SvgCoin } from './SvgCoin';
import { SvgEquationCard } from './SvgEquationCard';
import { SvgSpatialScene } from './SvgSpatialScene';
import { NumberSnakeGame } from './NumberSnakeGame';
import { LetterHeroGame } from './LetterHeroGame';
import { PlinkoBonusGame } from './PlinkoBonusGame';
import { BubbleShooterGame } from './BubbleShooterGame';
import { WhackAMoleGame } from './WhackAMoleGame';

export interface WidgetRendererProps {
  item: QuizItem;
  transcript?: string;
  interimTranscript?: string;
  showExpiredAnswer?: boolean;
  isPlinkoActive?: boolean;
  questionIndex?: number;
  onOptionSelect?: (option: QuizOption) => void;
  onEatTarget?: (targetValue: number, eatenCount: number) => void;
  onSnakeComplete?: () => void;
  onPlinkoComplete?: (wellNumber: number) => void;
  clearTranscript?: () => void;
  resetTranscript?: () => void;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  item,
  transcript = '',
  interimTranscript = '',
  showExpiredAnswer = false,
  isPlinkoActive = false,
  questionIndex,
  onOptionSelect,
  onEatTarget,
  onSnakeComplete,
  onPlinkoComplete,
  clearTranscript,
  resetTranscript,
}) => {
  if (isPlinkoActive) {
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

    case 'bubbleshooter':
      return (
        <BubbleShooterGame
          key={item.widget?.type || 'bubbleshooter'}
          {...item.widget.bubbleShooterProps}
          transcript={transcript}
          interimTranscript={interimTranscript}
          clearTranscript={clearTranscript}
          resetTranscript={resetTranscript}
          onTripleMatched={() => {
            onEatTarget?.(0, 0);
            onEatTarget?.(0, 0);
          }}
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

    case 'whackamole': {
      const moleProps = item.widget.whackAMoleProps || item.widget.whackamoleProps || {};
      return (
        <WhackAMoleGame
          key={item.id || 'whackamole'}
          prompt={item.prompt}
          targetWord={typeof item.expectedAnswer === 'string' ? item.expectedAnswer : undefined}
          options={item.keypad?.options}
          {...moleProps}
          transcript={transcript}
          interimTranscript={interimTranscript}
          clearTranscript={clearTranscript}
          resetTranscript={resetTranscript}
          onHit={() => {
            onEatTarget?.(0, 0);
          }}
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
    }

    default:
      return null;
  }
};
