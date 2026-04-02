import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Shield } from 'lucide-react';

interface GeographicRiskMapProps {
  lat: number;
  lon: number;
  zipCode: string;
  riskLevel: string;
}

function createCircle(center: [number, number], radiusInKm: number, points: number = 64) {
  const coords = [];
  const distanceX = radiusInKm / (111.320 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]);

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords]
    },
    properties: {}
  };
}

export function GeographicRiskMapSection({ lat, lon, zipCode, riskLevel }: GeographicRiskMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken || mapboxToken.includes('Dummy')) {
      console.warn('Mapbox token not configured');
      return;
    }

    if (!map.current) {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [lon, lat],
        zoom: 11,
        attributionControl: false
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.cssText = `
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 50%;
        border: 3px solid #1e293b;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
      `;
      markerEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      `;

      marker.current = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([lon, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div style="padding: 8px;"><strong>ZIP ${zipCode}</strong><br/>Risk Level: ${riskLevel}</div>`)
        )
        .addTo(map.current);

      map.current.on('load', () => {
        if (!map.current) return;

        const riskColor = riskLevel.toUpperCase() === 'HIGH' ? '#ef4444' :
                          riskLevel.toUpperCase() === 'MODERATE' ? '#f97316' : '#eab308';

        map.current.addSource('hurricane-corridor', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [-87.5, 24.0],
                    [-87.5, 31.0],
                    [-80.0, 31.0],
                    [-80.0, 24.0],
                    [-87.5, 24.0]
                  ]]
                },
                properties: {}
              }
            ]
          }
        });

        map.current.addLayer({
          id: 'hurricane-corridor-layer',
          type: 'fill',
          source: 'hurricane-corridor',
          paint: {
            'fill-color': '#9333ea',
            'fill-opacity': 0.15
          }
        });

        map.current.addSource('flood-risk-zone', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [-87.6, 24.5],
                    [-87.6, 30.9],
                    [-79.8, 30.9],
                    [-79.8, 24.5],
                    [-87.6, 24.5]
                  ]]
                },
                properties: {}
              }
            ]
          }
        });

        map.current.addLayer({
          id: 'flood-risk-layer',
          type: 'fill',
          source: 'flood-risk-zone',
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.12
          }
        });

        const riskRadiusCircle = createCircle([lon, lat], 8);

        map.current.addSource('risk-radius', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [riskRadiusCircle]
          }
        });

        map.current.addLayer({
          id: 'risk-radius-layer',
          type: 'fill',
          source: 'risk-radius',
          paint: {
            'fill-color': riskColor,
            'fill-opacity': 0.25
          }
        });

        map.current.addLayer({
          id: 'risk-radius-border',
          type: 'line',
          source: 'risk-radius',
          paint: {
            'line-color': riskColor,
            'line-width': 2,
            'line-opacity': 0.6
          }
        });

        setMapLoaded(true);
      });
    } else {
      console.log("Map coordinates:", lat, lon);

      map.current.flyTo({
        center: [lon, lat],
        zoom: 11,
        essential: true
      });

      const riskColor = riskLevel.toUpperCase() === 'HIGH' ? '#ef4444' :
                        riskLevel.toUpperCase() === 'MODERATE' ? '#f97316' : '#eab308';

      if (marker.current) {
        marker.current.setLngLat([lon, lat]);
        marker.current.setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div style="padding: 8px;"><strong>ZIP ${zipCode}</strong><br/>Risk Level: ${riskLevel}</div>`)
        );
      }

      const riskRadiusCircle = createCircle([lon, lat], 8);
      const riskRadiusSource = map.current.getSource('risk-radius') as mapboxgl.GeoJSONSource;
      if (riskRadiusSource) {
        riskRadiusSource.setData({
          type: 'FeatureCollection',
          features: [riskRadiusCircle]
        });
      }

      if (map.current.getLayer('risk-radius-layer')) {
        map.current.setPaintProperty('risk-radius-layer', 'fill-color', riskColor);
      }

      if (map.current.getLayer('risk-radius-border')) {
        map.current.setPaintProperty('risk-radius-border', 'line-color', riskColor);
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, [lat, lon, zipCode, riskLevel]);

  return (
    <section className="py-12 sm:py-16 bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Geographic Risk Analysis
          </h2>
          <p className="text-slate-600 max-w-3xl">
            Satellite imagery showing your property's location and storm exposure radius
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div
            ref={mapContainer}
            className="w-full h-[400px] sm:h-[500px] bg-slate-100"
            style={{ opacity: mapLoaded ? 1 : 0.5, transition: 'opacity 0.5s' }}
          />

          <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-700" />
              Storm Intelligence Map
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
              This map shows how your property location relates to hurricane exposure, flood risk areas, and historical storm corridors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ background: riskLevel.toUpperCase() === 'HIGH' ? '#ef4444' : riskLevel.toUpperCase() === 'MODERATE' ? '#f97316' : '#eab308', opacity: 0.6 }}></div>
                <span className="text-slate-600">8km Risk Radius</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ background: '#9333ea', opacity: 0.6 }}></div>
                <span className="text-slate-600">Hurricane Corridor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ background: '#3b82f6', opacity: 0.6 }}></div>
                <span className="text-slate-600">Flood Risk Zone</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
