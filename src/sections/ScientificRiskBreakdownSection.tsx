import { Wind, Droplets, Waves, Navigation, AlertTriangle, Activity } from 'lucide-react';

interface ScientificRiskBreakdownProps {
  riskComponents: {
    hurricane_risk: number;
    flood_risk: number;
    coastal_exposure: number;
    distance_to_coast?: number;
    fema_flood_zone: number;
    hurricane_corridor: number;
  };
  stormRiskScore: number;
}

export function ScientificRiskBreakdownSection({
  riskComponents,
  stormRiskScore
}: ScientificRiskBreakdownProps) {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Storm Risk Components Analysis
          </h2>
          <p className="text-slate-600">
            Detailed breakdown of individual risk factors contributing to your overall storm risk profile
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <RiskComponent
            icon={<Wind className="w-6 h-6" />}
            label="Hurricane Exposure"
            description="Historical hurricane activity and wind speed probability"
            score={riskComponents.hurricane_risk}
          />
          <RiskComponent
            icon={<Droplets className="w-6 h-6" />}
            label="Flood Risk"
            description="Rainfall intensity and flooding likelihood"
            score={riskComponents.flood_risk}
          />
          <RiskComponent
            icon={<Waves className="w-6 h-6" />}
            label="Coastal Exposure"
            description="Storm surge vulnerability and tidal impact"
            score={riskComponents.coastal_exposure}
          />
          <RiskComponent
            icon={<Navigation className="w-6 h-6" />}
            label="Distance-to-Coast Score"
            description="Normalized ZIP-level proximity score from the reference dataset"
            score={riskComponents.distance_to_coast}
          />
          <RiskComponent
            icon={<AlertTriangle className="w-6 h-6" />}
            label="FEMA Flood Zone"
            description="Federal flood zone classification"
            score={riskComponents.fema_flood_zone}
          />
          <RiskComponent
            icon={<Activity className="w-6 h-6" />}
            label="Hurricane Corridor"
            description="Historical storm path frequency"
            score={riskComponents.hurricane_corridor}
          />

          <div className="pt-6 mt-6 border-t-2 border-slate-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  Composite Storm Risk Score
                </h3>
                <p className="text-sm text-slate-600">
                  Weighted average of all risk components
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold text-slate-900">{stormRiskScore}</span>
                  <span className="text-2xl text-slate-500 mb-1">/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface RiskComponentProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  score?: number;
}

function RiskComponent({ icon, label, description, score }: RiskComponentProps) {
  const hasScore = typeof score === 'number';
  const percentage = hasScore ? (score / 5) * 100 : 0;

  const getColorClasses = (value: number) => {
    if (value >= 4) return {
      text: 'text-red-600',
      bg: 'bg-red-500',
      bgLight: 'bg-red-100'
    };
    if (value >= 3) return {
      text: 'text-orange-600',
      bg: 'bg-orange-500',
      bgLight: 'bg-orange-100'
    };
    return {
      text: 'text-green-600',
      bg: 'bg-green-500',
      bgLight: 'bg-green-100'
    };
  };

  const colors = hasScore
    ? getColorClasses(score)
    : {
        text: 'text-slate-500',
        bg: 'bg-slate-300',
        bgLight: 'bg-slate-100'
      };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2 rounded-lg ${colors.bgLight} ${colors.text}`}>
            {icon}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 mb-0.5">{label}</h4>
            <p className="text-xs text-slate-600">{description}</p>
          </div>
        </div>
        <div className="text-right">
          {hasScore ? (
            <>
              <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
              <span className="text-slate-500 text-sm ml-1">/5</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-slate-500">Unavailable</span>
          )}
        </div>
      </div>

      <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full ${colors.bg} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
