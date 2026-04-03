import { useScrollReveal } from '../hooks/useScrollReveal';
import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Wind, Droplets, Waves } from 'lucide-react';
import {
  buildMapboxFloridaStaticMapUrl,
  buildNhcTropicalWeatherInset,
  buildNoaaFloridaFloodOverlay,
  fetchFloridaActiveAlertsGeoJSON,
  type StormMapLayerKey,
} from '../api/stormMapLayers';
import { BrandIconBadge } from '../components/BrandIconBadge';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface StormIntelligenceSystemSectionProps {
  onCheckRisk: (zipCode?: string) => void;
}

const initialVisibility: Record<StormMapLayerKey, boolean> = {
  official_alerts: true,
  coastal_flood: true,
  tropical_weather: true,
};

export function StormIntelligenceSystemSection({ onCheckRisk: _onCheckRisk }: StormIntelligenceSystemSectionProps) {
  useScrollReveal();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadingLayers, setLoadingLayers] = useState(true);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [visibleLayers, setVisibleLayers] = useState(initialVisibility);
  const [mapFailed, setMapFailed] = useState(false);

  const floodOverlay = useMemo(() => buildNoaaFloridaFloodOverlay(), []);
  const tropicalInset = useMemo(() => buildNhcTropicalWeatherInset(), []);
  const staticMapUrl = useMemo(
    () => buildMapboxFloridaStaticMapUrl(import.meta.env.VITE_MAPBOX_TOKEN),
    [],
  );

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken || mapboxToken.includes('Dummy')) {
      console.warn('Mapbox token not configured');
      setMapFailed(true);
      setLoadingLayers(false);
      return;
    }

    let mounted = true;
    let resizeObserver: ResizeObserver | null = null;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-81.5, 28.5],
        zoom: 5.9,
        interactive: false,
        attributionControl: false,
      });

      map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
      map.current.on('error', (event) => {
        console.error('Storm Intelligence System map error:', event.error);
        setMapFailed(true);
      });

      map.current.on('load', async () => {
        if (!map.current || !mounted) return;

        setMapReady(true);
        map.current.resize();
        window.setTimeout(() => map.current?.resize(), 250);
        window.setTimeout(() => map.current?.resize(), 900);

        try {
          const alerts = await fetchFloridaActiveAlertsGeoJSON();
          setActiveAlertCount(alerts.features.length);

          map.current.addSource('official-alerts', {
            type: 'geojson',
            data: alerts as unknown as GeoJSON.FeatureCollection,
          });

          map.current.addLayer({
            id: 'official-alerts-fill',
            type: 'fill',
            source: 'official-alerts',
            paint: {
              'fill-color': '#f97316',
              'fill-opacity': 0.18,
            },
          });

          map.current.addLayer({
            id: 'official-alerts-line',
            type: 'line',
            source: 'official-alerts',
            paint: {
              'line-color': '#c2410c',
              'line-width': 1.5,
              'line-opacity': 0.75,
            },
          });
        } catch (error) {
          console.error('Failed to attach official alert layer:', error);
        }

        try {
          map.current.addSource('coastal-flood-overlay', {
            type: 'image',
            url: floodOverlay.imageUrl,
            coordinates: floodOverlay.coordinates,
          });

          map.current.addLayer({
            id: 'coastal-flood-overlay-layer',
            type: 'raster',
            source: 'coastal-flood-overlay',
            paint: {
              'raster-opacity': 0.4,
              'raster-fade-duration': 0,
            },
          });
        } catch (error) {
          console.error('Failed to attach coastal flood overlay:', error);
        }

        setLoadingLayers(false);
      });

      if (typeof ResizeObserver !== 'undefined' && mapContainer.current) {
        resizeObserver = new ResizeObserver(() => {
          map.current?.resize();
        });
        resizeObserver.observe(mapContainer.current);
      }
    } catch (error) {
      console.error('Error initializing Storm Intelligence System map:', error);
      setMapFailed(true);
      setLoadingLayers(false);
    }

    return () => {
      mounted = false;
      resizeObserver?.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, [floodOverlay.coordinates, floodOverlay.imageUrl]);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    const setVisibility = (layerId: string, visible: boolean) => {
      if (map.current?.getLayer(layerId)) {
        map.current.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    setVisibility('official-alerts-fill', visibleLayers.official_alerts);
    setVisibility('official-alerts-line', visibleLayers.official_alerts);
    setVisibility('coastal-flood-overlay-layer', visibleLayers.coastal_flood);
  }, [mapReady, visibleLayers]);

  const systemLayers = [
    {
      key: 'official_alerts' as const,
      icon: Waves,
      title: 'Official Alert Layer',
      shortLabel: 'Alerts',
      accent: 'bg-orange-500',
      pill: 'border-orange-200 bg-orange-50 text-orange-800',
      description:
        'Live National Weather Service alerts provide current official hazard footprints across Florida when active storm, flood, or coastal conditions are in effect.',
    },
    {
      key: 'coastal_flood' as const,
      icon: Droplets,
      title: 'Coastal Flood Exposure',
      shortLabel: 'Flood',
      accent: 'bg-sky-500',
      pill: 'border-sky-200 bg-sky-50 text-sky-800',
      description:
        'NOAA flood exposure mapping helps visualize where coastal flood hazards overlap more strongly across Florida, even when no active alert is present.',
    },
    {
      key: 'tropical_weather' as const,
      icon: Wind,
      title: 'Tropical Weather Context',
      shortLabel: 'Tropical',
      accent: 'bg-slate-900',
      pill: 'border-slate-200 bg-slate-100 text-slate-800',
      description:
        'The National Hurricane Center outlook adds current Atlantic and Gulf tropical context that can shape downstream wind and hurricane exposure for Florida.',
    },
  ];

  return (
    <section className="py-20 sm:py-24 lg:py-32" style={{ background: 'var(--ds-gray-50)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12 reveal">
          <div className="ds-kicker mb-4" style={{ color: 'var(--ds-gray-500)' }}>
            Environmental layer model
          </div>
          <h2 className="ds-section-title text-3xl sm:text-4xl lg:text-5xl mb-6" style={{ color: 'var(--ds-primary-900)' }}>
            Storm Intelligence System
          </h2>
          <p className="ds-lead text-lg mb-6" style={{ color: 'var(--ds-primary-800)' }}>
            Disaster Shield analyzes multiple environmental and geographic data layers to evaluate
            storm exposure across Florida.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12 reveal">
          <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border: '1px solid var(--ds-gray-200)' }}>
            <div className="flex flex-wrap justify-center gap-3 mb-5">
              {systemLayers.map((layer) => (
                <div
                  key={layer.key}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${layer.pill}`}
                >
                  <div className={`h-2.5 w-2.5 rounded-full ${layer.accent}`} />
                  {layer.shortLabel}
                </div>
              ))}
            </div>
            <p className="ds-body mb-4 text-center" style={{ color: 'var(--ds-primary-800)' }}>
              Storm damage risk is shaped by multiple environmental layers, not by one condition alone.
              This view combines official alert footprints, statewide coastal flood exposure, and live
              tropical context so homeowners can see the ingredients behind the risk model.
            </p>
            <p className="ds-caption text-center" style={{ color: 'var(--ds-gray-500)' }}>
              Use the toggles to isolate each layer and understand what it contributes.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-16 reveal">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl" style={{ border: '1px solid var(--ds-gray-200)' }}>
            <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--ds-gray-200)', background: 'linear-gradient(to right, var(--ds-gray-50), var(--ds-white))' }}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="ds-kicker" style={{ color: 'var(--ds-gray-500)' }}>
                    Official Florida layer view
                  </p>
                  <p className="mt-2 max-w-2xl ds-body text-sm" style={{ color: 'var(--ds-primary-800)' }}>
                    {loadingLayers
                      ? 'Loading official environmental layers...'
                      : activeAlertCount > 0
                        ? `${activeAlertCount} active official alerts are visible in the current Florida view.`
                        : 'No active official alerts are visible right now. The map still shows broader coastal and tropical context.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:max-w-[420px] lg:justify-end">
                  {systemLayers.map((layer) => (
                    <button
                      key={layer.key}
                      type="button"
                      onClick={() =>
                        setVisibleLayers((current) => ({
                          ...current,
                          [layer.key]: !current[layer.key],
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
                      style={{
                        borderColor: visibleLayers[layer.key] ? 'var(--ds-primary-900)' : 'var(--ds-gray-200)',
                        background: visibleLayers[layer.key] ? 'var(--ds-primary-900)' : 'var(--ds-white)',
                        color: visibleLayers[layer.key] ? 'var(--ds-white)' : 'var(--ds-primary-800)',
                        boxShadow: visibleLayers[layer.key] ? '0 4px 16px rgba(11,31,58,0.18)' : 'none',
                      }}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${visibleLayers[layer.key] ? 'bg-white' : layer.accent}`} />
                      {layer.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div
                ref={mapContainer}
                className="h-[460px] w-full bg-slate-100"
                style={{
                  opacity: mapReady || loadingLayers || mapFailed ? 1 : 0.65,
                  transition: 'opacity 0.4s',
                  backgroundImage: staticMapUrl ? `url(${staticMapUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {(mapFailed || !mapReady) && visibleLayers.coastal_flood && (
                <img
                  src={floodOverlay.imageUrl}
                  alt="NOAA coastal flood exposure overlay"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
                />
              )}

              <div className="pointer-events-none absolute left-4 bottom-4 rounded-2xl border border-white/70 bg-white/92 px-4 py-3 shadow-xl backdrop-blur sm:max-w-xs">
                <p className="ds-kicker" style={{ color: 'var(--ds-gray-500)', fontSize: '0.68rem' }}>
                  Reading this view
                </p>
                <p className="mt-2 ds-body text-sm" style={{ color: 'var(--ds-primary-800)' }}>
                  Orange shows current official alert geometry, blue shows statewide coastal flood exposure,
                  and the inset adds basin-wide tropical context.
                </p>
              </div>

              {mapFailed && (
                <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-amber-200 bg-amber-50/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900 shadow">
                  Static fallback map active
                </div>
              )}

              {visibleLayers.tropical_weather && (
                <div className="pointer-events-none absolute right-4 top-4 hidden w-[310px] overflow-hidden rounded-2xl bg-white/95 shadow-2xl backdrop-blur sm:block" style={{ border: '1px solid var(--ds-gray-200)' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--ds-gray-200)' }}>
                    <p className="ds-kicker" style={{ color: 'var(--ds-gray-500)', fontSize: '0.68rem' }}>
                      Tropical weather context
                    </p>
                    <p className="mt-1 ds-body text-sm font-semibold" style={{ color: 'var(--ds-primary-900)' }}>
                      National Hurricane Center Atlantic Outlook
                    </p>
                  </div>
                  <img
                    src={tropicalInset.imageUrl}
                    alt="National Hurricane Center Atlantic tropical outlook"
                    className="h-auto w-full"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            <div className="bg-white px-6 py-5" style={{ borderTop: '1px solid var(--ds-gray-200)' }}>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ border: '1px solid var(--ds-gray-200)', background: 'var(--ds-gray-50)' }}>
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <div>
                    <p className="ds-body text-sm font-semibold" style={{ color: 'var(--ds-primary-900)' }}>Official alerts</p>
                    <p className="ds-caption" style={{ color: 'var(--ds-gray-500)' }}>National Weather Service polygons</p>
                  </div>
                </div>
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ border: '1px solid var(--ds-gray-200)', background: 'var(--ds-gray-50)' }}>
                  <div className="h-3 w-3 rounded-full bg-sky-500" />
                  <div>
                    <p className="ds-body text-sm font-semibold" style={{ color: 'var(--ds-primary-900)' }}>Coastal flood exposure</p>
                    <p className="ds-caption" style={{ color: 'var(--ds-gray-500)' }}>NOAA coastal flood screening layer</p>
                  </div>
                </div>
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ border: '1px solid var(--ds-gray-200)', background: 'var(--ds-gray-50)' }}>
                  <div className="h-3 w-3 rounded-full bg-slate-900" />
                  <div>
                    <p className="ds-body text-sm font-semibold" style={{ color: 'var(--ds-primary-900)' }}>Tropical weather context</p>
                    <p className="ds-caption" style={{ color: 'var(--ds-gray-500)' }}>NHC Atlantic outlook inset</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {systemLayers.map((layer, index) => (
            <div
              key={layer.key}
              className="reveal bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              style={{ border: '1px solid var(--ds-gray-200)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <BrandIconBadge
                  icon={layer.icon}
                  tone={layer.key === 'official_alerts' ? 'warning' : layer.key === 'coastal_flood' ? 'accent' : 'primary'}
                />
                <h3 className="ds-section-title text-lg" style={{ color: 'var(--ds-primary-900)' }}>{layer.title}</h3>
              </div>
              <p className="ds-body text-sm" style={{ color: 'var(--ds-primary-800)' }}>{layer.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="ds-caption uppercase" style={{ color: 'var(--ds-gray-500)', letterSpacing: '0.14em' }}>
                  Layer {index + 1}
                </div>
                <div
                  className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{
                    background: visibleLayers[layer.key] ? 'var(--ds-primary-900)' : 'var(--ds-gray-50)',
                    color: visibleLayers[layer.key] ? 'var(--ds-white)' : 'var(--ds-gray-500)',
                  }}
                >
                  {visibleLayers[layer.key] ? 'Visible' : 'Hidden'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="reveal text-center">
          <p className="ds-caption" style={{ color: 'var(--ds-gray-500)' }}>
            These environmental layers are analyzed together to calculate the Disaster Shield Storm
            Risk Score.
          </p>
        </div>
      </div>
    </section>
  );
}
