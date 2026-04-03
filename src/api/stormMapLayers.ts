export type StormMapLayerKey =
  | 'official_alerts'
  | 'coastal_flood'
  | 'tropical_weather';

type BasicFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<Record<string, unknown>>;
};

type NwsAlertsResponse = {
  features?: Array<{
    type?: string;
    geometry?: Record<string, unknown> | null;
    properties?: {
      event?: string;
      severity?: string;
      senderName?: string;
      headline?: string;
      areaDesc?: string;
    };
  }>;
};

const NWS_USER_AGENT = 'villalbajuan-maker/bolt-inspection-engine';

function emptyFeatureCollection(): BasicFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [],
  };
}

function supportsMapGeometry(geometry?: Record<string, unknown> | null) {
  if (!geometry || typeof geometry.type !== 'string') {
    return false;
  }

  return ['Polygon', 'MultiPolygon', 'LineString', 'MultiLineString'].includes(
    geometry.type,
  );
}

export async function fetchFloridaActiveAlertsGeoJSON(): Promise<BasicFeatureCollection> {
  try {
    const response = await fetch('https://api.weather.gov/alerts/active?area=FL', {
      headers: {
        Accept: 'application/geo+json',
        'User-Agent': NWS_USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`NWS alerts request failed with ${response.status}`);
    }

    const data: NwsAlertsResponse = await response.json();
    const features = (data.features || []).filter((feature) =>
      supportsMapGeometry(feature.geometry),
    );

    return {
      type: 'FeatureCollection',
      features,
    };
  } catch (error) {
    console.error('[stormMapLayers] Failed to fetch Florida active alerts:', error);
    return emptyFeatureCollection();
  }
}

export function buildNoaaFloridaFloodOverlay() {
  const params = new URLSearchParams({
    bbox: '-87.75,24.30,-79.80,31.10',
    bboxSR: '4326',
    imageSR: '4326',
    size: '1200,720',
    format: 'png32',
    transparent: 'true',
    layers: 'show:6',
    f: 'image',
  });

  return {
    source: 'NOAA Coastal Flood Exposure Mapper',
    imageUrl: `https://coast.noaa.gov/arcgis/rest/services/FloodExposureMapper/CFEM_CoastalFloodHazardComposite/MapServer/export?${params.toString()}`,
    coordinates: [
      [-87.75, 31.1],
      [-79.8, 31.1],
      [-79.8, 24.3],
      [-87.75, 24.3],
    ] as [[number, number], [number, number], [number, number], [number, number]],
  };
}

export function buildNhcTropicalWeatherInset() {
  return {
    source: 'National Hurricane Center Atlantic Tropical Weather Outlook',
    imageUrl: 'https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png',
  };
}

export function buildMapboxFloridaStaticMapUrl(accessToken?: string) {
  if (!accessToken) {
    return '';
  }

  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/-81.5,28.5,5.9,0/1400x920?access_token=${accessToken}`;
}
