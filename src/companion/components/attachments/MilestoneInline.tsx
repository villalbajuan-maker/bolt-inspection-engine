import { CheckCircle2, Home, ShieldCheck, Wrench } from 'lucide-react';
import type { CompanionSessionContext } from '../../domain/companion.types';
import { InlineAttachment } from './InlineAttachment';

type MilestoneInlineProps = {
  personalization: CompanionSessionContext['personalization'];
};

function getMilestones(personalization: CompanionSessionContext['personalization']) {
  return [
    {
      key: 'address',
      label: 'Property identified',
      description: personalization.exactAddress || 'Add the property address to anchor the conversation to a specific home.',
      complete: Boolean(personalization.exactAddress),
      icon: Home,
    },
    {
      key: 'structure',
      label: 'Structure profile added',
      description:
        personalization.roofType || personalization.yearBuilt
          ? `${personalization.roofType || 'Roof type captured'}${personalization.yearBuilt ? `, built ${personalization.yearBuilt}` : ''}`
          : 'Add roof type and construction era to sharpen the structural reading.',
      complete: Boolean(personalization.roofType || personalization.yearBuilt),
      icon: Wrench,
    },
    {
      key: 'goal',
      label: 'Decision intent captured',
      description: personalization.userGoal
        ? `The Companion now knows the main goal: ${personalization.userGoal.replace('_', ' ')}.`
        : 'Add the main goal so the next recommendation can be tuned to the decision you are trying to make.'
      ,
      complete: Boolean(personalization.userGoal),
      icon: ShieldCheck,
    },
  ];
}

export function MilestoneInline({ personalization }: MilestoneInlineProps) {
  const milestones = getMilestones(personalization);

  return (
    <InlineAttachment
      eyebrow="Progress moments"
      title="The Companion is building a sharper property profile"
      description={`${Math.round(personalization.completionScore * 100)}% of the personalization context is now in place.`}
      icon={CheckCircle2}
      tone="success"
    >
      <div className="space-y-2">
        {milestones.map((milestone) => {
          const Icon = milestone.complete ? CheckCircle2 : milestone.icon;

          return (
            <div
              key={milestone.key}
              className={`flex items-start gap-3 rounded-2xl border px-3 py-2.5 ${
                milestone.complete
                  ? 'border-emerald-200 bg-white/90'
                  : 'border-white/70 bg-white/70'
              }`}
              >
                <div
                  className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl ${
                    milestone.complete
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-slate-900">{milestone.label}</div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {milestone.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </InlineAttachment>
  );
}
