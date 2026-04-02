import { MapPin, Wind, Droplets, Waves, Navigation, AlertTriangle, Activity } from 'lucide-react';

interface StormRiskSnapshotProps {
  zipCode: string;
  lat: number;
  lon: number;
  stormRiskScore: number;
  riskLevel: string;
  riskComponents: {
    hurricane_risk: number;
    flood_risk: number;
    coastal_exposure: number;
    distance_to_coast: number;
    fema_flood_zone: number;
    hurricane_corridor: number;
  };
}

function getRiskBadgeColor(level: string): string {
  const upperLevel = level.toUpperCase();
  if (upperLevel === 'HIGH' || upperLevel === 'HIGH RISK') return 'bg-red-500';
  if (upperLevel === 'MODERATE' || upperLevel === 'MODERATE RISK') return 'bg-orange-500';
  return 'bg-green-500';
}

export function StormRiskSnapshotSection({
  zipCode,
  lat,
  lon,
  stormRiskScore,
  riskLevel,
  riskComponents
}: StormRiskSnapshotProps) {
  return (
    <div className="relative -mt-32 mb-12 sm:mb-16 z-10">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 sm:px-8 py-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Storm Risk Snapshot
            </h2>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">ZIP Code: {zipCode}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="text-sm text-slate-600 mb-2 font-medium">Coordinates</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="text-xs font-mono">LAT</span>
                    <span className="font-semibold">{lat.toFixed(6)}°</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="text-xs font-mono">LON</span>
                    <span className="font-semibold">{lon.toFixed(6)}°</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="text-sm text-slate-600 mb-3 font-medium">Storm Risk Score</div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-5xl font-bold text-slate-900">{stormRiskScore}</span>
                  <span className="text-2xl text-slate-500 mb-1">/100</span>
                </div>
                <span className={`inline-block px-4 py-2 rounded-full text-white font-bold text-sm uppercase tracking-wide ${getRiskBadgeColor(riskLevel)}`}>
                  {riskLevel}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Key Risk Indicators</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <IndicatorCard
                  icon={<Wind className="w-5 h-5" />}
                  label="Hurricane Exposure"
                  value={riskComponents.hurricane_risk}
                />
                <IndicatorCard
                  icon={<Droplets className="w-5 h-5" />}
                  label="Flood Probability"
                  value={riskComponents.flood_risk}
                />
                <IndicatorCard
                  icon={<Waves className="w-5 h-5" />}
                  label="Coastal Exposure"
                  value={riskComponents.coastal_exposure}
                />
                <IndicatorCard
                  icon={<Navigation className="w-5 h-5" />}
                  label="Distance to Coast"
                  value={riskComponents.distance_to_coast}
                />
                <IndicatorCard
                  icon={<AlertTriangle className="w-5 h-5" />}
                  label="FEMA Zone"
                  value={riskComponents.fema_flood_zone}
                />
                <IndicatorCard
                  icon={<Activity className="w-5 h-5" />}
                  label="Storm Corridor"
                  value={riskComponents.hurricane_corridor}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface IndicatorCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function IndicatorCard({ icon, label, value }: IndicatorCardProps) {
  const getColorClass = (val: number) => {
    if (val >= 4) return 'text-red-600 bg-red-50 border-red-200';
    if (val >= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className={`rounded-lg p-4 border ${getColorClass(value)}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{value}/5</span>
      </div>
      <div className="text-xs font-medium">{label}</div>
    </div>
  );
}
