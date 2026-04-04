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
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt?.(prompt)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-[13px] font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:w-auto sm:rounded-full sm:py-2 sm:text-[13px]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
