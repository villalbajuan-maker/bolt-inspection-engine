type ReportSnapshotCardProps = {
  score: number;
  riskLevel: string;
  location: string;
  zipCode: string;
};

export function ReportSnapshotCard({
  score,
  riskLevel,
  location,
  zipCode,
}: ReportSnapshotCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Report Snapshot
      </div>
      <div className="mb-3 flex items-end gap-2">
        <span className="text-4xl font-bold text-slate-900">{score}</span>
        <span className="pb-1 text-sm font-medium text-slate-500">/100</span>
      </div>
      <div className="mb-2 text-sm font-semibold text-slate-900">{riskLevel}</div>
      <div className="text-sm text-slate-600">{location}</div>
      <div className="mt-3 text-xs text-slate-500">ZIP {zipCode}</div>
    </div>
  );
}
