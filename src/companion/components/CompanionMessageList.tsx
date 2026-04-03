import type { StormEvidenceSnapshot } from '../../api/stormEvidence';
import type {
  CompanionCTA,
  CompanionMessage,
  CompanionRecommendation,
  CompanionStage,
  SourceMode,
} from '../domain/companion.types';
import { ChatPreviewCard } from './attachments/ChatPreviewCard';
import { RecommendationCard } from './cards/RecommendationCard';
import { EvidenceListCard } from './cards/EvidenceListCard';
import { CompanionMessageBubble } from './CompanionMessageBubble';

type CompanionMessageListProps = {
  messages: CompanionMessage[];
  stage?: CompanionStage;
  sourceMode?: SourceMode;
  evidenceSnapshot?: StormEvidenceSnapshot;
  recommendation?: CompanionRecommendation;
  activeCTA?: CompanionCTA;
  onCTA?: (cta: CompanionCTA) => void;
};

export function CompanionMessageList({
  messages,
  stage,
  sourceMode = 'report',
  evidenceSnapshot,
  recommendation,
  activeCTA,
  onCTA,
}: CompanionMessageListProps) {
  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')?.id;

  return (
    <div className="space-y-3.5">
      {messages.map((message) => (
        <div key={message.id}>
          <CompanionMessageBubble message={message} />

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
