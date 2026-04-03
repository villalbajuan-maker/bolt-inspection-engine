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
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-5">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 sm:px-3 sm:text-[11px]">
            <MessageSquare className="h-3.5 w-3.5" />
            Report Companion
          </div>
          <h2 className="text-base font-bold leading-tight text-slate-900 sm:text-xl">{title}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            {locationLabel
              ? `Live guidance for ${locationLabel}.`
              : 'Live report guidance and next-step support.'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600 sm:gap-2">
            <span className="rounded-full border border-slate-200 px-2.5 py-1">ZIP {zipCode}</span>
            <span className="rounded-full border border-slate-200 px-2.5 py-1">{riskLevel}</span>
            <span className="rounded-full border border-slate-200 px-2.5 py-1">Score {stormScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={onReset}
            className="hidden min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 sm:flex"
            aria-label="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800"
            aria-label="Close companion"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
