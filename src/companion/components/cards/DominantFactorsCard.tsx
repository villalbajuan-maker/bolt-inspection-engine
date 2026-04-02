type DominantFactorsCardProps = {
  factors: string[];
};

export function DominantFactorsCard({ factors }: DominantFactorsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Dominant Factors
      </div>
      <div className="flex flex-wrap gap-2">
        {factors.map((factor) => (
          <span
            key={factor}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            {factor}
          </span>
        ))}
      </div>
    </div>
  );
}
