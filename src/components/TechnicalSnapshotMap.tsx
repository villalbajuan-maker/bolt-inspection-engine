import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface TechnicalSnapshotMapProps {
  lat?: number;
  lon?: number;
  zipCode: string;
}

export function TechnicalSnapshotMap({ lat, lon, zipCode }: TechnicalSnapshotMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || typeof lat !== 'number' || typeof lon !== 'number') return;

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
        zoom: 10,
        attributionControl: false
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.cssText = `
        width: 36px;
        height: 36px;
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
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      `;

      marker.current = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([lon, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div style="padding: 8px;"><strong>ZIP ${zipCode} reference point</strong></div>`)
        )
        .addTo(map.current);

      map.current.on('load', () => {
        setMapLoaded(true);
      });
    } else {
      map.current.flyTo({
        center: [lon, lat],
        zoom: 10,
        essential: true
      });

      if (marker.current) {
        marker.current.setLngLat([lon, lat]);
        marker.current.setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div style="padding: 8px;"><strong>ZIP ${zipCode} reference point</strong></div>`)
        );
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, [lat, lon, zipCode]);

  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl bg-slate-100 p-6 text-center">
        <div className="max-w-xs">
          <div className="text-sm font-semibold text-slate-900">ZIP reference point unavailable</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            We could not load ZIP-level reference coordinates for this report, so the technical map is hidden instead of showing a misleading fallback.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[400px] bg-slate-100 rounded-xl"
      style={{ opacity: mapLoaded ? 1 : 0.5, transition: 'opacity 0.5s' }}
    />
  );
}
