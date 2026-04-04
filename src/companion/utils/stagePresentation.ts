import type { CompanionStage, SourceMode } from '../domain/companion.types';

export function getStageTitle(stage: CompanionStage) {
  switch (stage) {
    case 'interpret_report':
      return 'Understanding the report';
    case 'personalize_property':
      return 'Making it more specific';
    case 'live_intelligence':
      return 'Adding live context';
    case 'recommend_action':
      return 'Getting to a next step';
    default:
      return 'Starting with the report';
  }
}

export function getStageSummary(
  stage: CompanionStage,
  locationLabel?: string
) {
  switch (stage) {
    case 'interpret_report':
      return `Translate the report for ${locationLabel || 'this area'} into plain language before narrowing it to a real property decision.`;
    case 'personalize_property':
      return 'Add just enough home detail so the guidance stops being generic and starts feeling relevant.';
    case 'live_intelligence':
      return 'Bring in verified public signals and explain what they change for the reported area.';
    case 'recommend_action':
      return 'Bring the report and property context together into one grounded next step, while still leaving room for follow-up questions.';
    default:
      return 'Start with the report, add context when useful, and move naturally toward the right next step.';
  }
}

export function getStageLabel(stage: CompanionStage) {
  switch (stage) {
    case 'interpret_report':
      return 'Report';
    case 'personalize_property':
      return 'Property';
    case 'live_intelligence':
      return 'Live';
    case 'recommend_action':
      return 'Recommendation';
    default:
      return 'Start';
  }
}

export function getModeLabel(sourceMode: SourceMode) {
  if (sourceMode === 'personalized') return 'Personalized';
  if (sourceMode === 'live') return 'Live';
  return 'Report';
}

export function getModeDescription(sourceMode: SourceMode) {
  if (sourceMode === 'personalized') {
    return 'The Companion is using property details you provided to move beyond ZIP-level interpretation.';
  }
  if (sourceMode === 'live') {
    return 'The Companion is distinguishing verified public signals from the broader geographic risk profile.';
  }
  return 'The Companion is interpreting the report itself before layering on personalization or live context.';
}

export function getStageAccentClasses(stage: CompanionStage) {
  switch (stage) {
    case 'personalize_property':
      return 'border-emerald-200 bg-emerald-50/70';
    case 'live_intelligence':
      return 'border-sky-200 bg-sky-50/70';
    case 'recommend_action':
      return 'border-amber-200 bg-amber-50/70';
    case 'interpret_report':
      return 'border-slate-200 bg-slate-50';
    default:
      return 'border-slate-200 bg-slate-50';
  }
}
