import type { CompanionStage, SourceMode } from '../domain/companion.types';

export function getStageTitle(stage: CompanionStage) {
  switch (stage) {
    case 'interpret_report':
      return 'Understand Your Report';
    case 'personalize_property':
      return 'Personalize This Property';
    case 'live_intelligence':
      return 'Live Regional Context';
    case 'recommend_action':
      return 'Recommended Next Step';
    case 'conversion_soft':
      return 'Review Your Options';
    case 'conversion_hard':
      return 'Schedule The Right Inspection';
    default:
      return 'Start With Your Report';
  }
}

export function getStageSummary(
  stage: CompanionStage,
  locationLabel?: string
) {
  switch (stage) {
    case 'interpret_report':
      return `Use the Companion to translate the report for ${locationLabel || 'this property area'} into plain language before moving into property-specific guidance.`;
    case 'personalize_property':
      return 'Add a few details about the home so the Companion can turn regional exposure into a more relevant inspection recommendation.';
    case 'live_intelligence':
      return 'Review verified public signals alongside the broader geographic risk profile to separate what is current from what is structural.';
    case 'recommend_action':
      return 'This is the point where the report and the property context come together into a concrete next best action.';
    case 'conversion_soft':
      return 'Compare the next options before deciding whether to move into booking.';
    case 'conversion_hard':
      return 'You are close to booking. Review the recommendation and move into the scheduling flow with the right context attached.';
    default:
      return 'Understand the report, personalize it to the property, and move toward the most useful next step.';
  }
}

export function getStageLabel(stage: CompanionStage) {
  switch (stage) {
    case 'interpret_report':
      return 'Understanding the report';
    case 'personalize_property':
      return 'Personalizing the property';
    case 'live_intelligence':
      return 'Reviewing live regional context';
    case 'recommend_action':
      return 'Preparing the next best action';
    case 'conversion_soft':
    case 'conversion_hard':
      return 'Preparing the booking step';
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
