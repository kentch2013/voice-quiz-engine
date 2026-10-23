import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from '../useGameEngine';

class MockSpeechSynthesisUtterance {
  text: string;
  lang: string = '';
  rate: number = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

class MockSpeechRecognition {
  continuous = true;
  interimResults = true;
  lang = 'en-US';
  onstart: (() => void) | null = null;
  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onend: ((ev: Event) => void) | null = null;

  start = vi.fn(() => {
    if (this.onstart) this.onstart();
  });
  stop = vi.fn(() => {
    if (this.onend) this.onend(new Event('end'));
  });
  abort = vi.fn(() => {
    if (this.onend) this.onend(new Event('end'));
  });
}

class MockAnalyser {
  fftSize = 512;
  get frequencyBinCount() {
    return this.fftSize / 2;
  }
  getByteTimeDomainData(array: Uint8Array) {
    array.fill(128);
  }
}

class MockMediaStreamSource {
  connect() {}
}

class MockOscillator {
  type = 'sine';
  frequency = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  connect() {}
  start() {}
  stop() {}
}

class MockGain {
  gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  connect() {}
}

class MockAudioContext {
  currentTime = 0;
  destination = {};
  createMediaStreamSource() {
    return new MockMediaStreamSource();
  }
  createAnalyser() {
    return new MockAnalyser();
  }
  createOscillator() {
    return new MockOscillator();
  }
  createGain() {
    return new MockGain();
  }
  close() {
    return Promise.resolve();
  }
}

describe('Audio Pipeline & Mute Guard in useGameEngine', () => {
  let lastUtterance: MockSpeechSynthesisUtterance | null = null;
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    lastUtterance = null;
    mockSpeak = vi.fn((utterance: MockSpeechSynthesisUtterance) => {
      lastUtterance = utterance;
    });
    mockCancel = vi.fn();

    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
    vi.stubGlobal('speechSynthesis', {
      speak: mockSpeak,
      cancel: mockCancel,
    });
    vi.stubGlobal('SpeechRecognition', MockSpeechRecognition);
    vi.stubGlobal('AudioContext', MockAudioContext);

    // Mock navigator.mediaDevices.getUserMedia
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('pauses microphone listening when TTS starts and resumes when utterance onend fires', async () => {
    const { result } = renderHook(() => useGameEngine());

    // Start game
    await act(async () => {
      result.current.startGame();
    });

    expect(result.current.status).toBe('playing');
    expect(mockSpeak).toHaveBeenCalled();
    expect(lastUtterance).not.toBeNull();

    // Verify initially listening
    expect(result.current.voiceRecognition.isListening).toBe(true);

    // Simulate TTS utterance starting (onSpeechStart fires)
    act(() => {
      if (lastUtterance?.onstart) {
        lastUtterance.onstart();
      }
    });

    // Microphone listening should be paused/muted while TTS is speaking
    expect(result.current.voiceRecognition.isListening).toBe(false);

    // Simulate TTS utterance completing (onSpeechEnd fires)
    act(() => {
      if (lastUtterance?.onend) {
        lastUtterance.onend();
      }
    });

    // Microphone listening should resume when TTS finishes
    expect(result.current.voiceRecognition.isListening).toBe(true);
    expect(result.current.questionTimeLeft).toBeGreaterThan(0);
  });

  it('resumes microphone listening and question processing after TTS end on prompt change', async () => {
    const { result } = renderHook(() => useGameEngine());

    await act(async () => {
      result.current.startGame();
    });

    // TTS starts speaking first question prompt
    act(() => {
      if (lastUtterance?.onstart) {
        lastUtterance.onstart();
      }
    });

    expect(result.current.voiceRecognition.isListening).toBe(false);

    // TTS finishes speaking
    act(() => {
      if (lastUtterance?.onend) {
        lastUtterance.onend();
      }
    });

    expect(result.current.voiceRecognition.isListening).toBe(true);
    const initialQuestion = result.current.currentItem?.prompt;
    expect(initialQuestion).toBeDefined();

    // Submit answer to advance to next question
    await act(async () => {
      if (result.current.currentItem) {
        result.current.submitAnswer(result.current.currentItem.expectedAnswer, 'keypad');
      }
    });

    // TTS for second question starts
    expect(mockSpeak).toHaveBeenCalledTimes(2);

    act(() => {
      if (lastUtterance?.onstart) {
        lastUtterance.onstart();
      }
    });

    expect(result.current.voiceRecognition.isListening).toBe(false);

    act(() => {
      if (lastUtterance?.onend) {
        lastUtterance.onend();
      }
    });

    expect(result.current.voiceRecognition.isListening).toBe(true);
  });

  it('suppresses instruction TTS after eating the first food item in Number Snake mode', async () => {
    const { result } = renderHook(() => useGameEngine());

    // Set topic to greater-less-than (Number Snake)
    act(() => {
      result.current.setSelectedTopicId('greater-less-than');
    });

    // Start game
    await act(async () => {
      result.current.startGame();
    });

    expect(result.current.status).toBe('playing');
    expect(result.current.currentItem?.widget?.type).toBe('numbersnake');

    // TTS should speak initial instruction prompt once when game starts (currentIndex = 0)
    const initialSpeakCalls = mockSpeak.mock.calls.length;
    expect(initialSpeakCalls).toBeGreaterThanOrEqual(1);

    // Eat first target item -> reportTargetEaten -> currentIndex becomes 1
    await act(async () => {
      result.current.reportTargetEaten(10);
    });

    expect(result.current.currentIndex).toBe(1);
    // mockSpeak call count should NOT increase after eating the first food item
    expect(mockSpeak.mock.calls.length).toBe(initialSpeakCalls);

    // Eat second target item -> reportTargetEaten -> currentIndex becomes 2
    await act(async () => {
      result.current.reportTargetEaten(20);
    });

    expect(result.current.currentIndex).toBe(2);
    // mockSpeak call count should remain unchanged (TTS suppressed)
    expect(mockSpeak.mock.calls.length).toBe(initialSpeakCalls);
  });

  it('suppresses instruction TTS on mid-game progress in Bubble Shooter mode', async () => {
    const { result } = renderHook(() => useGameEngine());

    act(() => {
      result.current.setSelectedTopicId('single-digit-addition');
    });

    await act(async () => {
      result.current.startGame();
    });

    expect(result.current.status).toBe('playing');
    expect(result.current.currentItem?.widget?.type).toBe('bubbleshooter');

    const initialSpeakCalls = mockSpeak.mock.calls.length;
    expect(initialSpeakCalls).toBeGreaterThanOrEqual(1);

    await act(async () => {
      result.current.reportTargetEaten(0);
    });

    expect(result.current.currentIndex).toBe(1);
    expect(mockSpeak.mock.calls.length).toBe(initialSpeakCalls);
  });
});
