const OPTIONS = [
  'Previous leaks',
  'Storm damage',
  'Insurance claim history',
  'No known issues',
  'Not sure',
];

type DamageHistoryStepProps = {
  onSubmit: (value: string[]) => void;
};

export function DamageHistoryStep({ onSubmit }: DamageHistoryStepProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSubmit([option])}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
