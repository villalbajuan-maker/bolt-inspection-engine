import type { CompanionStage, SourceMode } from '../domain/companion.types';
import {
  getModeLabel,
  getStageAccentClasses,
  getStageSummary,
  getStageTitle,
} from '../utils/stagePresentation';

type StageBannerProps = {
  stage: CompanionStage;
  sourceMode: SourceMode;
  locationLabel?: string;
  stormScore?: number;
};

export function StageBanner({
  stage,
  sourceMode,
  locationLabel,
  stormScore,
}: StageBannerProps) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${getStageAccentClasses(stage)}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {getModeLabel(sourceMode)} mode
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {getStageTitle(stage)}
          </h3>
        </div>
        {typeof stormScore === 'number' && (
          <div className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            Score {stormScore}/100
          </div>
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        {getStageSummary(stage, locationLabel)}
      </p>
    </div>
  );
}
