import { ClipboardCheck, ShieldCheck, Wind } from 'lucide-react';
import type { CompanionCTA, CompanionRecommendation, SourceMode } from '../../domain/companion.types';
import { InlineAttachment } from './InlineAttachment';

type RecommendationInlineProps = {
  recommendation: CompanionRecommendation;
  sourceMode?: SourceMode;
  activeCTA?: CompanionCTA;
  onCTA?: (cta: CompanionCTA) => void;
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

export function RecommendationInline({
  recommendation,
  sourceMode = 'personalized',
  activeCTA,
  onCTA,
}: RecommendationInlineProps) {
  const Icon = getInspectionIcon(recommendation.inspectionType);
  const highlights = getInspectionHighlights(recommendation.inspectionType);
  const tone =
    recommendation.urgency === 'high'
      ? 'warning'
      : recommendation.urgency === 'medium'
        ? 'info'
        : 'success';
  const visualPalette =
    recommendation.inspectionType === 'Wind Mitigation Inspection'
      ? 'from-sky-600 via-blue-600 to-cyan-500'
      : recommendation.inspectionType === 'Insurance Readiness Inspection'
        ? 'from-emerald-600 via-green-600 to-lime-500'
        : 'from-slate-800 via-slate-700 to-slate-600';

  return (
    <InlineAttachment
      eyebrow="Recommended next step"
      title={recommendation.inspectionType}
      description={getOutcomeSummary(recommendation.inspectionType, sourceMode)}
      icon={Icon}
      tone={tone}
      media={
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/92">
          <div className="grid gap-0 sm:grid-cols-[190px_minmax(0,1fr)]">
            <div className={`relative min-h-[150px] overflow-hidden bg-gradient-to-br ${visualPalette}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_42%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent)]" />
              <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                {recommendation.urgency} priority
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/14 text-white shadow-inner backdrop-blur-sm">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-white/75">
                  Inspection preview
                </div>
                <div className="mt-1 text-lg font-semibold leading-tight text-white">
                  {recommendation.inspectionType}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 p-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Decision-ready
                  </div>
                  <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                    {recommendation.urgency} priority
                  </div>
                </div>
                <div className="mt-3 text-sm font-semibold leading-snug text-slate-900">
                  {recommendation.inspectionType}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {recommendation.rationale}
                </p>
              </div>

              {activeCTA && (
                <button
                  type="button"
                  onClick={() => onCTA?.(activeCTA)}
                  className="ds-btn-primary inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[0_12px_28px_rgba(47,107,255,0.18)]"
                >
                  {activeCTA.label}
                </button>
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white/82 p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            What you get next
          </div>
          <div className="mt-3 space-y-2">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-start gap-2.5">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-[var(--ds-primary-900)]" />
                <p className="text-sm leading-relaxed text-slate-700">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InlineAttachment>
  );
}
