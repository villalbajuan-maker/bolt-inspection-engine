import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SpeechState = 'idle' | 'listening' | 'unsupported' | 'error';

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
  length: number;
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = Event & {
  error?: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type UseSpeechToTextResult = {
  state: SpeechState;
  transcript: string;
  interimTranscript: string;
  elapsedSeconds: number;
  error?: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
};

function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function getErrorMessage(errorCode?: string) {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was blocked. Please allow microphone access and try again.';
    case 'no-speech':
      return 'We could not hear anything. Try again and speak a little closer to the microphone.';
    case 'audio-capture':
      return 'No microphone was detected. Try another device or type your question.';
    default:
      return 'We could not capture voice input. Try again or type your question.';
  }
}

export function useSpeechToText(language = 'en-US'): UseSpeechToTextResult {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldResumeListeningRef = useRef(false);
  const isRestartingRef = useRef(false);
  const [state, setState] = useState<SpeechState>(() =>
    getSpeechRecognitionConstructor() ? 'idle' : 'unsupported'
  );
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string>();
  const isSupported = useMemo(() => Boolean(getSpeechRecognitionConstructor()), []);

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      recognitionRef.current = null;
      setState('unsupported');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setError(undefined);
      if (isRestartingRef.current) {
        isRestartingRef.current = false;
      } else {
        setTranscript('');
        setInterimTranscript('');
        setElapsedSeconds(0);
      }
      setState('listening');
    };

    recognition.onresult = (event) => {
      const finalChunks: string[] = [];
      const interimChunks: string[] = [];

      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        const chunk = result?.[0]?.transcript?.trim();
        if (!chunk) continue;

        if (result.isFinal) {
          finalChunks.push(chunk);
        } else {
          interimChunks.push(chunk);
        }
      }

      setTranscript(finalChunks.join(' ').trim());
      setInterimTranscript(interimChunks.join(' ').trim());
    };

    recognition.onerror = (event) => {
      setError(getErrorMessage(event.error));
      setInterimTranscript('');
      setState('error');
    };

    recognition.onend = () => {
      setInterimTranscript('');

      if (shouldResumeListeningRef.current) {
        try {
          isRestartingRef.current = true;
          recognition.start();
          return;
        } catch (_error) {
          isRestartingRef.current = false;
          // If restart fails, fall through to idle so the user is not trapped.
        }
      }

      setState((current) => (current === 'error' ? 'error' : 'idle'));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
      shouldResumeListeningRef.current = false;
    };
  }, [language]);

  useEffect(() => {
    if (state !== 'listening') {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [state]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !isSupported) {
      setState('unsupported');
      return;
    }

    setError(undefined);
    setTranscript('');
    setInterimTranscript('');
    setElapsedSeconds(0);
    shouldResumeListeningRef.current = true;

    try {
      recognition.start();
    } catch (_error) {
      setError('Voice input is already running. Stop it and try again.');
      setState('error');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    shouldResumeListeningRef.current = false;
    isRestartingRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    shouldResumeListeningRef.current = false;
    isRestartingRef.current = false;
    setTranscript('');
    setInterimTranscript('');
    setElapsedSeconds(0);
    setError(undefined);
    setState(isSupported ? 'idle' : 'unsupported');
  }, [isSupported]);

  return {
    state,
    transcript,
    interimTranscript,
    elapsedSeconds,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
