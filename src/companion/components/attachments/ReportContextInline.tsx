import { Gauge, Waves, Wind } from 'lucide-react';
import type { CompanionReportContext } from '../../domain/companion.types';
import { InlineAttachment } from './InlineAttachment';

type ReportContextInlineProps = {
  reportContext: CompanionReportContext;
};

function getDominantFactor(reportContext: CompanionReportContext) {
  const factors = [
    { label: 'Wind pressure', score: reportContext.hurricaneScore, icon: Wind },
    { label: 'Flood pressure', score: reportContext.floodScore, icon: Waves },
    { label: 'Coastal pressure', score: reportContext.coastalScore, icon: Gauge },
  ].sort((a, b) => b.score - a.score);

  return factors[0];
}

export function ReportContextInline({ reportContext }: ReportContextInlineProps) {
  const dominantFactor = getDominantFactor(reportContext);
  const DominantIcon = dominantFactor.icon;

  return (
    <InlineAttachment
      eyebrow="Report context"
      title={`Storm score ${reportContext.stormScore}`}
      description={`This score reflects ZIP-level exposure for the reported area, with the strongest signal currently coming from ${dominantFactor.label.toLowerCase()}.`}
      icon={Gauge}
      tone="info"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          <DominantIcon className="h-3.5 w-3.5" />
          {dominantFactor.label}
        </div>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          {reportContext.riskLevel}
        </div>
      </div>
    </InlineAttachment>
  );
}
