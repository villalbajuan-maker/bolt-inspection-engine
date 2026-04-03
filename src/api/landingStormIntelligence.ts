export interface LandingStormIntelligenceCard {
  kind: 'verified_signal' | 'wind_map' | 'flood_map';
  title: string;
  summary: string;
  source: string;
  imageUrl: string;
  status: 'verified' | 'fallback' | 'live_map';
  headline?: string;
  url?: string;
  publishedAt?: string;
  mapMeta?: {
    dataset: string;
    updatedAt?: string;
    coverage: 'statewide';
  };
}

export interface LandingStormIntelligenceSnapshot {
  generatedAt: string;
  regionLabel: 'Florida';
  freshness: {
    generatedAt: string;
    ttlMinutes: number;
  };
  cards: [
    LandingStormIntelligenceCard,
    LandingStormIntelligenceCard,
    LandingStormIntelligenceCard,
  ];
}

export async function fetchLandingStormIntelligenceSnapshot(): Promise<LandingStormIntelligenceSnapshot> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const url = `${supabaseUrl}/functions/v1/fetch-landing-storm-intelligence`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Landing storm intelligence request failed: ${errorText}`);
  }

  return response.json();
}
