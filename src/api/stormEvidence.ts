export interface StormHeadline {
  title: string;
  source: string;
  url?: string;
  image?: string;
}

export interface StormEvidenceCardSnapshot {
  title: string;
  description: string;
  source: string;
  imageUrl: string;
  headline?: StormHeadline | null;
}

export interface StormEvidenceSnapshot {
  generatedAt: string;
  locationLabel: string;
  countyLabel?: string;
  cards: StormEvidenceCardSnapshot[];
}

interface FetchVerifiedStormHeadlineParams {
  city?: string;
  county?: string;
  state?: string;
  zipCode: string;
}

const HAZARD_KEYWORDS = [
  'hurricane',
  'storm',
  'flood',
  'flooding',
  'surge',
  'wind',
  'tropical',
  'rain',
  'weather',
];

const IMPACT_KEYWORDS = [
  'damage',
  'damages',
  'damaged',
  'claims',
  'emergency',
  'warning',
  'evacuation',
  'roof',
  'insurance',
];

interface BuildStormEvidenceSnapshotParams {
  city?: string;
  county?: string;
  state?: string;
  locationLabel: string;
  zipCode: string;
  stormScore: number;
  hurricaneScore: number;
  floodScore: number;
  coastalScore: number;
}

function getSeverityLabel(score: number): string {
  if (score >= 4) return 'high';
  if (score >= 3) return 'moderate';
  return 'lower';
}

export function buildWindProfile(
  city: string | undefined,
  zipCode: string,
  stormScore: number,
  hurricaneScore: number,
  coastalScore: number
): string {
  const locationLabel = city ? `${city}, ZIP ${zipCode}` : `ZIP ${zipCode}`;
  const hurricaneBand = getSeverityLabel(hurricaneScore);
  const coastalBand = getSeverityLabel(coastalScore);

  if (stormScore >= 80 || hurricaneScore >= 4) {
    return `${locationLabel} shows a high wind-exposure profile. Hurricane loading and coastal proximity both trend ${hurricaneBand}, which increases the likelihood of roof stress, envelope damage and post-storm insurance scrutiny.`;
  }

  return `${locationLabel} shows a ${hurricaneBand} hurricane pattern with ${coastalBand} coastal exposure. That points to periodic wind-driven stress rather than a constant extreme condition, but the property should still be evaluated for fastening, openings and water-entry weak points.`;
}

export function buildFloodProfile(locationLabel: string, floodScore: number, coastalScore: number): string {
  const floodBand = getSeverityLabel(floodScore);
  const coastalBand = getSeverityLabel(coastalScore);

  if (floodScore >= 4) {
    return `${locationLabel} carries a high flood/water-intrusion signal. With flood indicators trending ${floodBand} and coastal exposure ${coastalBand}, this is the kind of profile where drainage overload, wind-driven rain and low-elevation vulnerabilities matter materially.`;
  }

  return `${locationLabel} shows a ${floodBand} flood profile. Even where flooding is not the dominant hazard, rainfall accumulation, drainage performance and building-envelope condition still shape real storm losses.`;
}

function articleMatchesIntent(article: StormHeadline, city?: string, county?: string, state?: string): boolean {
  const haystack = `${article.title} ${article.source}`.toLowerCase();
  const mentionsHazard = HAZARD_KEYWORDS.some((keyword) => haystack.includes(keyword));
  const mentionsImpact = IMPACT_KEYWORDS.some((keyword) => haystack.includes(keyword));
  const mentionsCity = city ? haystack.includes(city.toLowerCase()) : true;
  const mentionsCounty = county ? haystack.includes(county.toLowerCase().replace(' county', '')) : false;
  const mentionsState = state ? haystack.includes(state.toLowerCase()) : true;

  return mentionsHazard && mentionsState && (mentionsImpact || mentionsCity || mentionsCounty);
}

async function fetchHeadlineCandidates(query: string, max: number = 3): Promise<StormHeadline[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const url = `${supabaseUrl}/functions/v1/fetch-storm-news?q=${encodeURIComponent(query)}&max=${max}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Storm news request failed: ${errorText}`);
  }

  const data = await response.json();

  if (!data.articles || !Array.isArray(data.articles)) {
    return [];
  }

  return data.articles.map((article: any) => ({
    title: article.title,
    source: article.source?.name || 'News Source',
    url: article.url,
    image: article.image,
  }));
}

export async function fetchVerifiedStormHeadline({
  city,
  county,
  state,
  zipCode,
}: FetchVerifiedStormHeadlineParams): Promise<StormHeadline | null> {
  const stateLabel = state || 'Florida';
  const countyLabel = county ? county.replace(/ county$/i, '') : undefined;
  const locationQueries = [
    city ? `"${city}" "${stateLabel}" hurricane damage homes` : null,
    city ? `"${city}" "${stateLabel}" flooding residential` : null,
    countyLabel ? `"${countyLabel} County" "${stateLabel}" storm damage` : null,
    countyLabel ? `"${countyLabel} County" "${stateLabel}" flooding homes` : null,
    `"${zipCode}" "${stateLabel}" hurricane`,
    `"${zipCode}" "${stateLabel}" flood`,
    `"${stateLabel}" hurricane damage residential`,
  ].filter((query): query is string => Boolean(query));

  try {
    for (const query of locationQueries) {
      const candidates = await fetchHeadlineCandidates(query, 3);
      const preciseMatch = candidates.find((article) =>
        articleMatchesIntent(article, city, county, state)
      );

      if (preciseMatch) {
        return preciseMatch;
      }
    }

    return null;
  } catch (error) {
    console.error('[Storm Evidence] Failed to fetch verified regional headline:', error);
    return null;
  }
}

export async function buildStormEvidenceSnapshot({
  city,
  county,
  state,
  locationLabel,
  zipCode,
  stormScore,
  hurricaneScore,
  floodScore,
  coastalScore,
}: BuildStormEvidenceSnapshotParams): Promise<StormEvidenceSnapshot> {
  const resolvedCountyLabel = county
    ? county.toLowerCase().includes('county')
      ? county
      : `${county} County`
    : undefined;

  const headline = await fetchVerifiedStormHeadline({
    city,
    county,
    state,
    zipCode,
  });

  return {
    generatedAt: new Date().toISOString(),
    locationLabel,
    countyLabel: resolvedCountyLabel,
    cards: [
      {
        title: 'Verified Regional Signal',
        description: headline
          ? `We found a recent public report tied to storm, flood, or damage language around ${locationLabel}.`
          : `No recent verified local article was found for ${locationLabel} at render time, so this section falls back to geographic risk evidence instead of inventing a local event.`,
        source: headline ? headline.source : 'Live public reporting',
        imageUrl: headline?.image || '/storm-risk-report-hero.png',
        headline,
      },
      {
        title: 'Wind & Hurricane Profile',
        description: buildWindProfile(city, zipCode, stormScore, hurricaneScore, coastalScore),
        source: resolvedCountyLabel ? `Geographic risk model for ${resolvedCountyLabel}` : 'Geographic risk model',
        imageUrl: '/hero-home-storm.png',
      },
      {
        title: 'Flood & Water Intrusion Profile',
        description: buildFloodProfile(locationLabel, floodScore, coastalScore),
        source: resolvedCountyLabel ? `Flood and coastal indicators for ${resolvedCountyLabel}` : 'Flood and coastal exposure indicators',
        imageUrl: '/storm-readiness-inspection.png',
      },
    ],
  };
}
