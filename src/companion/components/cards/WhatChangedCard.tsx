import { ArrowRight, MapPinned, ShieldCheck, Wind } from 'lucide-react';
import type {
  CompanionRecommendation,
  CompanionSessionContext,
  SourceMode,
} from '../../domain/companion.types';

type WhatChangedCardProps = {
  sourceMode: SourceMode;
  personalization: CompanionSessionContext['personalization'];
  recommendation?: CompanionRecommendation;
};

function buildChangeItems(
  sourceMode: SourceMode,
  personalization: CompanionSessionContext['personalization'],
  recommendation?: CompanionRecommendation
) {
  const items = [];

  if (personalization.exactAddress) {
    items.push({
      key: 'address',
      title: 'The report is now tied to a specific property',
      description: 'The Companion is no longer working only from ZIP-level exposure. It now has an identified home to anchor the interpretation.',
      icon: MapPinned,
    });
  }

  if (personalization.roofType || personalization.yearBuilt) {
    items.push({
      key: 'structure',
      title: 'Structural context changed the reading',
      description: 'Roof type and construction era help the Companion decide whether wind, age, or general condition should weigh more heavily.',
      icon: Wind,
    });
  }

  if (recommendation || sourceMode === 'personalized') {
    items.push({
      key: 'decision',
      title: 'The next step is now decision-ready',
      description: recommendation
        ? `The Companion has enough context to recommend a ${recommendation.inspectionType} instead of a generic inspection CTA.`
        : 'The Companion now has enough context to move toward a more specific recommendation.',
      icon: ShieldCheck,
    });
  }

  return items;
}

export function WhatChangedCard({
  sourceMode,
  personalization,
  recommendation,
}: WhatChangedCardProps) {
  const items = buildChangeItems(sourceMode, personalization, recommendation);

  if (!items.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          What changed
        </div>
        <div className="mt-2 text-base font-semibold text-slate-900">
          The Companion has more decision value than it did at the start
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span>{item.title}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
