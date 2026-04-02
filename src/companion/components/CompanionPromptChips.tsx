type CompanionPromptChipsProps = {
  prompts: string[];
  onSelectPrompt?: (prompt: string) => void;
};

export function CompanionPromptChips({ prompts, onSelectPrompt }: CompanionPromptChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelectPrompt?.(prompt)}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 sm:text-sm"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
