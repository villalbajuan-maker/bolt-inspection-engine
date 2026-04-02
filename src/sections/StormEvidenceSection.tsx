import { FileText, AlertCircle, Droplets, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { buildFloodProfile, buildStormEvidenceSnapshot, buildWindProfile, StormEvidenceSnapshot } from '../api/stormEvidence';
import { getLocationContextFromCoordinates, LocationContext } from '../api/riskData';

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
        title: 'Verified Regional Signal',
        description: `No recent verified local article was found for ${fallbackLocationLabel} at render time, so this section falls back to geographic risk evidence instead of inventing a local event.`,
        source: 'Live public reporting',
        imageUrl: '/storm-risk-report-hero.png',
        headline: null,
      },
      {
        title: 'Wind & Hurricane Profile',
        description: buildWindProfile(resolvedCity, zipCode, stormScore, hurricaneScore, coastalScore),
        source: 'Geographic risk model',
        imageUrl: '/hero-home-storm.png',
      },
      {
        title: 'Flood & Water Intrusion Profile',
        description: buildFloodProfile(fallbackLocationLabel, floodScore, coastalScore),
        source: 'Flood and coastal exposure indicators',
        imageUrl: '/storm-readiness-inspection.png',
      },
    ];
  const locationLabel = snapshot?.locationLabel || fallbackLocationLabel;
  const iconMap = [<AlertCircle className="w-6 h-6" />, <FileText className="w-6 h-6" />, <Droplets className="w-6 h-6" />];

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
            return (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-200 relative">
                  {loading ? (
                    <div className="w-full h-full bg-slate-300 animate-pulse" />
                  ) : (
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/storm-risk-preview.png';
                      }}
                    />
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-slate-700">{iconMap[index]}</div>
                    <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {card.description}
                  </p>

                  <div className="pt-4 border-t border-slate-200 mb-4">
                    <p className="text-xs text-slate-500 font-medium">
                      Source: {card.source}
                    </p>
                  </div>

                  {card.headline && !loading && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="mb-3">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Verified Public Report
                        </div>
                        <p className="text-sm text-slate-900 leading-relaxed font-medium mb-2">
                          "{card.headline.title}"
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-600">
                          Source: {card.headline.source}
                        </p>
                        {card.headline.url && (
                          <a
                            href={card.headline.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {!card.headline && !loading && index === 0 && (
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                        No Verified Article Found
                      </div>
                      <p className="text-sm text-amber-900 leading-relaxed">
                        We could not verify a recent local article specific to this location, so this report relies on geographic risk indicators rather than synthetic news copy.
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="animate-pulse">
                        <div className="h-3 bg-slate-200 rounded mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
