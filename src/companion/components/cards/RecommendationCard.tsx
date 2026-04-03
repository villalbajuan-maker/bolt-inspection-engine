import type { CompanionCTA, CompanionRecommendation, SourceMode } from '../../domain/companion.types';
import { RecommendationInline } from '../attachments/RecommendationInline';

type RecommendationCardProps = {
  recommendation: CompanionRecommendation;
  sourceMode?: SourceMode;
  activeCTA?: CompanionCTA;
  onCTA?: (cta: CompanionCTA) => void;
};

export function RecommendationCard({
  recommendation,
  sourceMode = 'personalized',
  activeCTA,
  onCTA,
}: RecommendationCardProps) {
  return (
    <RecommendationInline
      recommendation={recommendation}
      sourceMode={sourceMode}
      activeCTA={activeCTA}
      onCTA={onCTA}
    />
  );
}
