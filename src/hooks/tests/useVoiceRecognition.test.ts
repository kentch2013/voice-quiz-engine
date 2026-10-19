import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceRecognition } from '../useVoiceRecognition';

class MockSpeechRecognition {
  continuous = true;
  interimResults = true;
  lang = 'en-US';
  onstart: ((ev: Event) => void) | null = null;
  onresult: ((ev: unknown) => void) | null = null;
  onerror: ((ev: unknown) => void) | null = null;
  onend: ((ev: Event) => void) | null = null;

  start = vi.fn(() => {
    if (this.onstart) this.onstart(new Event('start'));
  });
  stop = vi.fn(() => {
    if (this.onend) this.onend(new Event('end'));
  });
  abort = vi.fn(() => {
    if (this.onend) this.onend(new Event('end'));
  });
}

describe('useVoiceRecognition Hook & RMS Noise Gate', () => {
  let mockGetByteTimeDomainData: (array: Uint8Array) => void;
  let mockAudioContextClose: ReturnType<typeof vi.fn>;
  let rafCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    rafCallback = null;

    vi.stubGlobal('SpeechRecognition', MockSpeechRecognition);

    // Mock requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallback = cb;
      return 123;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    // Mock AudioContext and AnalyserNode
    mockGetByteTimeDomainData = vi.fn();
    mockAudioContextClose = vi.fn().mockResolvedValue(undefined);

    class MockAnalyser {
      fftSize = 512;
      get frequencyBinCount() {
        return this.fftSize / 2;
      }
      getByteTimeDomainData(array: Uint8Array) {
        mockGetByteTimeDomainData(array);
      }
    }

    class MockMediaStreamSource {
      connect() {}
    }

    class MockAudioContext {
      createMediaStreamSource() {
        return new MockMediaStreamSource();
      }
      createAnalyser() {
        return new MockAnalyser();
      }
      close() {
        return (mockAudioContextClose as unknown as () => Promise<void>)();
      }
    }

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

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useVoiceRecognition());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.volumeLevel).toBe(0);
    expect(result.current.isSpeechDetected).toBe(false);
  });

  it('evaluates RMS noise gate logic correctly with synthetic audio buffers', async () => {
    // 1. Quiet/Silent audio buffer (values centered around 128 -> RMS = 0)
    mockGetByteTimeDomainData = vi.fn((array: Uint8Array) => {
      array.fill(128); // 128 corresponds to 0 amplitude
    });

    const { result } = renderHook(() =>
      useVoiceRecognition({ noiseGateThreshold: 0.05 })
    );

    await act(async () => {
      result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);

    // Execute animation frame callback to analyze audio
    act(() => {
      if (rafCallback) rafCallback(performance.now());
    });

    // Below noise threshold (RMS = 0)
    expect(result.current.isSpeechDetected).toBe(false);
    expect(result.current.volumeLevel).toBe(0);

    // 2. Loud speech signal buffer (values oscillating between 64 and 192 -> RMS = 0.5)
    mockGetByteTimeDomainData = vi.fn((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = i % 2 === 0 ? 192 : 64; // (192-128)/128 = 0.5, (64-128)/128 = -0.5
      }
    });

    // Execute animation frame callback again
    act(() => {
      if (rafCallback) rafCallback(performance.now());
    });

    // Above noise threshold (RMS = 0.5 >= 0.05)
    expect(result.current.isSpeechDetected).toBe(true);
    expect(result.current.volumeLevel).toBe(100); // 0.5 * 200 = 100
  });

  it('toggles isSpeechDetected flag based on noiseGateThreshold boundary', async () => {
    let audioSignalValue = 128; // default silence
    mockGetByteTimeDomainData = vi.fn((array: Uint8Array) => {
      array.fill(audioSignalValue);
    });

    const { result } = renderHook(() =>
      useVoiceRecognition({ noiseGateThreshold: 0.1 })
    );

    await act(async () => {
      result.current.startListening();
    });

    // Audio signal yielding RMS = 0.05 (below 0.1 threshold)
    audioSignalValue = 134;
    act(() => {
      if (rafCallback) rafCallback(performance.now());
    });
    expect(result.current.isSpeechDetected).toBe(false);

    // Audio signal yielding RMS = 0.2 (above 0.1 threshold)
    audioSignalValue = 154;
    act(() => {
      if (rafCallback) rafCallback(performance.now());
    });
    expect(result.current.isSpeechDetected).toBe(true);
  });

  it('handles speech recognition result events and updates transcript', async () => {
    const onTranscriptChange = vi.fn();
    const { result } = renderHook(() =>
      useVoiceRecognition({ onTranscriptChange })
    );

    await act(async () => {
      result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);
  });

  it('clears transcript when resetTranscript is called', async () => {
    const { result } = renderHook(() => useVoiceRecognition());

    await act(async () => {
      result.current.startListening();
    });

    act(() => {
      result.current.resetTranscript();
    });

    expect(result.current.transcript).toBe('');
    expect(result.current.interimTranscript).toBe('');
  });

  it('stops listening and cleans up audio context on stopListening', async () => {
    const { result } = renderHook(() => useVoiceRecognition());

    await act(async () => {
      result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.stopListening();
    });

    expect(result.current.isListening).toBe(false);
    expect(mockAudioContextClose).toHaveBeenCalled();
  });
});
