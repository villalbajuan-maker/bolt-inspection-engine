const OPTIONS = [
  { value: 'prevention', label: 'Prevention' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'buy_sell', label: 'Buying or selling' },
  { value: 'recent_damage', label: 'Recent damage' },
  { value: 'understand', label: 'Understand my risk' },
];

type UserGoalStepProps = {
  onSubmit: (value: string) => void;
};

export function UserGoalStep({ onSubmit }: UserGoalStepProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSubmit(option.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
