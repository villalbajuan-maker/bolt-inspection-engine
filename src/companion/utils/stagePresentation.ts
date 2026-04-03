import type { CompanionStage, SourceMode } from '../domain/companion.types';

export function getStageTitle(stage: CompanionStage) {
  switch (stage) {
    case 'interpret_report':
      return 'Understand the report';
    case 'personalize_property':
      return 'Personalize the property';
    case 'live_intelligence':
      return 'Check live context';
    case 'recommend_action':
      return 'Review the recommendation';
    default:
      return 'Start with the report';
  }
}

export function getStageSummary(
  stage: CompanionStage,
  locationLabel?: string
) {
  switch (stage) {
    case 'interpret_report':
      return `Translate the report for ${locationLabel || 'this area'} into plain language before moving into property-specific guidance.`;
    case 'personalize_property':
      return 'Add a few home details so the guidance becomes more specific to this property.';
    case 'live_intelligence':
      return 'Review verified public signals alongside the broader regional picture.';
    case 'recommend_action':
      return 'Bring the report and property context together into one clear next step and move naturally into booking.';
    default:
      return 'Understand the report, personalize it, and move toward the right next step.';
  }
}

export function getStageLabel(stage: CompanionStage) {
  switch (stage) {
    case 'interpret_report':
      return 'Reading the report';
    case 'personalize_property':
      return 'Adding property context';
    case 'live_intelligence':
      return 'Checking live context';
    case 'recommend_action':
      return 'Preparing the recommendation';
    default:
      return 'Starting the conversation';
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
