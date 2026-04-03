import {
  CalendarClock,
  ExternalLink,
  Newspaper,
  ShieldCheck,
  Waves,
  Wind,
} from 'lucide-react';
import type { StormEvidenceSnapshot } from '../../../api/stormEvidence';
import { InlineAttachment } from './InlineAttachment';

type EvidencePreviewInlineProps = {
  evidenceSnapshot?: StormEvidenceSnapshot;
};

function formatGeneratedAt(dateString?: string) {
  if (!dateString) {
    return 'Snapshot time unavailable';
  }

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function EvidencePreviewInline({
  evidenceSnapshot,
}: EvidencePreviewInlineProps) {
  if (!evidenceSnapshot) {
    return (
      <InlineAttachment
        eyebrow="Live evidence"
        title="No persisted evidence snapshot is available for this report"
        description="The Companion cannot surface a verified regional signal here yet, so it should stay conservative and avoid implying a recent local event that was not actually captured."
        icon={Newspaper}
        tone="warning"
      />
    );
  }

  const [signalCard, windCard, floodCard] = evidenceSnapshot.cards;
  const headline = signalCard?.headline;
  const hasVerifiedHeadline = Boolean(headline);

  return (
    <InlineAttachment
      eyebrow="Live regional context"
      title={
        headline?.title ||
        'No verified local article was captured in this report snapshot'
      }
      description={signalCard?.description}
      icon={hasVerifiedHeadline ? ShieldCheck : Newspaper}
      tone={hasVerifiedHeadline ? 'info' : 'warning'}
      media={
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/92">
          <div className="grid gap-0 sm:grid-cols-[190px_minmax(0,1fr)]">
            <div className="relative min-h-[150px] overflow-hidden bg-slate-200">
              <img
                src={signalCard?.imageUrl}
                alt={headline?.title || signalCard?.title || 'Regional evidence preview'}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
              <div className="absolute left-3 top-3">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    hasVerifiedHeadline
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {hasVerifiedHeadline ? (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Newspaper className="h-3.5 w-3.5" />
                  )}
                  {hasVerifiedHeadline ? 'Verified signal' : 'Fallback context'}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 p-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                    {headline?.source || signalCard?.source}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                    {evidenceSnapshot.locationLabel}
                  </div>
                </div>

                <div className="mt-3 text-sm font-semibold leading-snug text-slate-900">
                  {headline?.title || signalCard?.title}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatGeneratedAt(evidenceSnapshot.generatedAt)}
                </div>
                {headline?.url && (
                  <a
                    href={headline.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-900 transition-colors hover:border-slate-300 hover:text-slate-700"
                  >
                    Source
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      }
    >
      {(windCard || floodCard) && (
        <div className="flex flex-wrap gap-2">
          {windCard && (
            <div className="min-w-[220px] flex-1 rounded-2xl border border-slate-200 bg-white/82 px-3 py-2.5">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-800">
                <Wind className="h-3.5 w-3.5" />
                Wind context
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                {windCard.description}
              </p>
            </div>
          )}

          {floodCard && (
            <div className="min-w-[220px] flex-1 rounded-2xl border border-slate-200 bg-white/82 px-3 py-2.5">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-800">
                <Waves className="h-3.5 w-3.5" />
                Flood context
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                {floodCard.description}
              </p>
            </div>
          )}
        </div>
      )}
    </InlineAttachment>
  );
}
