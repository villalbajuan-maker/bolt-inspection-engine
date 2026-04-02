import type { CompanionCTA } from '../domain/companion.types';
import { Send } from 'lucide-react';
import { CompanionPromptChips } from './CompanionPromptChips';

type CompanionFooterProps = {
  currentInput?: string;
  suggestedPrompts: string[];
  disabled?: boolean;
  requestedFields?: string[];
  activeCTA?: CompanionCTA;
  onType?: (value: string) => void;
  onSelectPrompt?: (prompt: string) => void;
  onSubmit?: () => void;
  onCTA?: (cta: CompanionCTA) => void;
};

export function CompanionFooter({
  currentInput = '',
  suggestedPrompts,
  disabled = false,
  requestedFields = [],
  activeCTA,
  onType,
  onSelectPrompt,
  onSubmit,
  onCTA,
}: CompanionFooterProps) {
  const isAddressCapture = requestedFields.includes('exactAddress');
  const isStructuredCapture = requestedFields.length > 0;

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {isStructuredCapture ? 'Suggested answers' : 'Suggested questions'}
        </div>
        <CompanionPromptChips prompts={suggestedPrompts.slice(0, 3)} onSelectPrompt={onSelectPrompt} />
      </div>
      {activeCTA && (
        <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Recommended action
          </div>
          <button
            type="button"
            onClick={() => onCTA?.(activeCTA)}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-slate-800"
          >
            {activeCTA.label}
          </button>
        </div>
      )}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
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
                ? 'Type an answer or choose one of the suggested options...'
              : 'Type a question or select a prompt to continue...'
          }
          className="w-full bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled={disabled || !currentInput.trim()}
          onClick={onSubmit}
          className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-slate-900 text-white transition-opacity disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
