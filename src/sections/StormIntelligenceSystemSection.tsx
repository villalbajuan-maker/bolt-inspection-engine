import { useScrollReveal } from '../hooks/useScrollReveal';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Wind, Droplets, Waves } from 'lucide-react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface StormIntelligenceSystemSectionProps {
  onCheckRisk: (zipCode?: string) => void;
}

export function StormIntelligenceSystemSection({ onCheckRisk: _onCheckRisk }: StormIntelligenceSystemSectionProps) {
  useScrollReveal();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initializeMap = () => {
      if (!mapContainer.current) return;

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-81.5, 28.5],
          zoom: 6.2,
          interactive: false,
        });

        const analysisNodes = [
          { lng: -80.19, lat: 25.76, label: 'Miami' },
          { lng: -81.65, lat: 30.33, label: 'Jacksonville' },
          { lng: -82.46, lat: 27.95, label: 'Tampa' },
          { lng: -81.38, lat: 28.54, label: 'Orlando' },
          { lng: -87.22, lat: 30.42, label: 'Pensacola' },
        ];

        map.current.on('load', () => {
          analysisNodes.forEach((node) => {
            const el = document.createElement('div');
            el.className = 'storm-analysis-marker';
            el.style.width = '16px';
            el.style.height = '16px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = '#1e293b';
            el.style.border = '3px solid #fff';
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            el.style.animation = 'pulse-marker 2s infinite';

            new mapboxgl.Marker(el)
              .setLngLat([node.lng, node.lat])
              .addTo(map.current!);
          });
        });

        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse-marker {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.3);
              opacity: 0.7;
            }
          }
        `;
        document.head.appendChild(style);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    const timer = setTimeout(initializeMap, 100);

    return () => {
      clearTimeout(timer);
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const systemLayers = [
    {
      icon: Wind,
      title: 'Wind Exposure Patterns',
      description:
        'Storm systems moving across the Gulf and Atlantic create different wind exposure conditions across Florida. Our system analyzes historical hurricane paths to estimate wind impact probability.',
    },
    {
      icon: Droplets,
      title: 'Flood Risk Zones',
      description:
        'Flood risk varies significantly across Florida depending on elevation, drainage systems, and FEMA flood zone classifications. These factors influence storm surge and rainfall flooding potential.',
    },
    {
      icon: Waves,
      title: 'Coastal Impact',
      description:
        'Distance from the coastline plays a major role in storm vulnerability. Coastal regions experience stronger wind fields, storm surge exposure, and higher insurance claim frequency.',
    },
  ];

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12 reveal">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Storm Intelligence System
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Disaster Shield analyzes multiple environmental and geographic data layers to evaluate
            storm exposure across Florida.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12 reveal">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <p className="text-gray-700 leading-relaxed mb-4">
              Storm damage risk is influenced by multiple environmental conditions. Disaster Shield
              evaluates these factors together to understand how storm exposure varies across Florida.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our system analyzes wind exposure, flood zones, coastal proximity, and historical
              hurricane paths to generate the Storm Risk Score used in Disaster Shield reports.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-16 reveal">
          <div
            ref={mapContainer}
            className="w-full h-96 rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {systemLayers.map((layer, index) => (
            <div
              key={index}
              className="reveal bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <layer.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{layer.title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{layer.description}</p>
            </div>
          ))}
        </div>

        <div className="reveal text-center">
          <p className="text-sm text-gray-500">
            These environmental layers are analyzed together to calculate the Disaster Shield Storm
            Risk Score.
          </p>
        </div>
      </div>
    </section>
  );
}
