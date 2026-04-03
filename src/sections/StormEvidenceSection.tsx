import { FileText, AlertCircle, Droplets } from 'lucide-react';
import { useEffect, useState } from 'react';
import { buildFloodProfile, buildStormEvidenceSnapshot, buildWindProfile, StormEvidenceSnapshot } from '../api/stormEvidence';
import { getLocationContextFromCoordinates, LocationContext } from '../api/riskData';
import { LandingStormIntelligenceCard } from '../components/LandingStormIntelligenceCard';

interface StormEvidenceSectionProps {
  city?: string;
  zipCode: string;
  stormScore: number;
  hurricaneScore: number;
  floodScore: number;
  coastalScore: number;
  lat?: number;
  lon?: number;
  evidenceSnapshot?: StormEvidenceSnapshot;
}

export function StormEvidenceSection({
  city,
  zipCode,
  stormScore,
  hurricaneScore,
  floodScore,
  coastalScore,
  lat,
  lon,
  evidenceSnapshot,
}: StormEvidenceSectionProps) {
  const [snapshot, setSnapshot] = useState<StormEvidenceSnapshot | null>(evidenceSnapshot || null);
  const [locationContext, setLocationContext] = useState<LocationContext | null>(null);
  const [loading, setLoading] = useState(!evidenceSnapshot);

  useEffect(() => {
    const loadEvidence = async () => {
      if (evidenceSnapshot) {
        setSnapshot(evidenceSnapshot);
        setLoading(false);
        return;
      }

      setLoading(true);
      const derivedContext =
        lat !== undefined && lon !== undefined
          ? await getLocationContextFromCoordinates(lat, lon, zipCode)
          : null;

      setLocationContext(derivedContext);

      const resolvedCity = derivedContext?.city || city;
      const generatedSnapshot = await buildStormEvidenceSnapshot({
        city: resolvedCity,
        county: derivedContext?.county,
        state: derivedContext?.state,
        locationLabel:
          derivedContext?.displayLabel ||
          (resolvedCity ? `${resolvedCity}, Florida` : `ZIP ${zipCode}`),
        zipCode,
        stormScore,
        hurricaneScore,
        floodScore,
        coastalScore,
      });

      setSnapshot(generatedSnapshot);
      setLoading(false);
    };

    loadEvidence();
  }, [city, zipCode, lat, lon, stormScore, hurricaneScore, floodScore, coastalScore, evidenceSnapshot]);

  const resolvedCity = locationContext?.city || city;
  const fallbackLocationLabel =
    locationContext?.displayLabel ||
    (resolvedCity ? `${resolvedCity}, Florida` : `ZIP ${zipCode}`);
  const evidenceCards =
    snapshot?.cards ||
    [
      {
        kind: 'verified_signal' as const,
        title: 'Verified Regional Signal',
        description: `No recent verified local article was found for ${fallbackLocationLabel} at render time, so this section falls back to geographic risk evidence instead of inventing a local event.`,
        source: 'Live public reporting',
        imageUrl: '/storm-risk-report-hero.png',
        status: 'fallback' as const,
        headline: null,
      },
      {
        kind: 'wind_map' as const,
        title: 'Hurricane Track & Wind Exposure',
        description: buildWindProfile(resolvedCity, zipCode, stormScore, hurricaneScore, coastalScore),
        source: 'Geographic risk model',
        imageUrl: 'https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png',
        status: 'live_map' as const,
      },
      {
        kind: 'flood_map' as const,
        title: 'Flood & Coastal Exposure',
        description: buildFloodProfile(fallbackLocationLabel, floodScore, coastalScore),
        source: 'Flood and coastal exposure indicators',
        imageUrl: '/storm-readiness-inspection.png',
        status: 'live_map' as const,
      },
    ];
  const locationLabel = snapshot?.locationLabel || fallbackLocationLabel;
  const iconMap = [AlertCircle, FileText, Droplets];

  return (
    <section className="py-12 sm:py-16 bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Storm Evidence in Your Region
          </h2>
          <p className="text-slate-600">
            {`Location-based storm evidence for ${locationLabel}`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 scroll-reveal">
          {evidenceCards.map((card, index) => {
            const Icon = iconMap[index] || AlertCircle;
            const normalizedCard = {
              kind: card.kind ?? (index === 0 ? 'verified_signal' : index === 1 ? 'wind_map' : 'flood_map'),
              title: card.title,
              summary: card.description,
              source: card.source,
              imageUrl: card.imageUrl,
              status: card.status ?? (index === 0 ? 'fallback' : 'live_map'),
              headline: card.headline?.title,
              url: card.headline?.url,
            } as const;

            return (
              <div key={index}>
                <LandingStormIntelligenceCard
                  card={normalizedCard}
                  icon={Icon}
                  loading={loading}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
