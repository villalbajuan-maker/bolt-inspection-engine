import type { CompanionRecommendation, CompanionReportContext, CompanionStage, SourceMode } from '../domain/companion.types';
import { DominantFactorsCard } from './cards/DominantFactorsCard';
import { ReportSnapshotCard } from './cards/ReportSnapshotCard';
import {
  getModeDescription,
  getModeLabel,
  getStageLabel,
} from '../utils/stagePresentation';

type CompanionContextRailProps = {
  reportContext: CompanionReportContext;
  sourceMode: SourceMode;
  activeStage: CompanionStage;
  recommendation?: CompanionRecommendation;
  personalization?: {
    exactAddress?: string;
    roofType?: string;
    yearBuilt?: string;
    damageHistory?: string[];
    userGoal?: string;
    completionScore: number;
  };
};

function getLocationLabel(reportContext: CompanionReportContext): string {
  return reportContext.county
    ? [reportContext.city, reportContext.county, reportContext.state || 'Florida'].filter(Boolean).join(', ')
    : reportContext.city
      ? `${reportContext.city}, Florida`
      : `ZIP ${reportContext.zipCode}`;
}

function getDominantFactors(reportContext: CompanionReportContext): string[] {
  const scoredFactors = [
    { label: 'Wind', score: reportContext.hurricaneScore },
    { label: 'Flood', score: reportContext.floodScore },
    { label: 'Coastal', score: reportContext.coastalScore },
  ].sort((a, b) => b.score - a.score);

  return scoredFactors.slice(0, 2).map((factor) => factor.label);
}

export function CompanionContextRail({
  reportContext,
  sourceMode,
  activeStage,
  recommendation,
  personalization,
}: CompanionContextRailProps) {
  const location = getLocationLabel(reportContext);
  const dominantFactors = getDominantFactors(reportContext);
  const completion = Math.round((personalization?.completionScore || 0) * 100);

  return (
    <aside className="space-y-4 lg:sticky lg:top-[88px]">
      <ReportSnapshotCard
        score={reportContext.stormScore}
        riskLevel={reportContext.riskLevel}
        location={location}
        zipCode={reportContext.zipCode}
      />
      <DominantFactorsCard factors={dominantFactors} />
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Session Mode
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {getStageLabel(activeStage)}
            </div>
          </div>
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-700">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">{getModeLabel(sourceMode)}</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          {getModeDescription(sourceMode)}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Property Context
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {completion}% complete
          </div>
        </div>
        <div className="space-y-3 text-sm text-slate-700">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Address</div>
            <div className="mt-1">{personalization?.exactAddress || 'Not provided yet'}</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Roof</div>
              <div className="mt-1">{personalization?.roofType || 'Not provided yet'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Year built</div>
              <div className="mt-1">{personalization?.yearBuilt || 'Not provided yet'}</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Goal</div>
            <div className="mt-1">{personalization?.userGoal || 'Not provided yet'}</div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {recommendation && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Recommended Next Step
          </div>
          <div className="text-base font-semibold text-slate-900">
            {recommendation.inspectionType}
          </div>
          <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
            {recommendation.urgency} priority
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {recommendation.rationale}
          </p>
        </div>
      )}
    </aside>
  );
}
