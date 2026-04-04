import { MessageSquare, PanelRightOpen, RotateCcw, X } from 'lucide-react';

type CompanionHeaderProps = {
  title: string;
  stormScore: number;
  riskLevel: string;
  zipCode: string;
  locationLabel?: string;
  onClose: () => void;
  onReset?: () => void;
  onToggleContext?: () => void;
};

export function CompanionHeader({
  title,
  stormScore,
  riskLevel,
  zipCode,
  locationLabel,
  onClose,
  onReset,
  onToggleContext,
}: CompanionHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/88 px-4 py-3 backdrop-blur-xl sm:px-5">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm">
            <MessageSquare className="h-3.5 w-3.5" />
            Report Companion
          </div>
          <h2 className="text-[15px] font-semibold leading-tight text-slate-900 sm:text-lg">{title}</h2>
          <p className="mt-0.5 max-w-2xl pr-2 text-xs leading-relaxed text-slate-500 sm:text-[13px]">
            {locationLabel
              ? `ZIP-level guidance for ${locationLabel}.`
              : 'ZIP-level report guidance and next-step support.'}
          </p>
          <div className="mt-1.5 hidden flex-wrap items-center gap-1.5 text-[11px] text-slate-600 sm:flex sm:gap-2">
            <span className="rounded-full border border-slate-200/90 bg-white/85 px-2.5 py-1">ZIP {zipCode}</span>
            <span className="rounded-full border border-slate-200/90 bg-white/85 px-2.5 py-1">{riskLevel}</span>
            <span className="rounded-full border border-slate-200/90 bg-white/85 px-2.5 py-1">Score {stormScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={onToggleContext}
            className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-full border border-slate-200 bg-white/85 text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800"
            aria-label="Open companion context"
          >
            <PanelRightOpen className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={onReset}
            className="hidden min-h-[38px] min-w-[38px] items-center justify-center rounded-full border border-slate-200 bg-white/85 text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800 sm:flex"
            aria-label="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-full border border-slate-200 bg-white/85 text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800"
            aria-label="Close companion"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 sm:hidden">
        <span className="rounded-full border border-slate-200/90 bg-white/85 px-2.5 py-1">ZIP {zipCode}</span>
        <span className="rounded-full border border-slate-200/90 bg-white/85 px-2.5 py-1">{riskLevel}</span>
        <span className="rounded-full border border-slate-200/90 bg-white/85 px-2.5 py-1">Score {stormScore}</span>
      </div>
    </div>
  );
}
