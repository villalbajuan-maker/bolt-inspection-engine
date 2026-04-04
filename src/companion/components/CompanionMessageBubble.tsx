import type { CompanionMessage } from '../domain/companion.types';

type CompanionMessageBubbleProps = {
  message: CompanionMessage;
};

export function CompanionMessageBubble({ message }: CompanionMessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';
  const isUser = message.role === 'user';

  if (isSystem) {
    return (
      <div className="flex justify-center py-1">
        <div className="inline-flex max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} ${isAssistant ? 'mb-1.5' : ''}`}>
      <div
        className={`${
          isUser ? 'max-w-[84%] sm:max-w-[72%]' : 'max-w-[94%] sm:max-w-[82%]'
        } rounded-[1.5rem] px-4 py-3.5 ${
          isAssistant
            ? 'border border-slate-200/80 bg-white/96 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.05)]'
            : 'bg-[var(--ds-primary-900)] text-white shadow-[0_10px_24px_rgba(11,31,58,0.18)]'
        }`}
      >
        {message.sourceMode && isAssistant && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ds-accent-500)] shadow-[0_0_0_4px_rgba(59,130,246,0.08)]" />
            {message.sourceMode}
          </div>
        )}
        <p
          className={`text-sm leading-[1.7] sm:text-[15px] ${
            isUser ? 'text-white' : 'text-slate-800'
          }`}
        >
          {message.text}
        </p>
      </div>
    </div>
  );
}
