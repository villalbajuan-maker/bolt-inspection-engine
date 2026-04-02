import { CheckCircle2, Home, ShieldCheck, Wrench } from 'lucide-react';
import type { CompanionSessionContext } from '../../domain/companion.types';

type PersonalizationMilestoneCardProps = {
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
        : 'Add the main goal so the next recommendation can be tuned to the decision you are trying to make.',
      complete: Boolean(personalization.userGoal),
      icon: ShieldCheck,
    },
  ];
}

export function PersonalizationMilestoneCard({
  personalization,
}: PersonalizationMilestoneCardProps) {
  const milestones = getMilestones(personalization);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Progress moments
          </div>
          <div className="mt-2 text-base font-semibold text-slate-900">
            The Companion is building a more specific property profile
          </div>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {Math.round(personalization.completionScore * 100)}% ready
        </div>
      </div>

      <div className="space-y-3">
        {milestones.map((milestone) => {
          const Icon = milestone.icon;
          return (
            <div
              key={milestone.key}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                milestone.complete
                  ? 'border-emerald-200 bg-emerald-50/70'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  milestone.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500'
                }`}
              >
                {milestone.complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{milestone.label}</div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{milestone.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
