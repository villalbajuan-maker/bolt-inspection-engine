import type { CompanionMessage, CompanionStage } from './companion.types';

export const DEFAULT_STAGE: CompanionStage = 'welcome';

export const DEFAULT_PROMPTS = [
  'Explain my storm score',
  'What should I do next?',
  'Personalize this for my home',
];

export function buildWelcomeMessage(locationLabel: string): CompanionMessage {
  return {
    id: 'companion-welcome',
    role: 'assistant',
    stage: 'welcome',
    text: `I reviewed your storm report for ${locationLabel}. I can quickly explain what the score means, what matters most for this property area, and whether it makes sense to move toward an inspection.`,
    timestamp: new Date().toISOString(),
    sourceMode: 'report',
  };
}
