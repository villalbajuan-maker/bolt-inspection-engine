type CompanionPromptGridProps = {
  prompts: string[];
  onSelectPrompt?: (prompt: string) => void;
};

export function CompanionPromptGrid({ prompts, onSelectPrompt }: CompanionPromptGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelectPrompt?.(prompt)}
          className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-medium text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
