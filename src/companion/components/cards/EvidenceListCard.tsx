import { CalendarClock, ExternalLink, Newspaper, ShieldCheck, Waves, Wind } from 'lucide-react';
import type { StormEvidenceSnapshot } from '../../../api/stormEvidence';

type EvidenceListCardProps = {
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

export function EvidenceListCard({ evidenceSnapshot }: EvidenceListCardProps) {
  if (!evidenceSnapshot) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
          <Newspaper className="h-3.5 w-3.5" />
          Live evidence unavailable
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          No persisted evidence snapshot is available for this report
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          The Companion cannot surface a verified regional signal here yet, so it should stay conservative and avoid implying a recent local event that was not actually captured.
        </p>
      </div>
    );
  }

  const [signalCard, windCard, floodCard] = evidenceSnapshot.cards;
  const headline = signalCard?.headline;
  const hasVerifiedHeadline = Boolean(headline);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <div className="relative min-h-[240px] overflow-hidden bg-slate-200">
            <img
              src={signalCard?.imageUrl}
              alt={headline?.title || signalCard?.title || 'Regional evidence preview'}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  hasVerifiedHeadline
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {hasVerifiedHeadline ? <ShieldCheck className="h-3.5 w-3.5" /> : <Newspaper className="h-3.5 w-3.5" />}
                {hasVerifiedHeadline ? 'Verified signal' : 'Fallback context'}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                <CalendarClock className="h-3.5 w-3.5" />
                Snapshot {formatGeneratedAt(evidenceSnapshot.generatedAt)}
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                Live regional signal
              </div>
              <h3 className="mt-2 max-w-xl text-xl font-bold leading-tight text-white">
                {headline?.title || 'No verified local article was captured in this report snapshot'}
              </h3>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Why this matters
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              {signalCard?.description}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Source status
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {hasVerifiedHeadline ? 'Verified public reporting' : 'Geographic fallback'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {hasVerifiedHeadline
                    ? 'A public article matched the location and storm-related intent of this report.'
                    : 'No specific local article was verified, so the Companion falls back to the regional risk profile without inventing an event.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Source
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {headline?.source || signalCard?.source}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {evidenceSnapshot.locationLabel}
                </p>
              </div>
            </div>

            {headline?.url && (
              <a
                href={headline.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-700"
              >
                Open source article
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {windCard && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-800">
              <Wind className="h-3.5 w-3.5" />
              Geographic wind context
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{windCard.description}</p>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Source: {windCard.source}
            </div>
          </div>
        )}

        {floodCard && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">
              <Waves className="h-3.5 w-3.5" />
              Geographic flood context
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{floodCard.description}</p>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Source: {floodCard.source}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
