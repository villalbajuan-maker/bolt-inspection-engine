import { MapPinned, ShieldCheck, Wind } from 'lucide-react';
import type {
  CompanionRecommendation,
  CompanionSessionContext,
  SourceMode,
} from '../../domain/companion.types';
import { InlineAttachment } from './InlineAttachment';

type WhatChangedInlineProps = {
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
      description:
        'The Companion is no longer working only from ZIP-level exposure. It now has an identified home to anchor the interpretation.',
      icon: MapPinned,
    });
  }

  if (personalization.roofType || personalization.yearBuilt) {
    items.push({
      key: 'structure',
      title: 'Structural context changed the reading',
      description:
        'Roof type and construction era help the Companion decide whether wind, age, or general condition should weigh more heavily.',
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

export function WhatChangedInline({
  sourceMode,
  personalization,
  recommendation,
}: WhatChangedInlineProps) {
  const items = buildChangeItems(sourceMode, personalization, recommendation);

  if (!items.length) {
    return null;
  }

  return (
    <InlineAttachment
      eyebrow="What changed"
      title="The Companion has more decision value than it did at the start"
      description="The conversation now has more context behind it, so the guidance is moving away from generic interpretation."
      icon={ShieldCheck}
      tone="info"
    >
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/80 px-3 py-2.5"
            >
              <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-slate-900">{item.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </InlineAttachment>
  );
}
