import { MessageSquare, RotateCcw, X } from 'lucide-react';

type CompanionHeaderProps = {
  title: string;
  stormScore: number;
  riskLevel: string;
  zipCode: string;
  locationLabel?: string;
  onClose: () => void;
  onReset?: () => void;
};

export function CompanionHeader({
  title,
  stormScore,
  riskLevel,
  zipCode,
  locationLabel,
  onClose,
  onReset,
}: CompanionHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-4 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <MessageSquare className="h-3.5 w-3.5" />
            Report Companion
          </div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {locationLabel
              ? `Guided interpretation for ${locationLabel}, with property-level personalization and live regional context.`
              : 'Guided interpretation, property-level personalization, and live regional context.'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 sm:text-sm">
            <span className="rounded-full border border-slate-200 px-2.5 py-1">ZIP {zipCode}</span>
            <span className="rounded-full border border-slate-200 px-2.5 py-1">Score {stormScore}/100</span>
            <span className="rounded-full border border-slate-200 px-2.5 py-1">{riskLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 sm:flex"
            aria-label="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800"
            aria-label="Close companion"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
