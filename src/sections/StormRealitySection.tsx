import { useEffect, useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Waves, MapPin, Wind } from 'lucide-react';
import { fetchLandingStormIntelligenceSnapshot, type LandingStormIntelligenceSnapshot } from '../api/landingStormIntelligence';
import { LandingStormIntelligenceCard } from '../components/LandingStormIntelligenceCard';
import { CheckRiskCTA } from '../components/CheckRiskCTA';

interface StormRealitySectionProps {
  onCheckRisk: (zipCode?: string) => void;
}

export function StormRealitySection({ onCheckRisk: _onCheckRisk }: StormRealitySectionProps) {
  useScrollReveal();
  const [snapshot, setSnapshot] = useState<LandingStormIntelligenceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSnapshot = async () => {
      setLoading(true);
      try {
        const generatedSnapshot = await fetchLandingStormIntelligenceSnapshot();

        if (cancelled) {
          return;
        }

        setSnapshot(generatedSnapshot);
      } catch (error) {
        console.error('[StormRealitySection] Failed to load landing storm intelligence:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadSnapshot();

    return () => {
      cancelled = true;
    };
  }, []);

  const fallbackCards = [
    {
      kind: 'verified_signal' as const,
      title: 'Verified Florida Storm Signal',
      summary:
        'No verified Florida-wide article was identified at render time, so this section relies on geographic risk context instead of synthetic news copy.',
      source: 'Verified public reporting',
      imageUrl: '/storm-risk-report-hero.png',
      status: 'fallback' as const,
    },
    {
      kind: 'wind_map' as const,
      title: 'Wind & Hurricane Exposure Pattern',
      summary:
        'Wind exposure across Florida is not uniform. Historical hurricane tracks, coastal orientation, and repeated wind loading patterns create very different levels of roof and envelope stress from one region to another.',
      source: 'Florida geographic storm model',
      imageUrl: '/hero-home-storm.png',
      status: 'fallback' as const,
    },
    {
      kind: 'flood_map' as const,
      title: 'Flood & Coastal Risk Pattern',
      summary:
        'Flood and coastal risk patterns vary significantly across the state. Low-elevation areas, drainage constraints, coastal proximity, and stormwater overload all influence where water intrusion and post-storm losses are more likely.',
      source: 'Florida flood and coastal indicators',
      imageUrl: '/storm-readiness-inspection.png',
      status: 'fallback' as const,
    },
  ];

  const cards = snapshot?.cards || fallbackCards;
  const icons = [Waves, MapPin, Wind];

  return (
    <section id="storm-reality" className="py-20 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal">
          <div className="ds-kicker mb-4" style={{ color: 'var(--ds-gray-500)' }}>
            Geographic storm context
          </div>
          <h2 className="ds-section-title text-3xl sm:text-4xl lg:text-5xl mb-6" style={{ color: 'var(--ds-primary-900)' }}>
            Storm Risk Isn't the Same Everywhere
          </h2>
          <div className="space-y-4 ds-body text-base sm:text-lg" style={{ color: 'var(--ds-primary-800)' }}>
            <p>
              Many homeowners assume that storm risk is the same across Florida.
            </p>
            <p>
              But storm exposure is shaped by several geographic factors — including coastal proximity,
              flood zones, wind exposure, and the historical paths hurricanes have taken across the state.
            </p>
            <p>
              When these layers combine, they create very different levels of storm exposure from one
              neighborhood to another.
            </p>
            <p className="font-semibold" style={{ color: 'var(--ds-primary-900)' }}>
              Two homes only a few miles apart may face completely different levels of storm risk.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10 mb-16">
          {cards.map((card, index) => {
            const Icon = icons[index] || Waves;

            return (
              <div key={card.title} className="reveal">
                <LandingStormIntelligenceCard
                  card={card}
                  icon={Icon}
                  loading={loading}
                />
              </div>
            );
          })}
        </div>

        <div className="reveal max-w-3xl mx-auto text-center">
          <p className="ds-body text-base mb-8" style={{ color: 'var(--ds-gray-500)' }}>
            Understanding these geographic factors is the first step in evaluating the real storm
            exposure of your home. The next step is to check how they combine at the ZIP level.
          </p>
          <div className="max-w-xl mx-auto">
            <CheckRiskCTA onCheckRisk={_onCheckRisk} variant="inline" />
          </div>
        </div>
      </div>
    </section>
  );
}
