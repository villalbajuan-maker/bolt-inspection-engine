import { useEffect, useRef } from 'react';
import { CompanionMessageList } from './CompanionMessageList';
import type { CompanionMessage, CompanionRecommendation, CompanionReportContext, CompanionSessionContext, CompanionStage, RequestedField } from '../domain/companion.types';
import { PersonalizationProgress } from './personalization/PersonalizationProgress';
import { PersonalizationStepRenderer } from './personalization/PersonalizationStepRenderer';
import type { StormEvidenceSnapshot } from '../../api/stormEvidence';
import { StageBanner } from './StageBanner';
import { SuggestedReplies } from './SuggestedReplies';
import { MilestoneInline } from './attachments/MilestoneInline';
import { PropertyPreviewInline } from './attachments/PropertyPreviewInline';
import { WhatChangedInline } from './attachments/WhatChangedInline';

type CompanionConversationPaneProps = {
  stage: CompanionStage;
  reportContext: CompanionReportContext;
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
  activeCTA?: CompanionSessionContext['activeCTA'];
  onSelectPrompt?: (prompt: string) => void;
  onSubmitField?: (field: RequestedField, value: string | string[]) => void;
  onCTA?: (cta: NonNullable<CompanionSessionContext['activeCTA']>) => void;
};

export function CompanionConversationPane({
  stage,
  reportContext,
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
  activeCTA,
  onSelectPrompt,
  onSubmitField,
  onCTA,
}: CompanionConversationPaneProps) {
  const activeRequestedField = requestedFields[0];
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const promptLabel =
    requestedFields.length > 0 ? 'Suggested answers' : 'Suggested replies';
  const promptLimit = stage === 'welcome' ? 3 : 2;
  const visiblePrompts = suggestedPrompts.slice(0, promptLimit);

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
        className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(248,250,252,0.95),rgba(255,255,255,0.98)_26%,rgba(255,255,255,1)_60%)] px-3 py-5 sm:px-7 sm:py-8 lg:px-8"
      >
        <CompanionMessageList
          messages={messages}
          stage={stage}
          sourceMode={sourceMode}
          reportContext={reportContext}
          evidenceSnapshot={evidenceSnapshot}
          recommendation={recommendation}
          personalization={personalization}
          activeCTA={activeCTA}
          onCTA={onCTA}
        />

        <div className="mt-3">
          <StageBanner
            stage={stage}
            sourceMode={sourceMode}
            locationLabel={locationLabel}
            stormScore={stormScore}
          />
        </div>

        {isThinking && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white/92 p-4 text-sm text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-end gap-0.5">
                <span className="h-2 w-0.5 animate-pulse rounded-full bg-slate-400 [animation-delay:0ms]" />
                <span className="h-3 w-0.5 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
                <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
              </span>
              <span>The Companion is preparing the next response...</span>
            </div>
          </div>
        )}

        {isError && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/95 p-4 text-sm text-red-700 shadow-[0_8px_24px_rgba(127,29,29,0.05)]">
            {errorMessage || 'Something went wrong while loading the Companion.'}
          </div>
        )}

        {stage === 'welcome' && (
          <div className="mt-4 space-y-3">
            <SuggestedReplies
              prompts={visiblePrompts}
              onSelectPrompt={onSelectPrompt}
              label={promptLabel}
            />
          </div>
        )}

        {stage === 'interpret_report' && (
          <div className="mt-4 space-y-3">
            <SuggestedReplies
              prompts={visiblePrompts}
              onSelectPrompt={onSelectPrompt}
              label={promptLabel}
            />
          </div>
        )}

        {stage === 'personalize_property' && (
          <div className="mt-4 space-y-3">
            <PersonalizationProgress completionScore={completionScore} />
            <MilestoneInline personalization={personalization} />
            <PropertyPreviewInline personalization={personalization} />

            <PersonalizationStepRenderer
              field={activeRequestedField}
              currentInput={currentInput}
              onSubmitField={(field, value) => onSubmitField?.(field, value)}
            />

            <WhatChangedInline
              sourceMode={sourceMode}
              personalization={personalization}
            />

            <SuggestedReplies
              prompts={visiblePrompts}
              onSelectPrompt={onSelectPrompt}
              label={promptLabel}
            />
          </div>
        )}

        {stage === 'recommend_action' && recommendation && (
          <div className="mt-4 space-y-3">
            <WhatChangedInline
              sourceMode={sourceMode}
              personalization={personalization}
              recommendation={recommendation}
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Keep asking from here
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                You do not have to book right away. The Companion can keep clarifying why this inspection fits, what it would help confirm, or how it connects to the report and the property details you have already shared.
              </p>
            </div>

            <SuggestedReplies
              prompts={visiblePrompts}
              onSelectPrompt={onSelectPrompt}
              label={promptLabel}
            />
          </div>
        )}

        {stage === 'live_intelligence' && (
          <div className="mt-4 space-y-3">
            <SuggestedReplies
              prompts={visiblePrompts}
              onSelectPrompt={onSelectPrompt}
              label={promptLabel}
            />
          </div>
        )}

        <div ref={scrollAnchorRef} className="h-px w-full" />
      </div>
    </div>
  );
}
