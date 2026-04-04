import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type VoiceRecorderState = 'idle' | 'recording' | 'processing' | 'error' | 'unsupported';

type UseVoiceRecorderResult = {
  state: VoiceRecorderState;
  elapsedSeconds: number;
  error?: string;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  setProcessing: (value: boolean) => void;
  reset: () => void;
};

function getRecorderSupport() {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined'
  );
}

function getRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }

  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function getVoiceErrorMessage(error?: unknown) {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'Microphone access was blocked. Please allow microphone access and try again.';
  }

  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return 'No microphone was detected. Try another device or type your question.';
  }

  return 'We could not capture voice input. Try again or type your question.';
}

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [state, setState] = useState<VoiceRecorderState>(() =>
    getRecorderSupport() ? 'idle' : 'unsupported'
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string>();
  const isSupported = useMemo(() => getRecorderSupport(), []);

  useEffect(() => {
    if (state !== 'recording') {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state]);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => cleanupStream, [cleanupStream]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setState('unsupported');
      return;
    }

    try {
      cleanupStream();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getRecorderMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      chunksRef.current = [];
      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      setError(undefined);
      setElapsedSeconds(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError('We could not capture voice input. Try again or type your question.');
        setState('error');
      };

      recorder.onstart = () => {
        setState('recording');
      };

      recorder.start();
    } catch (captureError) {
      cleanupStream();
      setError(getVoiceErrorMessage(captureError));
      setState('error');
    }
  }, [cleanupStream, isSupported]);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      return null;
    }

    return new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || chunksRef.current[0]?.type || 'audio/webm';
        const blob =
          chunksRef.current.length > 0 ? new Blob(chunksRef.current, { type: mimeType }) : null;

        mediaRecorderRef.current = null;
        chunksRef.current = [];
        cleanupStream();
        setState('idle');
        resolve(blob);
      };

      recorder.stop();
    });
  }, [cleanupStream]);

  const setProcessing = useCallback((value: boolean) => {
    setState(value ? 'processing' : 'idle');
  }, []);

  const reset = useCallback(() => {
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    cleanupStream();
    setElapsedSeconds(0);
    setError(undefined);
    setState(isSupported ? 'idle' : 'unsupported');
  }, [cleanupStream, isSupported]);

  return {
    state,
    elapsedSeconds,
    error,
    isSupported,
    startRecording,
    stopRecording,
    setProcessing,
    reset,
  };
}
