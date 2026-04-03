export interface StormHeadline {
  title: string;
  source: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  severity?: string;
}

export interface StormEvidenceCardSnapshot {
  kind?: 'verified_signal' | 'wind_map' | 'flood_map';
  title: string;
  description: string;
  source: string;
  imageUrl: string;
  status?: 'verified' | 'fallback' | 'live_map';
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
  locationLabel?: string;
}

type NwsAlertFeature = {
  id: string;
  properties: {
    event?: string;
    headline?: string;
    description?: string;
    instruction?: string;
    severity?: string;
    urgency?: string;
    certainty?: string;
    senderName?: string;
    sent?: string;
    effective?: string;
    onset?: string;
    web?: string;
    areaDesc?: string;
  };
};

type NwsAlertsResponse = {
  features?: NwsAlertFeature[];
};

const NWS_USER_AGENT = 'villalbajuan-maker/bolt-inspection-engine';

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

function severityRank(severity?: string) {
  if (severity === 'Extreme') return 4;
  if (severity === 'Severe') return 3;
  if (severity === 'Moderate') return 2;
  if (severity === 'Minor') return 1;
  return 0;
}

function toTimestamp(value?: string) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function fetchNwsAlerts(url: string): Promise<NwsAlertFeature[]> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/geo+json',
      'User-Agent': NWS_USER_AGENT,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NWS alerts request failed: ${errorText}`);
  }

  const data: NwsAlertsResponse = await response.json();
  return data.features || [];
}

function normalizeNwsAlert(feature: NwsAlertFeature): StormHeadline | null {
  const props = feature.properties;
  const title = props.headline || props.event;

  if (!title) {
    return null;
  }

  return {
    title,
    source: props.senderName || 'National Weather Service',
    url: props.web,
    publishedAt: props.sent || props.effective || props.onset,
    severity: props.severity,
  };
}

function pickBestAlert(features: NwsAlertFeature[]): StormHeadline | null {
  const normalized = features
    .map(normalizeNwsAlert)
    .filter((item): item is StormHeadline => Boolean(item));

  normalized.sort((a, b) => {
    const severityDelta = severityRank(b.severity) - severityRank(a.severity);
    if (severityDelta !== 0) {
      return severityDelta;
    }

    return toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt);
  });

  return normalized[0] || null;
}

function isFloodOrCoastalAlert(feature: NwsAlertFeature) {
  const props = feature.properties;
  const haystack = `${props.event || ''} ${props.headline || ''} ${props.description || ''}`.toLowerCase();

  return [
    'flood',
    'coastal flood',
    'storm surge',
    'high surf',
    'rip current',
    'inundation',
  ].some((keyword) => haystack.includes(keyword));
}

function pickBestFloodAlert(features: NwsAlertFeature[]): StormHeadline | null {
  return pickBestAlert(features.filter(isFloodOrCoastalAlert));
}

function buildNoaaFloridaFloodMapImageUrl() {
  const params = new URLSearchParams({
    bbox: '-87.75,24.30,-79.80,31.10',
    bboxSR: '4326',
    imageSR: '4326',
    size: '1200,720',
    format: 'png32',
    transparent: 'false',
    layers: 'show:6',
    f: 'image',
  });

  return `https://coast.noaa.gov/arcgis/rest/services/FloodExposureMapper/CFEM_CoastalFloodHazardComposite/MapServer/export?${params.toString()}`;
}

export async function fetchVerifiedStormHeadline({
  state,
  locationLabel,
}: FetchVerifiedStormHeadlineParams): Promise<StormHeadline | null> {
  try {
    const stateCode = state && state.toLowerCase() === 'florida' ? 'FL' : 'FL';
    const activeAlerts = await fetchNwsAlerts(`https://api.weather.gov/alerts/active?area=${stateCode}`);
    const bestActiveAlert = pickBestAlert(activeAlerts);
    if (bestActiveAlert) return bestActiveAlert;

    const recentAlerts = await fetchNwsAlerts(`https://api.weather.gov/alerts?area=${stateCode}&limit=20`);
    return pickBestAlert(recentAlerts);
  } catch (error) {
    console.error(`[Storm Evidence] Failed to fetch verified official signal for ${locationLabel || state || 'Florida'}:`, error);
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
    locationLabel,
  });

  let floodHeadline: StormHeadline | null = null;
  try {
    const activeAlerts = await fetchNwsAlerts('https://api.weather.gov/alerts/active?area=FL');
    floodHeadline = pickBestFloodAlert(activeAlerts);
    if (!floodHeadline) {
      const recentAlerts = await fetchNwsAlerts('https://api.weather.gov/alerts?area=FL&limit=20');
      floodHeadline = pickBestFloodAlert(recentAlerts);
    }
  } catch (error) {
    console.error('[Storm Evidence] Failed to fetch flood/coastal official context:', error);
  }

  const dedupedFloodHeadline =
    headline && floodHeadline &&
    ((headline.title.trim().toLowerCase() === floodHeadline.title.trim().toLowerCase()) ||
      (headline.url && floodHeadline.url && headline.url.trim().toLowerCase() === floodHeadline.url.trim().toLowerCase()))
      ? null
      : floodHeadline;

  return {
    generatedAt: new Date().toISOString(),
    locationLabel,
    countyLabel: resolvedCountyLabel,
    cards: [
      {
        kind: 'verified_signal',
        title: 'Verified Regional Signal',
        description: headline
          ? `An official National Weather Service signal was identified for the broader Florida context around ${locationLabel}.`
          : `No recent verified official signal was found for ${locationLabel} at render time, so this section falls back to geographic risk evidence instead of inventing a local event.`,
        source: headline ? headline.source : 'National Weather Service',
        imageUrl: '/storm-risk-report-hero.png',
        status: headline ? 'verified' : 'fallback',
        headline,
      },
      {
        kind: 'wind_map',
        title: 'Hurricane Track & Wind Exposure',
        description: `${buildWindProfile(city, zipCode, stormScore, hurricaneScore, coastalScore)} This map uses the official National Hurricane Center Atlantic Tropical Weather Outlook to add current basin-wide wind and hurricane context.`,
        source: 'National Hurricane Center Atlantic Tropical Weather Outlook',
        imageUrl: 'https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png',
        status: 'live_map',
      },
      {
        kind: 'flood_map',
        title: 'Flood & Coastal Exposure',
        description: dedupedFloodHeadline
          ? `${buildFloodProfile(locationLabel, floodScore, coastalScore)} This map anchors on NOAA's Coastal Flood Exposure Mapper and adds current official flood or coastal alert context when available.`
          : `${buildFloodProfile(locationLabel, floodScore, coastalScore)} This map anchors on NOAA's Coastal Flood Exposure Mapper without repeating the same official signal already highlighted above.`,
        source: dedupedFloodHeadline
          ? 'NOAA Coastal Flood Exposure Mapper + National Weather Service alerts'
          : 'NOAA Coastal Flood Exposure Mapper',
        imageUrl: buildNoaaFloridaFloodMapImageUrl(),
        status: 'live_map',
        headline: dedupedFloodHeadline,
      },
    ],
  };
}
