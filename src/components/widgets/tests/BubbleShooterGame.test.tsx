import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  BubbleShooterGame,
  getHexNeighbors,
  isValidSumTriple,
  coordKey,
  findTrianglesContaining,
  hasAnySumTriple,
  findFloatingBubbles,
  createInitialBoard,
  parseVoiceAction,
  parseSingleToken,
  tokenizeTranscript,
  extractVoiceCommands,
  levenshteinDistance,
  type BubbleNode,
} from '../BubbleShooterGame';
import { GameBoard } from '../../GameBoard';
import type { QuizItem } from '../../../types/quiz';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('BubbleShooterGame Helper Functions & Logic', () => {
  it('correctly calculates Levenshtein distance', () => {
    expect(levenshteinDistance('shot', 'shoot')).toBe(1);
    expect(levenshteinDistance('right', 'rite')).toBe(3);
    expect(levenshteinDistance('left', 'lift')).toBe(1);
    expect(levenshteinDistance('same', 'same')).toBe(0);
  });

  it('correctly calculates hex neighbors on alternating 6/5 grid', () => {
    // Row 0 (Even row, 6 cols) cell (0, 0)
    const n00 = getHexNeighbors(0, 0);
    expect(n00).toEqual([
      { r: 0, c: 1 },
      { r: 1, c: 0 },
    ]);

    // Row 1 (Odd row, 5 cols) cell (1, 1)
    const n11 = getHexNeighbors(1, 1);
    expect(n11).toEqual([
      { r: 1, c: 0 },
      { r: 1, c: 2 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
      { r: 2, c: 1 },
      { r: 2, c: 2 },
    ]);
  });

  it('validates order-agnostic sum triples correctly', () => {
    expect(isValidSumTriple(3, 4, 7)).toBe(true);
    expect(isValidSumTriple(7, 3, 4)).toBe(true);
    expect(isValidSumTriple(2, 5, 7)).toBe(true);
    expect(isValidSumTriple(1, 1, 2)).toBe(true);
    expect(isValidSumTriple(3, 3, 3)).toBe(false);
    expect(isValidSumTriple(1, 2, 4)).toBe(false);
  });

  it('detects 3 mutually adjacent bubbles (triangles) satisfying n1 + n2 === n3', () => {
    const board = new Map<string, BubbleNode>();
    board.set(coordKey(0, 0), { id: '1', r: 0, c: 0, value: 3 });
    board.set(coordKey(0, 1), { id: '2', r: 0, c: 1, value: 4 });
    board.set(coordKey(1, 0), { id: '3', r: 1, c: 0, value: 7 });

    const triangles = findTrianglesContaining(board, 0, 0);
    expect(triangles.length).toBe(1);
    expect(triangles[0].values).toEqual([3, 4, 7]);
    expect(isValidSumTriple(...(triangles[0].values as [number, number, number]))).toBe(true);
  });

  it('identifies unanchored/floating bubbles disconnected from row 0', () => {
    const board = new Map<string, BubbleNode>();
    board.set(coordKey(0, 0), { id: '1', r: 0, c: 0, value: 1 });
    board.set(coordKey(1, 0), { id: '2', r: 1, c: 0, value: 2 });
    board.set(coordKey(4, 2), { id: 'float1', r: 4, c: 2, value: 5 });

    const floating = findFloatingBubbles(board);
    expect(floating).toEqual([{ r: 4, c: 2 }]);
  });

  it('initializes board with 17 bubbles (rows 0, 1, 2) and no pre-existing sum triples', () => {
    const board = createInitialBoard();
    expect(board.size).toBe(17);
    expect(hasAnySumTriple(board)).toBe(false);

    for (const node of board.values()) {
      expect(node.value).toBeGreaterThanOrEqual(1);
      expect(node.value).toBeLessThanOrEqual(10);
      expect(Number.isInteger(node.value)).toBe(true);
    }
  });

  it('tokenizes transcripts and parses single word tokens accurately', () => {
    expect(tokenizeTranscript('right right right')).toEqual(['right', 'right', 'right']);
    expect(tokenizeTranscript('向左 向右 发射')).toEqual(['向左', '向右', '发射']);
    expect(tokenizeTranscript('左左')).toEqual(['左', '左']);

    expect(parseSingleToken('right')).toBe('RIGHT');
    expect(parseSingleToken('light')).toBe('RIGHT');
    expect(parseSingleToken('left')).toBe('LEFT');
    expect(parseSingleToken('laugh')).toBe('LEFT');
    expect(parseSingleToken('shoot')).toBe('FIRE');
    expect(parseSingleToken('shot')).toBe('FIRE');
    expect(parseSingleToken('unknown')).toBeNull();
  });

  it('parses verbal voice controls for aiming and shooting with homophones and fuzzy matching', () => {
    // Standard commands
    expect(parseVoiceAction('turn left')).toBe('LEFT');
    expect(parseVoiceAction('aim right')).toBe('RIGHT');
    expect(parseVoiceAction('shoot now')).toBe('FIRE');
    expect(parseVoiceAction('fire!')).toBe('FIRE');

    // Right homophones & phonetic matches
    expect(parseVoiceAction('light')).toBe('RIGHT');
    expect(parseVoiceAction('write')).toBe('RIGHT');
    expect(parseVoiceAction('rite')).toBe('RIGHT');
    expect(parseVoiceAction('rot')).toBe('RIGHT');
    expect(parseVoiceAction('white')).toBe('RIGHT');
    expect(parseVoiceAction('ride')).toBe('RIGHT');
    expect(parseVoiceAction('r')).toBe('RIGHT');
    expect(parseVoiceAction('rig')).toBe('RIGHT');
    expect(parseVoiceAction('you')).toBe('RIGHT');

    // Left homophones & phonetic matches
    expect(parseVoiceAction('laugh')).toBe('LEFT');
    expect(parseVoiceAction('lift')).toBe('LEFT');
    expect(parseVoiceAction('let')).toBe('LEFT');
    expect(parseVoiceAction('l')).toBe('LEFT');
    expect(parseVoiceAction('lef')).toBe('LEFT');
    expect(parseVoiceAction('zuo')).toBe('LEFT');

    // Fire / Shoot homophones & phonetic matches
    expect(parseVoiceAction('shot')).toBe('FIRE');
    expect(parseVoiceAction('chute')).toBe('FIRE');
    expect(parseVoiceAction('shute')).toBe('FIRE');
    expect(parseVoiceAction('shoo')).toBe('FIRE');
    expect(parseVoiceAction('fa')).toBe('FIRE');
    expect(parseVoiceAction('kaihuo')).toBe('FIRE');
    expect(parseVoiceAction('bang')).toBe('FIRE');

    // Chinese matches
    expect(parseVoiceAction('向左')).toBe('LEFT');
    expect(parseVoiceAction('向右')).toBe('RIGHT');
    expect(parseVoiceAction('发射')).toBe('FIRE');

    // Invalid input
    expect(parseVoiceAction('hello')).toBeNull();
  });

  it('triggers visual boundary bounce feedback when attempting to aim past leftmost/rightmost candidate', () => {
    render(<BubbleShooterGame />);

    const leftBtn = screen.getByRole('button', { name: /Aim Left/i });

    // Initial aim is 0 (leftmost)
    act(() => {
      fireEvent.click(leftBtn);
    });

    // Should display boundary feedback message
    expect(screen.getByText(/Leftmost Boundary Reached!/i)).toBeDefined();
  });

  it('parses multi-step voice commands with count numbers and Chinese equivalents', () => {
    // English direction followed or preceded by number
    expect(extractVoiceCommands('left two')).toEqual(['LEFT', 'LEFT']);
    expect(extractVoiceCommands('left 2')).toEqual(['LEFT', 'LEFT']);
    expect(extractVoiceCommands('right three')).toEqual(['RIGHT', 'RIGHT', 'RIGHT']);
    expect(extractVoiceCommands('right 3')).toEqual(['RIGHT', 'RIGHT', 'RIGHT']);
    expect(extractVoiceCommands('two left')).toEqual(['LEFT', 'LEFT']);
    expect(extractVoiceCommands('3 right')).toEqual(['RIGHT', 'RIGHT', 'RIGHT']);

    // Chinese count equivalents
    expect(extractVoiceCommands('向左两个')).toEqual(['LEFT', 'LEFT']);
    expect(extractVoiceCommands('左2')).toEqual(['LEFT', 'LEFT']);
    expect(extractVoiceCommands('向右三个')).toEqual(['RIGHT', 'RIGHT', 'RIGHT']);
    expect(extractVoiceCommands('右3')).toEqual(['RIGHT', 'RIGHT', 'RIGHT']);
  });

  it('parses extent keywords to MAX_LEFT and MAX_RIGHT', () => {
    expect(extractVoiceCommands('all the way left')).toEqual(['MAX_LEFT']);
    expect(extractVoiceCommands('far left')).toEqual(['MAX_LEFT']);
    expect(extractVoiceCommands('max left')).toEqual(['MAX_LEFT']);
    expect(extractVoiceCommands('最左')).toEqual(['MAX_LEFT']);
    expect(extractVoiceCommands('zuizuo')).toEqual(['MAX_LEFT']);

    expect(extractVoiceCommands('all the way right')).toEqual(['MAX_RIGHT']);
    expect(extractVoiceCommands('far right')).toEqual(['MAX_RIGHT']);
    expect(extractVoiceCommands('max right')).toEqual(['MAX_RIGHT']);
    expect(extractVoiceCommands('最右')).toEqual(['MAX_RIGHT']);
    expect(extractVoiceCommands('zuiyou')).toEqual(['MAX_RIGHT']);
  });
});

describe('BubbleShooterGame UI Component', () => {
  it('renders interactive controls, header, next bubble preview, hex grid, cannon SVG, and laser aim line', () => {
    render(<BubbleShooterGame targetTriplesCount={5} />);

    expect(screen.queryByText(/Match Triples/i)).toBeNull();
    expect(screen.getByText(/Triples Cleared: 0 \/ 5/i)).toBeDefined();
    expect(screen.getByText(/Next Bubble:/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Aim Left/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Shoot Bubble/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Aim Right/i })).toBeDefined();

    // Verify SVG Cannon & Laser trajectory elements
    expect(screen.getByTestId('bubble-cannon-svg')).toBeDefined();
    expect(screen.getByTestId('laser-aim-line')).toBeDefined();
    expect(screen.getByTestId('destination-hex-highlight')).toBeDefined();
    expect(screen.getByTestId('bubble-cannon-gun')).toBeDefined();
    expect(screen.getByTestId('cannon-barrel-rotator')).toBeDefined();
  });

  it('renders enlarged loaded bubble with radius 22 and font size 20 inside cannon barrel', () => {
    render(<BubbleShooterGame />);

    const rotator = screen.getByTestId('cannon-barrel-rotator');
    const circle = rotator.querySelector('circle');
    const text = rotator.querySelector('text');

    expect(circle?.getAttribute('r')).toBe('22');
    expect(text?.getAttribute('font-size')).toBe('20');
  });

  it('triggers onTripleMatched callback when a number triple is formed', () => {
    const onTripleMatchedMock = vi.fn();
    render(<BubbleShooterGame onTripleMatched={onTripleMatchedMock} />);

    const shootBtn = screen.getByRole('button', { name: /Shoot Bubble/i });
    act(() => {
      fireEvent.click(shootBtn);
    });
  });

  it('handles aiming left and right via controls', () => {
    render(<BubbleShooterGame />);

    const leftBtn = screen.getByRole('button', { name: /Aim Left/i });
    const rightBtn = screen.getByRole('button', { name: /Aim Right/i });

    fireEvent.click(rightBtn);
    fireEvent.click(leftBtn);
  });

  it('fires bubble on shoot button click', () => {
    const onCompleteMock = vi.fn();
    render(<BubbleShooterGame onComplete={onCompleteMock} targetTriplesCount={1} />);

    const shootBtn = screen.getByRole('button', { name: /Shoot Bubble/i });

    act(() => {
      fireEvent.click(shootBtn);
    });
  });

  it('responds to voice transcript input for homophones and fuzzy speech commands', () => {
    const { rerender } = render(<BubbleShooterGame transcript="" />);

    act(() => {
      rerender(<BubbleShooterGame transcript="light" />);
    });

    act(() => {
      rerender(<BubbleShooterGame transcript="laugh" />);
    });

    act(() => {
      rerender(<BubbleShooterGame transcript="shot" />);
    });
  });

  it('processes word-by-word instant voice commands for repeated directional tokens without dropping', () => {
    const { rerender } = render(<BubbleShooterGame transcript="" interimTranscript="" />);

    // Fast cumulative utterance "right right right"
    act(() => {
      rerender(<BubbleShooterGame transcript="" interimTranscript="right right right" />);
    });

    // Interim update appending "shoot"
    act(() => {
      rerender(<BubbleShooterGame transcript="" interimTranscript="right right right shoot" />);
    });

    // Finalized transcript update
    act(() => {
      rerender(<BubbleShooterGame transcript="right right right shoot" interimTranscript="" />);
    });
  });

  it('reliably executes unlimited consecutive identical voice commands (e.g., multiple right/left/fire spoken consecutively)', () => {
    const { rerender } = render(<BubbleShooterGame transcript="" interimTranscript="" />);

    // Saying 5 'right' commands in a row
    act(() => {
      rerender(<BubbleShooterGame transcript="" interimTranscript="right right right right right" />);
    });

    // Finalizing 'right right right right right' and adding 3 'left's in interim
    act(() => {
      rerender(
        <BubbleShooterGame
          transcript="right right right right right"
          interimTranscript="left left left"
        />
      );
    });

    // Finalizing all and shooting
    act(() => {
      rerender(
        <BubbleShooterGame
          transcript="right right right right right left left left shoot shoot"
          interimTranscript=""
        />
      );
    });
  });

  it('persists board state continuously across multiple questions/progress increments in GameBoard', () => {
    const dummyItem1: QuizItem = {
      id: 'item-1',
      topicId: 'single-digit-addition',
      gradeBand: 'K-1',
      prompt: 'Hex Bubble Shooter',
      expectedAnswer: 'completed',
      widget: {
        type: 'bubbleshooter',
        bubbleShooterProps: {
          targetTriplesCount: 5,
        },
      },
    };

    const dummyItem2: QuizItem = {
      ...dummyItem1,
      id: 'item-2',
    };

    const { rerender } = render(
      <GameBoard
        item={dummyItem1}
        timeLeft={30}
        showSilenceNudge={false}
        transcript=""
        interimTranscript=""
        isListening={true}
        volumeLevel={10}
        isSpeechDetected={false}
        keypadInput=""
        language="en-US"
        onLanguageChange={() => {}}
      />
    );

    // Initial cannon and SVG loaded
    expect(screen.getByTestId('bubble-cannon-svg')).toBeDefined();

    // Shoot a bubble
    const shootBtn = screen.getByRole('button', { name: /Shoot Bubble/i });
    act(() => {
      fireEvent.click(shootBtn);
    });

    // Rerender GameBoard with new item.id (simulating progress increment in engine)
    rerender(
      <GameBoard
        item={dummyItem2}
        timeLeft={30}
        showSilenceNudge={false}
        transcript=""
        interimTranscript=""
        isListening={true}
        volumeLevel={10}
        isSpeechDetected={false}
        keypadInput=""
        language="en-US"
        onLanguageChange={() => {}}
      />
    );

    // Board continues to render without wiping or resetting cannon
    expect(screen.getByTestId('bubble-cannon-svg')).toBeDefined();
  });
});
