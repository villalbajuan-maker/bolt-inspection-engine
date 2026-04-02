import { DEFAULT_STAGE } from '../domain/companion.constants';
import type { CompanionModalProps } from '../domain/companion.types';
import { useCompanionMachine } from '../hooks/useCompanionMachine';
import { CompanionContextRail } from './CompanionContextRail';
import { CompanionConversationPane } from './CompanionConversationPane';
import { CompanionFooter } from './CompanionFooter';
import { CompanionHeader } from './CompanionHeader';

export function CompanionModal({ isOpen, onClose, reportContext, onOpenBooking }: CompanionModalProps) {
  const { context, send, selectors } = useCompanionMachine({
    isOpen,
    reportContext,
  });
  const locationLabel = reportContext.county
    ? [reportContext.city, reportContext.county, reportContext.state || 'Florida'].filter(Boolean).join(', ')
    : reportContext.city
      ? `${reportContext.city}, ${reportContext.state || 'Florida'}`
      : `ZIP ${reportContext.zipCode}`;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Report Companion"
    >
      <div className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
        <CompanionHeader
          title="Storm Report Companion"
          stormScore={reportContext.stormScore}
          riskLevel={reportContext.riskLevel}
          zipCode={reportContext.zipCode}
          locationLabel={locationLabel}
          onReset={() => send({ type: 'RESET_SESSION' })}
          onClose={onClose}
        />

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <div className="min-h-0 border-b border-slate-200 lg:border-b-0 lg:border-r">
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
              onSelectPrompt={(prompt) => send({ type: 'SUBMIT_MESSAGE', text: prompt })}
              onSubmitField={(field, value) => send({ type: 'FIELD_PROVIDED', field, value })}
            />
          </div>

          <div className="max-h-[38vh] overflow-y-auto bg-slate-50/80 px-4 py-4 sm:px-6 lg:max-h-none lg:bg-slate-50">
            <CompanionContextRail
              reportContext={reportContext}
              sourceMode={selectors.sourceMode}
              activeStage={selectors.activeStage}
              recommendation={selectors.recommendation}
              personalization={selectors.personalization}
            />
          </div>
        </div>

        <CompanionFooter
          currentInput={selectors.currentInput}
          suggestedPrompts={selectors.suggestedPrompts}
          disabled={selectors.isThinking}
          requestedFields={selectors.requestedFields}
          activeCTA={selectors.activeCTA}
          onType={(value) => send({ type: 'USER_TYPED', value })}
          onSelectPrompt={(prompt) => send({ type: 'SUBMIT_MESSAGE', text: prompt })}
          onSubmit={() => send({ type: 'SUBMIT_MESSAGE', text: selectors.currentInput })}
          onCTA={(cta) => {
            if (cta.action === 'open_booking') {
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
