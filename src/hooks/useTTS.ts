import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseTTSOptions {
  language?: string;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

export function useTTS(options: UseTTSOptions = {}) {
  const { language = 'en-US', onSpeechStart, onSpeechEnd } = options;
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSupported] = useState<boolean>(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  );

  const onSpeechStartRef = useRef(onSpeechStart);
  const onSpeechEndRef = useRef(onSpeechEnd);

  useEffect(() => {
    onSpeechStartRef.current = onSpeechStart;
    onSpeechEndRef.current = onSpeechEnd;
  }, [onSpeechStart, onSpeechEnd]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, overrideLang?: string) => {
      if (!isSupported || !text) return;

      stop(); // Stop any previous playback

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = overrideLang || language;
      utterance.rate = 0.95; // Friendly reading speed for children

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (onSpeechStartRef.current) {
          onSpeechStartRef.current();
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onSpeechEndRef.current) {
          onSpeechEndRef.current();
        }
      };

      utterance.onerror = (e) => {
        console.warn('TTS utterance error:', e);
        setIsSpeaking(false);
        if (onSpeechEndRef.current) {
          onSpeechEndRef.current();
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('TTS speak exception:', err);
        setIsSpeaking(false);
      }
    },
    [isSupported, language, stop]
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
}
