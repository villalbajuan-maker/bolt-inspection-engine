import { Home, MapPinned } from 'lucide-react';
import type { CompanionSessionContext } from '../../domain/companion.types';
import { InlineAttachment } from './InlineAttachment';

type PropertyPreviewInlineProps = {
  personalization: CompanionSessionContext['personalization'];
};

export function PropertyPreviewInline({ personalization }: PropertyPreviewInlineProps) {
  if (!personalization.exactAddress) {
    return null;
  }

  const details = [personalization.roofType, personalization.yearBuilt && `Built ${personalization.yearBuilt}`]
    .filter(Boolean)
    .join(' • ');

  return (
    <InlineAttachment
      eyebrow="Property context"
      title={personalization.exactAddress}
      description={
        details
          ? `The Companion is now anchoring the conversation to this address and carrying forward ${details.toLowerCase()}.`
          : 'The Companion is now anchoring the conversation to this address instead of only using ZIP-level context.'
      }
      icon={MapPinned}
      tone="neutral"
    >
      <div className="flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          <Home className="h-3.5 w-3.5" />
          Property identified
        </div>
        {personalization.roofType && (
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            {personalization.roofType}
          </div>
        )}
      </div>
    </InlineAttachment>
  );
}
