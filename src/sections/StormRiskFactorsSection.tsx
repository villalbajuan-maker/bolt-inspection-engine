import { useScrollReveal } from '../hooks/useScrollReveal';
import { MapPin, Wind, Droplets, Home, TrendingUp, Cloud } from 'lucide-react';

interface StormRiskFactorsSectionProps {
  onCheckRisk: (zipCode?: string) => void;
}

export function StormRiskFactorsSection({ onCheckRisk: _onCheckRisk }: StormRiskFactorsSectionProps) {
  useScrollReveal();

  const riskFactors = [
    {
      icon: MapPin,
      title: 'Coastal Proximity',
      description:
        'Distance from the coastline directly correlates with storm surge exposure and wind field intensity. Properties within 10 miles of the coast experience 3-4x higher claim frequency.',
    },
    {
      icon: Wind,
      title: 'Wind Exposure Index',
      description:
        'Historical wind speed data and terrain analysis determine expected wind loads during hurricane events. Exposure varies by 40-60% across Florida based on geographic position.',
    },
    {
      icon: Droplets,
      title: 'FEMA Flood Zone',
      description:
        'Flood zone classifications (A, AE, VE, X) reflect elevation and drainage basin analysis. Zone designation influences both damage probability and insurance requirements.',
    },
    {
      icon: Cloud,
      title: 'Hurricane Track Density',
      description:
        'Analysis of 100+ years of hurricane paths reveals corridors of higher frequency impact. Southeast and Southwest Florida show 2-3x higher historical track density.',
    },
    {
      icon: TrendingUp,
      title: 'Regional Claim History',
      description:
        'Insurance claim data by ZIP code provides empirical evidence of damage patterns. Claim frequency correlates strongly with geographic risk factors.',
    },
    {
      icon: Home,
      title: 'Elevation & Drainage',
      description:
        'Property elevation above sea level and local drainage infrastructure determine rainfall flood risk. Low-lying areas experience significantly higher water damage rates.',
    },
  ];

  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            What Determines Storm Risk for a Property
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Storm exposure is not random.
            <br />
            It is determined by geographic and climatic factors that influence how storms impact
            different neighborhoods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {riskFactors.map((factor, index) => (
            <div
              key={index}
              className="reveal bg-slate-50 border border-gray-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                <factor.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{factor.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{factor.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-12 reveal">
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-8">
            <p className="text-gray-700 leading-relaxed text-center">
              The Disaster Shield Storm Risk Score combines these factors using weighted analysis to
              produce a single exposure metric. This score reflects relative storm vulnerability
              compared to other Florida properties.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
