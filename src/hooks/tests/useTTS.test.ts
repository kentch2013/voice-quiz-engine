import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTTS } from '../useTTS';

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

describe('useTTS Hook', () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;
  let lastUtterance: MockSpeechSynthesisUtterance | null = null;

  beforeEach(() => {
    lastUtterance = null;
    mockSpeak = vi.fn((utterance: MockSpeechSynthesisUtterance) => {
      lastUtterance = utterance;
    });
    mockCancel = vi.fn();

    // Mock window.speechSynthesis and SpeechSynthesisUtterance
    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
    vi.stubGlobal('speechSynthesis', {
      speak: mockSpeak,
      cancel: mockCancel,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useTTS());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isSpeaking).toBe(false);
  });

  it('should create utterance with proper properties and call speechSynthesis.speak', () => {
    const onSpeechStart = vi.fn();
    const onSpeechEnd = vi.fn();

    const { result } = renderHook(() =>
      useTTS({
        language: 'en-US',
        onSpeechStart,
        onSpeechEnd,
      })
    );

    act(() => {
      result.current.speak('Hello world');
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
    expect(lastUtterance).not.toBeNull();
    expect(lastUtterance?.text).toBe('Hello world');
    expect(lastUtterance?.lang).toBe('en-US');
    expect(lastUtterance?.rate).toBe(0.95);
  });

  it('should allow overriding language in speak call', () => {
    const { result } = renderHook(() => useTTS({ language: 'en-US' }));

    act(() => {
      result.current.speak('你好', 'zh-CN');
    });

    expect(lastUtterance?.lang).toBe('zh-CN');
  });

  it('should update isSpeaking and invoke callbacks on speech start and end', () => {
    const onSpeechStart = vi.fn();
    const onSpeechEnd = vi.fn();

    const { result } = renderHook(() =>
      useTTS({
        language: 'en-US',
        onSpeechStart,
        onSpeechEnd,
      })
    );

    act(() => {
      result.current.speak('Test prompt');
    });

    expect(result.current.isSpeaking).toBe(false);

    // Simulate speech start
    act(() => {
      if (lastUtterance?.onstart) {
        lastUtterance.onstart();
      }
    });

    expect(result.current.isSpeaking).toBe(true);
    expect(onSpeechStart).toHaveBeenCalledTimes(1);

    // Simulate speech end
    act(() => {
      if (lastUtterance?.onend) {
        lastUtterance.onend();
      }
    });

    expect(result.current.isSpeaking).toBe(false);
    expect(onSpeechEnd).toHaveBeenCalledTimes(1);
  });

  it('should handle TTS error and reset speaking state', () => {
    const onSpeechEnd = vi.fn();

    const { result } = renderHook(() =>
      useTTS({
        onSpeechEnd,
      })
    );

    act(() => {
      result.current.speak('Test error handling');
    });

    act(() => {
      if (lastUtterance?.onstart) {
        lastUtterance.onstart();
      }
    });

    expect(result.current.isSpeaking).toBe(true);

    act(() => {
      if (lastUtterance?.onerror) {
        lastUtterance.onerror(new Error('Speech synth error'));
      }
    });

    expect(result.current.isSpeaking).toBe(false);
    expect(onSpeechEnd).toHaveBeenCalledTimes(1);
  });

  it('should cancel speech when stop is called', () => {
    const { result } = renderHook(() => useTTS());

    act(() => {
      result.current.speak('Stopping test');
    });

    act(() => {
      if (lastUtterance?.onstart) {
        lastUtterance.onstart();
      }
    });

    expect(result.current.isSpeaking).toBe(true);

    act(() => {
      result.current.stop();
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
  });

  it('should cancel speech on unmount', () => {
    const { unmount } = renderHook(() => useTTS());

    unmount();

    expect(mockCancel).toHaveBeenCalled();
  });
});
