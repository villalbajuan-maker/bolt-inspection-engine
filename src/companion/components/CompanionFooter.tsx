import type { CompanionCTA } from '../domain/companion.types';
import { Mic, Send } from 'lucide-react';
import { useEffect } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';

type CompanionFooterProps = {
  currentInput?: string;
  disabled?: boolean;
  requestedFields?: string[];
  activeCTA?: CompanionCTA;
  suppressCTA?: boolean;
  onType?: (value: string) => void;
  onSubmit?: () => void;
  onCTA?: (cta: CompanionCTA) => void;
};

export function CompanionFooter({
  currentInput = '',
  disabled = false,
  requestedFields = [],
  activeCTA,
  suppressCTA = false,
  onType,
  onSubmit,
  onCTA,
}: CompanionFooterProps) {
  const isAddressCapture = requestedFields.includes('exactAddress');
  const isStructuredCapture = requestedFields.length > 0;
  const {
    state: speechState,
    transcript,
    interimTranscript,
    elapsedSeconds,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText();
  const isListening = speechState === 'listening';
  const currentVoiceText = [transcript.trim(), interimTranscript.trim()].filter(Boolean).join(' ').trim();
  const hasVoiceDraft = Boolean(currentVoiceText);

  useEffect(() => {
    if (!currentVoiceText) {
      return;
    }

    onType?.(currentVoiceText);
  }, [currentVoiceText, onType]);

  const submitCurrentMessage = () => {
    if (!currentInput.trim()) {
      return;
    }

    if (isListening) {
      stopListening();
    }

    onSubmit?.();
    resetTranscript();
  };

  const voiceStatusText =
    speechState === 'error'
      ? speechError
      : isListening
        ? 'Listening'
        : undefined;

  const elapsedLabel = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(
    elapsedSeconds % 60
  ).padStart(2, '0')}`;

  return (
    <div className="border-t border-slate-200/90 bg-white/90 px-4 py-2.5 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] backdrop-blur-xl sm:px-6">
      {activeCTA && !suppressCTA && (
        <div className="mb-2 rounded-2xl border border-slate-200 bg-slate-50/90 p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Recommended action
          </div>
          <button
            type="button"
            onClick={() => onCTA?.(activeCTA)}
            className="ds-btn-primary inline-flex min-h-[48px] w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold"
          >
            {activeCTA.label}
          </button>
        </div>
      )}
      <div
        className={`rounded-[22px] border bg-white/96 px-3 py-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-colors sm:px-4 ${
          isListening
            ? 'border-rose-200'
            : hasVoiceDraft
              ? 'border-sky-200'
              : 'border-slate-200'
        }`}
      >
        {(voiceStatusText || hasVoiceDraft) && (
          <div className="mb-2 flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                speechState === 'error'
                  ? 'bg-rose-50 text-rose-700'
                  : isListening
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-sky-50 text-sky-700'
              }`}
            >
              {speechState === 'error' ? (
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
              ) : isListening ? (
                <span className="inline-flex items-end gap-0.5">
                  <span className="h-2 w-0.5 animate-pulse rounded-full bg-rose-500 [animation-delay:0ms]" />
                  <span className="h-3 w-0.5 animate-pulse rounded-full bg-rose-500 [animation-delay:120ms]" />
                  <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-rose-500 [animation-delay:240ms]" />
                </span>
              ) : (
                <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
              )}
              {isListening ? (
                <>
                  <span>{elapsedLabel}</span>
                  <span className="opacity-50">•</span>
                </>
              ) : null}
              <span>{voiceStatusText || 'Voice draft ready'}</span>
            </div>

            {hasVoiceDraft && !isListening && speechState !== 'error' && (
              <button
                type="button"
                onClick={resetTranscript}
                className="text-[11px] font-semibold text-slate-500 transition-colors hover:text-slate-800"
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={currentInput}
            disabled={disabled}
            onChange={(event) => onType?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !disabled) {
                event.preventDefault();
                onSubmit?.();
              }
            }}
            placeholder={
              isAddressCapture
                ? 'Enter the exact property address to continue personalization...'
                : isStructuredCapture
                  ? 'Type an answer to continue the conversation...'
                  : isListening
                    ? 'Speak naturally...'
                    : 'Ask a follow-up question...'
            }
            className="w-full bg-transparent text-[15px] text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed sm:text-sm"
          />
          {isSupported && (
            <button
              type="button"
              disabled={disabled}
              onClick={isListening ? stopListening : startListening}
              title={isListening ? 'Stop dictation' : 'Start dictation'}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              aria-pressed={isListening}
              className={`flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full border shadow-sm transition-colors ${
                isListening
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : hasVoiceDraft
                    ? 'border-sky-300 bg-sky-50 text-sky-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {isListening ? <span className="h-3.5 w-3.5 rounded-[3px] bg-current" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            disabled={disabled || !currentInput.trim()}
            onClick={submitCurrentMessage}
            title={isListening ? 'Transcribe and send' : 'Send message'}
            className="ds-btn-primary flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full !p-0 shadow-[0_10px_24px_rgba(47,107,255,0.18)]"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
