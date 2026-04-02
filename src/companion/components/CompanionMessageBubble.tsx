import type { CompanionMessage } from '../domain/companion.types';

type CompanionMessageBubbleProps = {
  message: CompanionMessage;
};

export function CompanionMessageBubble({ message }: CompanionMessageBubbleProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-3xl rounded-2xl px-4 py-4 shadow-sm ${
          isAssistant
            ? 'border border-slate-200 bg-white text-slate-800'
            : 'bg-slate-900 text-white'
        }`}
      >
        {message.sourceMode && isAssistant && (
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {message.sourceMode}
          </div>
        )}
        <p className="text-sm leading-relaxed sm:text-[15px]">{message.text}</p>
      </div>
    </div>
  );
}
