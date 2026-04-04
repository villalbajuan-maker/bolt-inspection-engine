import type { StormEvidenceSnapshot } from '../../api/stormEvidence';
import type {
  CompanionCTA,
  CompanionReportContext,
  CompanionMessage,
  CompanionRecommendation,
  CompanionSessionContext,
  CompanionStage,
  SourceMode,
} from '../domain/companion.types';
import { ChatPreviewCard } from './attachments/ChatPreviewCard';
import { EvidencePreviewInline } from './attachments/EvidencePreviewInline';
import { PropertyPreviewInline } from './attachments/PropertyPreviewInline';
import { RecommendationInline } from './attachments/RecommendationInline';
import { ReportContextInline } from './attachments/ReportContextInline';
import { RecommendationCard } from './cards/RecommendationCard';
import { EvidenceListCard } from './cards/EvidenceListCard';
import { CompanionMessageBubble } from './CompanionMessageBubble';

type CompanionMessageListProps = {
  messages: CompanionMessage[];
  stage?: CompanionStage;
  sourceMode?: SourceMode;
  reportContext: CompanionReportContext;
  evidenceSnapshot?: StormEvidenceSnapshot;
  recommendation?: CompanionRecommendation;
  personalization?: CompanionSessionContext['personalization'];
  activeCTA?: CompanionCTA;
  onCTA?: (cta: CompanionCTA) => void;
};

export function CompanionMessageList({
  messages,
  stage,
  sourceMode = 'report',
  reportContext,
  evidenceSnapshot,
  recommendation,
  personalization,
  activeCTA,
  onCTA,
}: CompanionMessageListProps) {
  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')?.id;

  return (
    <div className="space-y-4.5">
      {messages.map((message) => (
        <div key={message.id} className="space-y-2">
          <CompanionMessageBubble message={message} />

          {message.role === 'assistant' && message.inlineAsset?.type === 'evidence' && evidenceSnapshot && (
            <ChatPreviewCard>
              <EvidencePreviewInline evidenceSnapshot={evidenceSnapshot} />
            </ChatPreviewCard>
          )}

          {message.role === 'assistant' && message.inlineAsset?.type === 'property' && personalization?.exactAddress && (
            <ChatPreviewCard>
              <PropertyPreviewInline personalization={personalization} />
            </ChatPreviewCard>
          )}

          {message.role === 'assistant' && message.inlineAsset?.type === 'recommendation' && recommendation && (
            <ChatPreviewCard>
              <RecommendationInline
                recommendation={recommendation}
                sourceMode={sourceMode}
                activeCTA={activeCTA}
                onCTA={onCTA}
              />
            </ChatPreviewCard>
          )}

          {message.role === 'assistant' && message.inlineAsset?.type === 'report' && (
            <ChatPreviewCard>
              <ReportContextInline reportContext={reportContext} />
            </ChatPreviewCard>
          )}

          {message.id === lastAssistantMessageId && stage === 'live_intelligence' && (
            <ChatPreviewCard>
              <EvidenceListCard evidenceSnapshot={evidenceSnapshot} />
            </ChatPreviewCard>
          )}

          {message.id === lastAssistantMessageId &&
            stage === 'recommend_action' &&
            recommendation && (
              <ChatPreviewCard>
                <RecommendationCard
                  recommendation={recommendation}
                  sourceMode={sourceMode}
                  activeCTA={activeCTA}
                  onCTA={onCTA}
                />
              </ChatPreviewCard>
            )}
        </div>
      ))}
    </div>
  );
}
