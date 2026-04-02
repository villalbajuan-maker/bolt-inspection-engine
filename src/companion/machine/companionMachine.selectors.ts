import type { CompanionSessionContext } from '../domain/companion.types';

export function selectActiveStage(context: CompanionSessionContext) {
  return context.activeStage;
}

export function selectSuggestedPrompts(context: CompanionSessionContext) {
  return context.suggestedPrompts;
}

export function selectMessages(context: CompanionSessionContext) {
  return context.messages;
}

export function selectSourceMode(context: CompanionSessionContext) {
  return context.sourceMode;
}

export function selectCurrentInput(context: CompanionSessionContext) {
  return context.currentInput;
}

export function selectRequestedFields(context: CompanionSessionContext) {
  return context.requestedFields;
}

export function selectPersonalization(context: CompanionSessionContext) {
  return context.personalization;
}

export function selectRecommendation(context: CompanionSessionContext) {
  return context.recommendation;
}

export function selectActiveCTA(context: CompanionSessionContext) {
  return context.activeCTA;
}

export function selectIsThinking(context: CompanionSessionContext) {
  return context.machineState === 'thinking' || context.machineState === 'booting';
}

export function selectIsError(context: CompanionSessionContext) {
  return context.machineState === 'error';
}
