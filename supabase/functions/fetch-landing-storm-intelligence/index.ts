const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200",
};

type LandingStormHeadline = {
  title: string;
  source: string;
  url?: string;
  publishedAt?: string;
  severity?: string;
};

type LandingStormIntelligenceCard = {
  kind: "verified_signal" | "wind_map" | "flood_map";
  title: string;
  summary: string;
  source: string;
  imageUrl: string;
  status: "verified" | "fallback" | "live_map";
  headline?: string;
  url?: string;
  publishedAt?: string;
  mapMeta?: {
    dataset: string;
    updatedAt?: string;
    coverage: "statewide";
  };
};

type LandingStormIntelligenceSnapshot = {
  generatedAt: string;
  regionLabel: "Florida";
  freshness: {
    generatedAt: string;
    ttlMinutes: number;
  };
  cards: [
    LandingStormIntelligenceCard,
    LandingStormIntelligenceCard,
    LandingStormIntelligenceCard,
  ];
};

function dedupeFloodCardAgainstVerifiedSignal(
  verifiedSignal: LandingStormIntelligenceCard,
  floodCard: LandingStormIntelligenceCard,
): LandingStormIntelligenceCard {
  if (
    verifiedSignal.kind !== "verified_signal" ||
    floodCard.kind !== "flood_map" ||
    !verifiedSignal.headline ||
    !floodCard.headline
  ) {
    return floodCard;
  }

  const sameHeadline =
    verifiedSignal.headline.trim().toLowerCase() === floodCard.headline.trim().toLowerCase();
  const sameUrl =
    verifiedSignal.url &&
    floodCard.url &&
    verifiedSignal.url.trim().toLowerCase() === floodCard.url.trim().toLowerCase();

  if (!sameHeadline && !sameUrl) {
    return floodCard;
  }

  return {
    ...floodCard,
    summary:
      "This card uses NOAA's Florida coastal flood exposure map to show statewide flood and coastal screening context without repeating the same official signal already highlighted in the live reporting card.",
    headline: undefined,
    url: undefined,
    publishedAt: undefined,
  };
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

const NWS_USER_AGENT = "villalbajuan-maker/bolt-inspection-engine";

function severityRank(severity?: string) {
  if (severity === "Extreme") return 4;
  if (severity === "Severe") return 3;
  if (severity === "Moderate") return 2;
  if (severity === "Minor") return 1;
  return 0;
}

function toTimestamp(value?: string) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function fetchNwsAlerts(url: string): Promise<NwsAlertFeature[]> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/geo+json",
      "User-Agent": NWS_USER_AGENT,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NWS alerts request failed: ${errorText}`);
  }

  const data: NwsAlertsResponse = await response.json();
  return data.features || [];
}

function normalizeNwsAlert(feature: NwsAlertFeature): LandingStormHeadline | null {
  const props = feature.properties;
  const title = props.headline || props.event;

  if (!title) {
    return null;
  }

  return {
    title,
    source: props.senderName || "National Weather Service",
    url: props.web,
    publishedAt: props.sent || props.effective || props.onset,
    severity: props.severity,
  };
}

function isFloodOrCoastalAlert(feature: NwsAlertFeature) {
  const props = feature.properties;
  const haystack = `${props.event || ""} ${props.headline || ""} ${props.description || ""}`.toLowerCase();

  return [
    "flood",
    "coastal flood",
    "storm surge",
    "high surf",
    "rip current",
    "inundation",
  ].some((keyword) => haystack.includes(keyword));
}

function pickBestAlert(features: NwsAlertFeature[]): LandingStormHeadline | null {
  const normalized = features
    .map(normalizeNwsAlert)
    .filter((item): item is LandingStormHeadline => Boolean(item));

  normalized.sort((a, b) => {
    const severityDelta = severityRank(b.severity) - severityRank(a.severity);
    if (severityDelta !== 0) {
      return severityDelta;
    }

    return toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt);
  });

  return normalized[0] || null;
}

function pickBestFloodAlert(features: NwsAlertFeature[]): LandingStormHeadline | null {
  return pickBestAlert(features.filter(isFloodOrCoastalAlert));
}

async function resolveVerifiedFloridaSignal(): Promise<LandingStormIntelligenceCard> {
  try {
    const activeAlerts = await fetchNwsAlerts("https://api.weather.gov/alerts/active?area=FL");
    const bestActiveAlert = pickBestAlert(activeAlerts);

    if (bestActiveAlert) {
      return {
        kind: "verified_signal",
        title: "Verified Florida Storm Signal",
        summary: "An active National Weather Service alert was identified for Florida, providing a live official signal tied to current storm or flood conditions.",
        source: bestActiveAlert.source,
        imageUrl: "/storm-risk-report-hero.png",
        status: "verified",
        headline: bestActiveAlert.title,
        url: bestActiveAlert.url,
        publishedAt: bestActiveAlert.publishedAt,
      };
    }

    const recentAlerts = await fetchNwsAlerts("https://api.weather.gov/alerts?area=FL&limit=20");
    const bestRecentAlert = pickBestAlert(recentAlerts);

    if (bestRecentAlert) {
      return {
        kind: "verified_signal",
        title: "Verified Florida Storm Signal",
        summary: "No active statewide alert was available at render time, so this card falls back to the most recent official National Weather Service alert for Florida.",
        source: bestRecentAlert.source,
        imageUrl: "/storm-risk-report-hero.png",
        status: "verified",
        headline: bestRecentAlert.title,
        url: bestRecentAlert.url,
        publishedAt: bestRecentAlert.publishedAt,
      };
    }
  } catch (error) {
    console.error("[fetch-landing-storm-intelligence] Verified signal lookup failed:", error);
  }

  return {
    kind: "verified_signal",
    title: "Verified Florida Storm Signal",
    summary: "No verified Florida-wide article was identified at render time, so this section relies on geographic risk context instead of synthetic news copy.",
    source: "Verified public reporting",
    imageUrl: "/storm-risk-report-hero.png",
    status: "fallback",
  };
}

function resolveWindMapCard(): LandingStormIntelligenceCard {
  return {
    kind: "wind_map",
    title: "Hurricane Track & Wind Exposure",
    summary: "This card uses the official National Hurricane Center Atlantic Tropical Weather Outlook graphic to represent current basin-wide tropical activity that can shape downstream wind and hurricane exposure for Florida.",
    source: "National Hurricane Center Atlantic Tropical Weather Outlook",
    imageUrl: "https://www.nhc.noaa.gov/xgtwo/two_atl_7d0.png",
    status: "live_map",
    mapMeta: {
      dataset: "NHC Atlantic 7-day tropical weather outlook",
      updatedAt: new Date().toISOString(),
      coverage: "statewide",
    },
  };
}

function resolveFloodMapCard(): LandingStormIntelligenceCard {
  return {
    kind: "flood_map",
    title: "Flood & Coastal Exposure",
    summary: "Flood and coastal risk patterns vary significantly across the state. Low-elevation areas, drainage constraints, coastal proximity, and stormwater overload all influence where water intrusion and post-storm losses are more likely.",
    source: "FEMA / coastal flood statewide context",
    imageUrl: "/storm-readiness-inspection.png",
    status: "fallback",
    mapMeta: {
      dataset: "Statewide flood and coastal context",
      coverage: "statewide",
    },
  };
}

function buildNoaaFloridaFloodMapImageUrl() {
  const params = new URLSearchParams({
    bbox: "-87.75,24.30,-79.80,31.10",
    bboxSR: "4326",
    imageSR: "4326",
    size: "1200,720",
    format: "png32",
    transparent: "false",
    layers: "show:6",
    f: "image",
  });

  return `https://coast.noaa.gov/arcgis/rest/services/FloodExposureMapper/CFEM_CoastalFloodHazardComposite/MapServer/export?${params.toString()}`;
}

