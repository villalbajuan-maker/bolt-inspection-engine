import { supabase } from '../lib/supabaseClient';
import { ZipRiskData } from '../types';

export interface LocationContext {
  city?: string;
  county?: string;
  state?: string;
  displayLabel: string;
}

export async function getStormRiskFromSupabase(zipCode: string) {
  try {
    const { data, error } = await supabase.rpc('get_storm_report', {
      input_zip: zipCode
    });

    if (error) {
      console.error('Error fetching storm risk from Supabase:', error);
      return null;
    }

    if (!data || data.error) {
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error calling get_storm_report:', err);
    return null;
  }
}

export async function getZipRiskData(zipCode: string): Promise<ZipRiskData | null> {
  const { data, error } = await supabase
    .from('florida_zip_reference')
    .select('*')
    .eq('zip_code', zipCode)
    .maybeSingle();

  if (error) {
    console.error('Error fetching ZIP risk data:', error);
    return null;
  }

  return data;
}

export async function getCityFromCoordinates(lat: number, lon: number): Promise<string | null> {
  try {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken || mapboxToken.includes('Dummy')) {
      console.warn('Mapbox token not configured for reverse geocoding');
      return null;
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?types=place&access_token=${mapboxToken}`
    );

    if (!response.ok) {
      console.warn('Reverse geocoding failed');
      return null;
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const city = data.features[0].text;
      return city;
    }

    return null;
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
}

export async function getLocationContextFromCoordinates(
  lat: number,
  lon: number,
  zipCode?: string
): Promise<LocationContext | null> {
  try {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken || mapboxToken.includes('Dummy')) {
      console.warn('Mapbox token not configured for location context');
      return null;
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?types=place,region,district,postcode&access_token=${mapboxToken}`
    );

    if (!response.ok) {
      console.warn('Location context lookup failed');
      return null;
    }

    const data = await response.json();
    const features = Array.isArray(data.features) ? data.features : [];

    const placeFeature = features.find((feature: any) => feature.place_type?.includes('place'));
    const districtFeature = features.find((feature: any) => feature.place_type?.includes('district'));
    const regionFeature = features.find((feature: any) => feature.place_type?.includes('region'));

    const city =
      placeFeature?.text ||
      placeFeature?.properties?.name ||
      undefined;

    const county =
      districtFeature?.text ||
      districtFeature?.properties?.name ||
      undefined;

    const state =
      regionFeature?.text ||
      regionFeature?.properties?.name ||
      undefined;

    const displayLabel =
      [city, county, state].filter(Boolean).join(', ') ||
      (zipCode ? `ZIP ${zipCode}` : 'this area');

    return {
      city,
      county,
      state,
      displayLabel,
    };
  } catch (error) {
    console.error('Error fetching location context:', error);
    return null;
  }
}
