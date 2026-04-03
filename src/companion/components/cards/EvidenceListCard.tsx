import type { StormEvidenceSnapshot } from '../../../api/stormEvidence';
import { EvidencePreviewInline } from '../attachments/EvidencePreviewInline';

type EvidenceListCardProps = {
  evidenceSnapshot?: StormEvidenceSnapshot;
};

export function EvidenceListCard({ evidenceSnapshot }: EvidenceListCardProps) {
  return <EvidencePreviewInline evidenceSnapshot={evidenceSnapshot} />;
}
