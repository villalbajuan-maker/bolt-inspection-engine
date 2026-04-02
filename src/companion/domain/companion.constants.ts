import type { CompanionMessage, CompanionStage } from './companion.types';

export const DEFAULT_STAGE: CompanionStage = 'welcome';

export const DEFAULT_PROMPTS = [
  'Explain my storm score',
  'What matters most in this report?',
  'What recent storm activity matters here?',
  'Personalize this for my home',
  'What should I do next?',
];

export function buildWelcomeMessage(locationLabel: string): CompanionMessage {
  return {
    id: 'companion-welcome',
    role: 'assistant',
    stage: 'welcome',
    text: `I reviewed your storm report for ${locationLabel}. I can help explain what it means, personalize it to your property, and guide you toward the next best step.`,
    timestamp: new Date().toISOString(),
    sourceMode: 'report',
  };
}
