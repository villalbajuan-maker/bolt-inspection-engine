import type { CompanionCTA } from '../domain/companion.types';
import { Mic, Send } from 'lucide-react';
import { transcribeCompanionAudio } from '../../api/companionTranscribe';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

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
    state: voiceState,
    elapsedSeconds,
    error: voiceError,
    isSupported,
    startRecording,
    stopRecording,
    setProcessing,
    reset,
  } = useVoiceRecorder();
  const isRecording = voiceState === 'recording';
  const isProcessing = voiceState === 'processing';
  const hasVoiceDraft = Boolean(currentInput.trim());

  const handleVoiceAction = async () => {
    if (disabled || isProcessing) {
      return;
    }

    if (!isRecording) {
      await startRecording();
      return;
    }

    const audioBlob = await stopRecording();
    if (!audioBlob) {
      return;
    }

    try {
      setProcessing(true);
      const { transcript } = await transcribeCompanionAudio(audioBlob);
      onType?.(transcript);
      setProcessing(false);
    } catch (_error) {
      setProcessing(false);
      reset();
    }
  };

  const clearVoiceDraft = () => {
    onType?.('');
    reset();
  };

  const submitCurrentMessage = async () => {
    if (!currentInput.trim() || isRecording || isProcessing) {
      return;
    }

    onSubmit?.();
    reset();
  };

  const voiceStatusText =
    voiceState === 'error'
      ? voiceError
      : isProcessing
        ? 'Transcribing'
        : isRecording
          ? 'Recording'
          : hasVoiceDraft
            ? 'Voice draft ready'
            : undefined;

  const statusTone =
    voiceState === 'error'
      ? 'error'
      : isProcessing
        ? 'processing'
        : isRecording
          ? 'recording'
          : hasVoiceDraft
            ? 'draft'
            : 'idle';

  const placeholder =
    isAddressCapture
      ? 'Enter the exact property address to continue personalization...'
      : isStructuredCapture
        ? 'Type an answer to continue the conversation...'
        : isProcessing
          ? 'Transcribing your recording...'
          : isRecording
            ? 'Recording your question...'
            : 'Ask a follow-up question...';

  const elapsedLabel = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(
    elapsedSeconds % 60
  ).padStart(2, '0')}`;

  const voiceButtonTitle = isRecording
    ? 'Stop recording'
    : isProcessing
      ? 'Transcribing'
      : 'Start recording';

  const sendButtonTitle = isRecording
    ? 'Finish recording first'
    : isProcessing
      ? 'Transcribing audio'
      : 'Send message';

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
          isRecording
            ? 'border-rose-200'
            : isProcessing
              ? 'border-amber-200'
              : hasVoiceDraft
                ? 'border-sky-200'
                : 'border-slate-200'
        }`}
      >
        {(voiceStatusText || hasVoiceDraft) && (
          <div className="mb-2 flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                statusTone === 'error'
                  ? 'bg-rose-50 text-rose-700'
                  : statusTone === 'processing'
                    ? 'bg-amber-50 text-amber-700'
                    : statusTone === 'recording'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-sky-50 text-sky-700'
              }`}
            >
              {statusTone === 'error' ? (
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
              ) : statusTone === 'processing' ? (
                <span className="inline-flex items-end gap-0.5">
                  <span className="h-2 w-0.5 animate-pulse rounded-full bg-amber-500 [animation-delay:0ms]" />
                  <span className="h-3 w-0.5 animate-pulse rounded-full bg-amber-500 [animation-delay:120ms]" />
                  <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-amber-500 [animation-delay:240ms]" />
                </span>
              ) : statusTone === 'recording' ? (
                <span className="inline-flex items-end gap-0.5">
                  <span className="h-2 w-0.5 animate-pulse rounded-full bg-rose-500 [animation-delay:0ms]" />
                  <span className="h-3 w-0.5 animate-pulse rounded-full bg-rose-500 [animation-delay:120ms]" />
                  <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-rose-500 [animation-delay:240ms]" />
                </span>
              ) : (
                <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
              )}
              {isRecording ? (
                <>
                  <span>{elapsedLabel}</span>
                  <span className="opacity-50">•</span>
                </>
              ) : null}
              <span>{voiceStatusText}</span>
            </div>

            {hasVoiceDraft && !isRecording && !isProcessing && voiceState !== 'error' && (
              <button
                type="button"
                onClick={clearVoiceDraft}
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
            disabled={disabled || isProcessing}
            onChange={(event) => onType?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !disabled && !isProcessing) {
                event.preventDefault();
                void submitCurrentMessage();
              }
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-[15px] text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed sm:text-sm"
          />
          {isSupported && (
            <button
              type="button"
              disabled={disabled || isProcessing}
              onClick={() => void handleVoiceAction()}
              title={voiceButtonTitle}
              aria-label={voiceButtonTitle}
              aria-pressed={isRecording}
              className={`flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full border shadow-sm transition-colors ${
                isRecording
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : isProcessing
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : hasVoiceDraft
                      ? 'border-sky-300 bg-sky-50 text-sky-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {isRecording ? <span className="h-3.5 w-3.5 rounded-[3px] bg-current" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            disabled={disabled || isProcessing || isRecording || !currentInput.trim()}
            onClick={() => void submitCurrentMessage()}
            title={sendButtonTitle}
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
