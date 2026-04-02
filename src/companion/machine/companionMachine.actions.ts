import type {
  CompanionMachineState,
  CompanionMessage,
  CompanionSessionContext,
  RequestedField,
  SourceMode,
} from '../domain/companion.types';

export function createClosedSessionContext(): CompanionSessionContext {
  return {
    status: 'idle',
    machineState: 'closed',
    activeStage: 'welcome',
    sourceMode: 'report',
    currentInput: '',
    suggestedPrompts: [],
    messages: [],
    requestedFields: [],
    personalization: {
      completionScore: 0,
    },
    recommendation: undefined,
    activeCTA: undefined,
  };
}

export function setMachineState(
  context: CompanionSessionContext,
  machineState: CompanionMachineState,
  status: CompanionSessionContext['status']
): CompanionSessionContext {
  return {
    ...context,
    machineState,
    status,
  };
}

export function setWelcomePayload(
  context: CompanionSessionContext,
  payload: {
    message: CompanionMessage;
    suggestedPrompts: string[];
    sourceMode?: SourceMode;
  }
): CompanionSessionContext {
  return {
    ...context,
    machineState: 'ready',
    status: 'ready',
    activeStage: 'welcome',
    sourceMode: payload.sourceMode || 'report',
    messages: [payload.message],
    suggestedPrompts: payload.suggestedPrompts,
    requestedFields: [],
    currentInput: '',
    recommendation: undefined,
    activeCTA: undefined,
    error: undefined,
  };
}

export function setErrorState(
  context: CompanionSessionContext,
  payload: {
    code: string;
    message: string;
    retryable: boolean;
  }
): CompanionSessionContext {
  return {
    ...context,
    machineState: 'error',
    status: 'error',
    error: payload,
  };
}

export function setThinkingState(
  context: CompanionSessionContext,
  payload: {
    currentInput: string;
  }
): CompanionSessionContext {
  return {
    ...context,
    machineState: 'thinking',
    status: 'thinking',
    currentInput: payload.currentInput,
    activeCTA: context.activeCTA,
    error: undefined,
  };
}

function calculateCompletionScore(personalization: CompanionSessionContext['personalization']) {
  let score = 0;
  if (personalization.exactAddress) score += 0.3;
  if (personalization.roofType) score += 0.2;
  if (personalization.yearBuilt) score += 0.15;
  if (personalization.damageHistory?.length) score += 0.15;
  if (personalization.userGoal) score += 0.2;
  return Math.min(score, 1);
}

export function applyInterpretationResponse(
  context: CompanionSessionContext,
  payload: {
    stage: CompanionSessionContext['activeStage'];
    sourceMode: SourceMode;
    userMessage: CompanionMessage;
    assistantMessage: CompanionMessage;
    suggestedPrompts: string[];
    requestedFields?: RequestedField[];
    personalization?: Partial<CompanionSessionContext['personalization']>;
    recommendation?: CompanionSessionContext['recommendation'];
    cta?: CompanionSessionContext['activeCTA'];
  }
): CompanionSessionContext {
  return {
    ...context,
    machineState: 'ready',
    status: 'ready',
    activeStage: payload.stage,
    sourceMode: payload.sourceMode,
    messages: [...context.messages, payload.userMessage, payload.assistantMessage],
    suggestedPrompts: payload.suggestedPrompts,
    requestedFields: payload.requestedFields || [],
    currentInput: '',
    recommendation: payload.recommendation || context.recommendation,
    activeCTA: payload.cta || undefined,
    personalization: payload.personalization
      ? {
          ...context.personalization,
          ...payload.personalization,
          completionScore: calculateCompletionScore({
            ...context.personalization,
            ...payload.personalization,
          }),
        }
      : context.personalization,
    error: undefined,
  };
}