async function resolveDynamicFloodCard(): Promise<LandingStormIntelligenceCard> {
  const baseMapImageUrl = buildNoaaFloridaFloodMapImageUrl();

  try {
    const activeAlerts = await fetchNwsAlerts("https://api.weather.gov/alerts/active?area=FL");
    const bestActiveFloodAlert = pickBestFloodAlert(activeAlerts);

    if (bestActiveFloodAlert) {
      return {
        kind: "flood_map",
        title: "Flood & Coastal Exposure",
        summary: "This card anchors on NOAA's Florida coastal flood exposure map and layers in a current official flood or coastal alert when one is active.",
        source: "NOAA Coastal Flood Exposure Mapper + National Weather Service alerts",
        imageUrl: baseMapImageUrl,
        status: "live_map",
        headline: bestActiveFloodAlert.title,
        url: bestActiveFloodAlert.url,
        publishedAt: bestActiveFloodAlert.publishedAt,
        mapMeta: {
          dataset: "NOAA CFEM Florida coastal flood hazard composite + NWS flood/coastal alerts",
          updatedAt: new Date().toISOString(),
          coverage: "statewide",
        },
      };
    }

    const recentAlerts = await fetchNwsAlerts("https://api.weather.gov/alerts?area=FL&limit=20");
    const bestRecentFloodAlert = pickBestFloodAlert(recentAlerts);

    if (bestRecentFloodAlert) {
      return {
        kind: "flood_map",
        title: "Flood & Coastal Exposure",
        summary: "This card anchors on NOAA's Florida coastal flood exposure map and adds the most recent official Florida flood or coastal alert when no active one is available.",
        source: "NOAA Coastal Flood Exposure Mapper + National Weather Service alerts",
        imageUrl: baseMapImageUrl,
        status: "live_map",
        headline: bestRecentFloodAlert.title,
        url: bestRecentFloodAlert.url,
        publishedAt: bestRecentFloodAlert.publishedAt,
        mapMeta: {
          dataset: "NOAA CFEM Florida coastal flood hazard composite + NWS flood/coastal alerts",
          updatedAt: new Date().toISOString(),
          coverage: "statewide",
        },
      };
    }
  } catch (error) {
    console.error("[fetch-landing-storm-intelligence] Dynamic flood lookup failed:", error);
  }

  return {
    kind: "flood_map",
    title: "Flood & Coastal Exposure",
    summary: "This card uses NOAA's Coastal Flood Exposure Mapper for Florida to show a statewide screening view of areas with stronger coastal flood hazard overlap, even when no active flood or coastal alert is currently in effect.",
    source: "NOAA Coastal Flood Exposure Mapper",
    imageUrl: baseMapImageUrl,
    status: "live_map",
    mapMeta: {
      dataset: "NOAA CFEM Florida coastal flood hazard composite",
      updatedAt: new Date().toISOString(),
      coverage: "statewide",
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const verifiedSignal = await resolveVerifiedFloridaSignal();
    const windCard = resolveWindMapCard();
    const floodCard = dedupeFloodCardAgainstVerifiedSignal(
      verifiedSignal,
      await resolveDynamicFloodCard(),
    );

    const snapshot: LandingStormIntelligenceSnapshot = {
      generatedAt: new Date().toISOString(),
      regionLabel: "Florida",
      freshness: {
        generatedAt: new Date().toISOString(),
        ttlMinutes: 360,
      },
      cards: [verifiedSignal, windCard, floodCard],
    };

    return new Response(JSON.stringify(snapshot), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[fetch-landing-storm-intelligence] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
