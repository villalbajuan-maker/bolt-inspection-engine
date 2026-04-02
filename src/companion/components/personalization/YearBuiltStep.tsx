const OPTIONS = ['Before 1995', '1995-2005', '2006-2015', '2016 or later', 'Not sure'];

type YearBuiltStepProps = {
  onSubmit: (value: string) => void;
};

export function YearBuiltStep({ onSubmit }: YearBuiltStepProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSubmit(option)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
