type AddressStepProps = {
  value?: string;
  onSubmit: (value: string) => void;
};

export function AddressStep({ value = '', onSubmit }: AddressStepProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Step 1
      </div>
      <p className="mb-4 text-sm leading-relaxed text-slate-700">
        Enter the exact property address so the Companion can move from ZIP-level context toward property-level guidance.
      </p>
      <button
        type="button"
        onClick={() => value.trim() && onSubmit(value.trim())}
        disabled={!value.trim()}
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
      >
        Use this address
      </button>
    </div>
  );
}
