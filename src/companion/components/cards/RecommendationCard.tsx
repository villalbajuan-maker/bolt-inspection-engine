import { ClipboardCheck, Home, ShieldCheck, Wind } from 'lucide-react';
import type { CompanionRecommendation } from '../../domain/companion.types';
import type { SourceMode } from '../../domain/companion.types';

type RecommendationCardProps = {
  recommendation: CompanionRecommendation;
  sourceMode?: SourceMode;
};

function getInspectionIcon(inspectionType: CompanionRecommendation['inspectionType']) {
  if (inspectionType === 'Wind Mitigation Inspection') {
    return Wind;
  }
  if (inspectionType === 'Insurance Readiness Inspection') {
    return ShieldCheck;
  }
  return ClipboardCheck;
}

function getInspectionHighlights(inspectionType: CompanionRecommendation['inspectionType']) {
  if (inspectionType === 'Wind Mitigation Inspection') {
    return [
      'Roof and opening protection review',
      'More precise wind-readiness documentation',
      'A stronger basis for next inspection decisions',
    ];
  }

  if (inspectionType === 'Insurance Readiness Inspection') {
    return [
      'Documentation tailored to insurance conversations',
      'Clearer view of condition and exposure concerns',
      'A stronger readiness position for follow-up actions',
    ];
  }

  return [
    'A broad condition review tied to this risk profile',
    'Clearer visibility into key system vulnerabilities',
    'A practical foundation for the next property decision',
  ];
}

function getOutcomeSummary(
  inspectionType: CompanionRecommendation['inspectionType'],
  sourceMode: SourceMode
) {
  const sourcePhrase =
    sourceMode === 'live'
      ? 'live regional signals'
      : sourceMode === 'personalized'
        ? 'your property details'
        : 'the report itself';

  if (inspectionType === 'Wind Mitigation Inspection') {
    return `Best when the next decision should be driven by wind exposure and roof-related resilience, using ${sourcePhrase} as context.`;
  }

  if (inspectionType === 'Insurance Readiness Inspection') {
    return `Best when the next decision is tied to documentation, underwriting readiness, or insurance-facing clarity, using ${sourcePhrase} as context.`;
  }

  return `Best when you need a broad condition-based next step that turns ${sourcePhrase} into a clearer property assessment.`;
}

export function RecommendationCard({
  recommendation,
  sourceMode = 'personalized',
}: RecommendationCardProps) {
  const urgencyColor =
    recommendation.urgency === 'high'
      ? 'bg-red-100 text-red-700 border-red-200'
      : recommendation.urgency === 'medium'
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-green-100 text-green-700 border-green-200';
  const Icon = getInspectionIcon(recommendation.inspectionType);
  const highlights = getInspectionHighlights(recommendation.inspectionType);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
            <Home className="h-3.5 w-3.5" />
            Recommended next step
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${urgencyColor}`}>
            {recommendation.urgency} priority
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-2xl font-bold leading-tight text-white">
              {recommendation.inspectionType}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              {getOutcomeSummary(recommendation.inspectionType, sourceMode)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Why this fits your case
          </div>
          <p className="text-sm leading-relaxed text-slate-700">{recommendation.rationale}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            What you get next
          </div>
          <div className="space-y-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-900" />
                <p className="text-sm leading-relaxed text-slate-700">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
