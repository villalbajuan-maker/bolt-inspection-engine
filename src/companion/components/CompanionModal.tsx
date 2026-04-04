import { DEFAULT_STAGE } from '../domain/companion.constants';
import { useState } from 'react';
import type { CompanionModalProps } from '../domain/companion.types';
import { useCompanionMachine } from '../hooks/useCompanionMachine';
import { CompanionContextRail } from './CompanionContextRail';
import { CompanionConversationPane } from './CompanionConversationPane';
import { CompanionFooter } from './CompanionFooter';
import { CompanionHeader } from './CompanionHeader';

export function CompanionModal({ isOpen, onClose, reportContext, onOpenBooking }: CompanionModalProps) {
  const [isContextOpen, setIsContextOpen] = useState(false);
  const { context, send, selectors } = useCompanionMachine({
    isOpen,
    reportContext,
  });
  const locationLabel = reportContext.county
    ? [reportContext.city, reportContext.county, reportContext.state || 'Florida'].filter(Boolean).join(', ')
    : reportContext.city
      ? `${reportContext.city}, ${reportContext.state || 'Florida'}`
      : `ZIP ${reportContext.zipCode}`;

  const openBookingFromCompanion = () => {
    const payload = {
      address: selectors.personalization.exactAddress,
      city: reportContext.city,
      zipCode: reportContext.zipCode,
      inspectionType: selectors.recommendation?.inspectionType,
      rationaleSummary: selectors.recommendation?.rationale,
    };

    onClose();
    if (onOpenBooking) {
      onOpenBooking(payload);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('companion-open-booking', { detail: payload }));
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/42 p-0 backdrop-blur-md sm:items-center sm:p-5 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Report Companion"
    >
      <div className="flex h-[100dvh] w-full max-w-[940px] flex-col overflow-hidden rounded-none border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] shadow-[0_36px_110px_rgba(15,23,42,0.22)] sm:h-[82vh] sm:max-h-[860px] sm:rounded-[30px]">
        <CompanionHeader
          title="Storm Report Companion"
          stormScore={reportContext.stormScore}
          riskLevel={reportContext.riskLevel}
          zipCode={reportContext.zipCode}
          locationLabel={locationLabel}
          onToggleContext={() => setIsContextOpen((current) => !current)}
          onReset={() => send({ type: 'RESET_SESSION' })}
          onClose={onClose}
        />

        <div className="relative min-h-0 flex-1">
          <div className="min-h-0 h-full border-b border-slate-200/90 bg-transparent">
            <CompanionConversationPane
              stage={selectors.activeStage || DEFAULT_STAGE}
              messages={selectors.messages}
              suggestedPrompts={selectors.suggestedPrompts}
              requestedFields={selectors.requestedFields}
              currentInput={selectors.currentInput}
              completionScore={selectors.personalization.completionScore}
              personalization={selectors.personalization}
              recommendation={selectors.recommendation}
              evidenceSnapshot={reportContext.evidenceSnapshot}
              locationLabel={locationLabel}
              sourceMode={selectors.sourceMode}
              stormScore={reportContext.stormScore}
              isThinking={selectors.isThinking}
              isError={selectors.isError}
              errorMessage={context.error?.message}
              activeCTA={selectors.activeCTA}
              onSelectPrompt={(prompt) => send({ type: 'SUBMIT_MESSAGE', text: prompt })}
              onSubmitField={(field, value) => send({ type: 'FIELD_PROVIDED', field, value })}
              onCTA={(cta) => {
                if (cta.action === 'open_booking') {
                  openBookingFromCompanion();
                  return;
                }

                if (cta.action === 'personalize') {
                  send({ type: 'SUBMIT_MESSAGE', text: 'Personalize this for my home' });
                  return;
                }

                if (cta.action === 'recommend' || cta.action === 'show_options') {
                  send({ type: 'SUBMIT_MESSAGE', text: 'What should I do next?' });
                }
              }}
            />
          </div>

          {isContextOpen && (
            <>
              <button
                type="button"
                aria-label="Close companion context"
                className="absolute inset-0 z-10 bg-slate-950/18 backdrop-blur-[1px]"
                onClick={() => setIsContextOpen(false)}
              />
              <aside className="absolute inset-x-3 bottom-3 top-3 z-20 overflow-hidden rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:inset-y-4 sm:right-4 sm:left-auto sm:w-[320px]">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Companion context
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      Supporting details
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsContextOpen(false)}
                    className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800"
                    aria-label="Close context drawer"
                  >
                    ×
                  </button>
                </div>
                <div className="h-full overflow-y-auto bg-slate-50/45 px-3 py-3 sm:px-4">
                  <CompanionContextRail
                    reportContext={reportContext}
                    sourceMode={selectors.sourceMode}
                    activeStage={selectors.activeStage}
                    recommendation={selectors.recommendation}
                    personalization={selectors.personalization}
                  />
                </div>
              </aside>
            </>
          )}
        </div>

        <CompanionFooter
          currentInput={selectors.currentInput}
          disabled={selectors.isThinking}
          requestedFields={selectors.requestedFields}
          activeCTA={selectors.activeCTA}
          suppressCTA={selectors.activeStage === 'recommend_action'}
          onType={(value) => send({ type: 'USER_TYPED', value })}
          onSubmit={() => send({ type: 'SUBMIT_MESSAGE', text: selectors.currentInput })}
          onCTA={(cta) => {
            if (cta.action === 'open_booking') {
              openBookingFromCompanion();
              return;
            }

            if (cta.action === 'personalize') {
              send({ type: 'SUBMIT_MESSAGE', text: 'Personalize this for my home' });
              return;
            }

            if (cta.action === 'recommend' || cta.action === 'show_options') {
              send({ type: 'SUBMIT_MESSAGE', text: 'What should I do next?' });
            }
          }}
        />
      </div>
    </div>
  );
}
