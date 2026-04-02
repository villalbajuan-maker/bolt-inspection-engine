import { MapPin, Navigation } from 'lucide-react';
import { TechnicalSnapshotMap } from '../components/TechnicalSnapshotMap';

interface TechnicalSnapshotSectionProps {
  zipCode: string;
  lat: number;
  lon: number;
  coastalScore: number;
  floodScore: number;
}

function calculateDistanceToCoast(coastalScore: number): number {
  return Math.max(5, Math.round(100 - (coastalScore * 20)));
}

export function TechnicalSnapshotSection({
  zipCode,
  lat,
  lon,
  coastalScore,
  floodScore
}: TechnicalSnapshotSectionProps) {
  const distanceToCoast = calculateDistanceToCoast(coastalScore);

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Geographic Technical Snapshot
          </h2>
          <p className="text-slate-600">
            Precise location analysis and geographic risk indicators
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg h-full min-h-[400px]">
              <TechnicalSnapshotMap lat={lat} lon={lon} zipCode={zipCode} />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 h-full">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-700" />
                Technical Geographic Data
              </h3>

              <div className="space-y-6">
                <DataRow label="ZIP Code" value={zipCode} />
                <DataRow label="Latitude" value={`${lat.toFixed(6)}°`} mono />
                <DataRow label="Longitude" value={`${lon.toFixed(6)}°`} mono />
                <DataRow label="Distance to Coast" value={`~${distanceToCoast} miles`} />

                <div className="pt-4 border-t border-slate-300">
                  <div className="mb-4 text-sm font-semibold text-slate-700">Risk Indicators</div>
                  <ScoreRow label="Coastal Exposure Score" score={coastalScore} />
                  <ScoreRow label="Flood Risk Score" score={floodScore} />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-300">
                <div className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Scores are calculated using geographic reference data from the Florida ZIP Reference Dataset
                    including coastal exposure, flood indicators and hurricane risk modeling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface DataRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function DataRow({ label, value, mono }: DataRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-base font-semibold text-slate-900 ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

interface ScoreRowProps {
  label: string;
  score: number;
}

function ScoreRow({ label, score }: ScoreRowProps) {
  const getScoreColor = (val: number) => {
    if (val >= 4) return 'text-red-600';
    if (val >= 3) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="flex justify-between items-center mb-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-lg font-bold ${getScoreColor(score)}`}>
        {score}/5
      </span>
    </div>
  );
}
