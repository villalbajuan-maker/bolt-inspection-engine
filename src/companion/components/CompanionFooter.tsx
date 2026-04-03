import type { CompanionCTA } from '../domain/companion.types';
import { Send } from 'lucide-react';

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

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-6">
      {activeCTA && !suppressCTA && (
        <div className="mb-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
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
      <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white px-3 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:px-4">
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
                : 'Ask a follow-up question...'
          }
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled={disabled || !currentInput.trim()}
          onClick={onSubmit}
          className="ds-btn-primary flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full !p-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
