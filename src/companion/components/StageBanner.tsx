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
    <div className={`rounded-2xl border px-3.5 py-2.5 ${getStageAccentClasses(stage)}`}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ds-accent-500)]" />
          {getModeLabel(sourceMode)}
        </div>
        <div className="text-[13px] font-semibold text-slate-900">
          {getStageTitle(stage)}
        </div>
        {typeof stormScore === 'number' && (
          <div className="rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
            Score {stormScore}
          </div>
        )}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
        {getStageSummary(stage, locationLabel)}
      </p>
    </div>
  );
}
