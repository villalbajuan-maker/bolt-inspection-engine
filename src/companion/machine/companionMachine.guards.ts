import type { CompanionEvent } from '../domain/companion.types';

export function isPromptSelection(event: CompanionEvent): event is Extract<CompanionEvent, { type: 'SELECT_PROMPT' }> {
  return event.type === 'SELECT_PROMPT';
}
