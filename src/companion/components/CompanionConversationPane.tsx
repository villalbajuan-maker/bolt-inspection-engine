import { useEffect, useRef } from 'react';
import { CompanionMessageList } from './CompanionMessageList';
import { CompanionPromptGrid } from './CompanionPromptGrid';
import type { CompanionMessage, CompanionRecommendation, CompanionSessionContext, CompanionStage, RequestedField } from '../domain/companion.types';
import { RecommendationCard } from './cards/RecommendationCard';
import { EvidenceListCard } from './cards/EvidenceListCard';
import { WhatChangedCard } from './cards/WhatChangedCard';
import { PersonalizationProgress } from './personalization/PersonalizationProgress';
import { PersonalizationMilestoneCard } from './personalization/PersonalizationMilestoneCard';
import { PersonalizationStepRenderer } from './personalization/PersonalizationStepRenderer';
import type { StormEvidenceSnapshot } from '../../api/stormEvidence';
import { StageBanner } from './StageBanner';

type CompanionConversationPaneProps = {
  stage: CompanionStage;
  messages: CompanionMessage[];
  suggestedPrompts: string[];
  requestedFields?: RequestedField[];
  currentInput?: string;
  completionScore?: number;
  personalization?: CompanionSessionContext['personalization'];
  recommendation?: CompanionRecommendation;
  evidenceSnapshot?: StormEvidenceSnapshot;
  locationLabel?: string;
  sourceMode?: 'report' | 'personalized' | 'live';
  stormScore?: number;
  isThinking?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onSelectPrompt?: (prompt: string) => void;
  onSubmitField?: (field: RequestedField, value: string | string[]) => void;
};

export function CompanionConversationPane({
  stage,
  messages,
  suggestedPrompts,
  requestedFields = [],
  currentInput = '',
  completionScore = 0,
  personalization = { completionScore: 0 },
  recommendation,
  evidenceSnapshot,
  locationLabel,
  sourceMode = 'report',
  stormScore,
  isThinking = false,
  isError = false,
  errorMessage,
  onSelectPrompt,
  onSubmitField,
}: CompanionConversationPaneProps) {
  const activeRequestedField = requestedFields[0];
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const anchor = scrollAnchorRef.current;

    if (!container || !anchor) {
      return;
    }

    anchor.scrollIntoView({
      behavior: messages.length > 1 ? 'smooth' : 'auto',
      block: 'end',
    });
  }, [messages, stage, isThinking, completionScore, recommendation]);

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
      >
        <CompanionMessageList messages={messages} />

        <div className="mt-6">
          <StageBanner
            stage={stage}
            sourceMode={sourceMode}
            locationLabel={locationLabel}
            stormScore={stormScore}
          />
        </div>

        {isThinking && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            The Companion is preparing the next response...
          </div>
        )}

        {isError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage || 'Something went wrong while loading the Companion.'}
          </div>
        )}

        {stage === 'welcome' && (
          <div className="mt-6 space-y-4">
            <CompanionPromptGrid prompts={suggestedPrompts} onSelectPrompt={onSelectPrompt} />
          </div>
        )}

        {stage === 'interpret_report' && (
          <div className="mt-6 space-y-4">
            <CompanionPromptGrid prompts={suggestedPrompts} onSelectPrompt={onSelectPrompt} />
          </div>
        )}

        {stage === 'personalize_property' && (
          <div className="mt-6 space-y-4">
            <PersonalizationProgress completionScore={completionScore} />
            <PersonalizationMilestoneCard personalization={personalization} />

            <PersonalizationStepRenderer
              field={activeRequestedField}
              currentInput={currentInput}
              onSubmitField={(field, value) => onSubmitField?.(field, value)}
            />

            <WhatChangedCard
              sourceMode={sourceMode}
              personalization={personalization}
            />

            <CompanionPromptGrid prompts={suggestedPrompts} onSelectPrompt={onSelectPrompt} />
          </div>
        )}

        {stage === 'recommend_action' && recommendation && (
          <div className="mt-6 space-y-4">
            <RecommendationCard recommendation={recommendation} sourceMode={sourceMode} />
            <WhatChangedCard
              sourceMode={sourceMode}
              personalization={personalization}
              recommendation={recommendation}
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Decision context
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                You can keep asking follow-up questions here, but the Companion has already moved beyond a generic CTA. This recommendation is now tied to the report, the current property context, and the strongest next inspection fit for this case.
              </p>
            </div>

            <CompanionPromptGrid prompts={suggestedPrompts} onSelectPrompt={onSelectPrompt} />
          </div>
        )}

        {stage === 'live_intelligence' && (
          <div className="mt-6 space-y-4">
            <EvidenceListCard evidenceSnapshot={evidenceSnapshot} />

            <CompanionPromptGrid prompts={suggestedPrompts} onSelectPrompt={onSelectPrompt} />
          </div>
        )}

        <div ref={scrollAnchorRef} className="h-px w-full" />
      </div>
    </div>
  );
}
