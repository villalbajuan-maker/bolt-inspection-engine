import type { CompanionMessage, CompanionStage } from './companion.types';

export const DEFAULT_STAGE: CompanionStage = 'welcome';

export const DEFAULT_PROMPTS = [
  'Explain my storm score',
  'What matters most here?',
  'Personalize this for my home',
];

export function buildWelcomeMessage(locationLabel: string): CompanionMessage {
  return {
    id: 'companion-welcome',
    role: 'assistant',
    stage: 'welcome',
    text: `I reviewed your storm report for ${locationLabel}. I can explain what it means in plain language, help connect it to a real property, and answer questions before we decide whether an inspection makes sense.`,
    timestamp: new Date().toISOString(),
    sourceMode: 'report',
  };
}
