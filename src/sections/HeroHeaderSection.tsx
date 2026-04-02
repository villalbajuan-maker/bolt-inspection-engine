interface HeroHeaderSectionProps {
  stormScore: number;
  riskLevel: string;
}

function getRiskBadgeColor(level: string): string {
  const upperLevel = level.toUpperCase();
  if (upperLevel === 'HIGH' || upperLevel === 'HIGH RISK') return 'bg-red-500';
  if (upperLevel === 'MODERATE' || upperLevel === 'MODERATE RISK') return 'bg-orange-500';
  return 'bg-green-500';
}

export function HeroHeaderSection({ stormScore, riskLevel }: HeroHeaderSectionProps) {
  return (
    <div className="relative bg-slate-900 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/storm-risk-report-hero.png"
          alt="Storm Intelligence Report"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90"></div>
      </div>

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Storm Intelligence Report
          </h1>

          <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-6xl sm:text-7xl font-bold text-white">{stormScore}</span>
              <span className="text-3xl sm:text-4xl text-slate-300">/100</span>
            </div>
            <div className="text-sm text-slate-300 mb-4">Storm Risk Score</div>
            <span className={`inline-block px-6 py-3 rounded-full text-white font-bold text-sm uppercase tracking-wide ${getRiskBadgeColor(riskLevel)}`}>
              Risk Level: {riskLevel}
            </span>
          </div>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Your property is located in a region with {riskLevel.toLowerCase()} storm exposure.
            This report provides technical analysis of geographic risk factors and structural vulnerability indicators.
          </p>
        </div>
      </div>
    </div>
  );
}
