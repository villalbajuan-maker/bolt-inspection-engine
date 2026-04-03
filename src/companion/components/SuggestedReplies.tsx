type SuggestedRepliesProps = {
  prompts: string[];
  onSelectPrompt?: (prompt: string) => void;
  label?: string;
};

export function SuggestedReplies({
  prompts,
  onSelectPrompt,
  label = 'Suggested replies',
}: SuggestedRepliesProps) {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt?.(prompt)}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-left text-xs font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:text-sm"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
