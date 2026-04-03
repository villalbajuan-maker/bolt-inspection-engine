import { ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { LandingStormIntelligenceCard as LandingStormIntelligenceCardType } from '../api/landingStormIntelligence';

type LandingStormIntelligenceCardProps = {
  card: LandingStormIntelligenceCardType;
  icon: LucideIcon;
  loading?: boolean;
};

export function LandingStormIntelligenceCard({
  card,
  icon: Icon,
  loading = false,
}: LandingStormIntelligenceCardProps) {
  const badgeLabel =
    card.kind === 'verified_signal'
      ? card.status === 'verified'
        ? 'Verified signal'
        : 'Fallback context'
      : card.kind === 'wind_map'
        ? 'Live weather map'
        : 'Flood & coastal map';

  const headlineLabel =
    card.kind === 'verified_signal'
      ? 'Verified public signal'
      : card.kind === 'wind_map'
        ? 'Current official weather context'
        : 'Current official flood context';

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ border: '1px solid var(--ds-gray-200)' }}>
      <div className="relative h-64 overflow-hidden sm:h-72" style={{ background: 'var(--ds-gray-200)' }}>
        {loading ? (
          <div className="h-full w-full animate-pulse" style={{ background: 'var(--ds-gray-200)' }} />
        ) : (
          <img
            src={card.imageUrl}
            alt={card.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = '/storm-risk-preview.png';
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(11,31,58,0.82), rgba(11,31,58,0.18), transparent)' }}
        />
        <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center gap-2">
          <div
            className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{
              background:
                card.kind === 'verified_signal'
                  ? card.status === 'verified'
                    ? 'rgba(34, 197, 94, 0.14)'
                    : 'rgba(245, 158, 11, 0.14)'
                  : 'rgba(47, 107, 255, 0.12)',
              color:
                card.kind === 'verified_signal'
                  ? card.status === 'verified'
                    ? 'var(--ds-success)'
                    : 'var(--ds-warning)'
                  : 'var(--ds-accent-600)',
            }}
          >
            {badgeLabel}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 flex items-center gap-2 text-white">
            <Icon className="h-5 w-5" />
            <h3 className="text-xl font-bold">{card.title}</h3>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-3 animate-pulse rounded" style={{ background: 'var(--ds-gray-200)' }} />
            <div className="h-3 w-5/6 animate-pulse rounded" style={{ background: 'var(--ds-gray-200)' }} />
            <div className="h-3 w-4/6 animate-pulse rounded" style={{ background: 'var(--ds-gray-200)' }} />
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ds-primary-800)' }}>{card.summary}</p>

            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--ds-gray-200)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--ds-gray-500)' }}>Source: {card.source}</p>
            </div>

            {card.headline && (
              <div className="mt-4 rounded-xl p-4" style={{ border: '1px solid var(--ds-gray-200)', background: 'var(--ds-gray-50)' }}>
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--ds-primary-800)' }}>
                  {headlineLabel}
                </div>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--ds-gray-900)' }}>
                  "{card.headline}"
                </p>
                {card.url && (
                  <a
                    href={card.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold transition-colors"
                    style={{ color: 'var(--ds-accent-600)' }}
                  >
                    Open source
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {card.kind === 'verified_signal' && !card.headline && (
              <div className="mt-4 rounded-xl p-4" style={{ border: '1px solid rgba(245, 158, 11, 0.24)', background: 'rgba(245, 158, 11, 0.08)' }}>
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--ds-warning)' }}>
                  No verified signal found
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ds-primary-800)' }}>
                  This card falls back to statewide geographic context instead of presenting an unverified live headline.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
