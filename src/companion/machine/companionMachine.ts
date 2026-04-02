import type { CompanionEvent, CompanionSessionContext } from '../domain/companion.types';
import {
  applyInterpretationResponse,
  createClosedSessionContext,
  setErrorState,
  setMachineState,
  setThinkingState,
  setWelcomePayload,
} from './companionMachine.actions';

export function createInitialCompanionState(): CompanionSessionContext {
  return createClosedSessionContext();
}

export function companionMachine(
  context: CompanionSessionContext,
  event: CompanionEvent
): CompanionSessionContext {
  switch (event.type) {
    case 'OPEN_MODAL':
      return setMachineState(context, 'booting', 'booting');

    case 'BOOT_SUCCESS':
      return setWelcomePayload(context, {
        message: event.welcomeMessage,
        suggestedPrompts: event.suggestedPrompts,
      });

    case 'BOOT_FAILURE':
      return setErrorState(context, {
        code: event.code,
        message: event.message,
        retryable: event.retryable,
      });

    case 'USER_TYPED':
      return {
        ...context,
        currentInput: event.value,
      };

    case 'SELECT_PROMPT':
      return {
        ...context,
        currentInput: event.prompt,
      };

    case 'SUBMIT_MESSAGE':
      return setThinkingState(context, {
        currentInput: event.text,
      });

    case 'FIELD_PROVIDED':
      return setThinkingState(context, {
        currentInput: Array.isArray(event.value) ? event.value.join(', ') : event.value,
      });

    case 'AI_RESPONSE_SUCCESS':
      return applyInterpretationResponse(context, event.payload);

    case 'AI_RESPONSE_FAILURE':
      return setErrorState(context, {
        code: event.code,
        message: event.message,
        retryable: event.retryable,
      });

    case 'RESET_SESSION':
      return setMachineState(createClosedSessionContext(), 'booting', 'booting');

    case 'CLOSE_MODAL':
      return createClosedSessionContext();

    default:
      return context;
  }
}
