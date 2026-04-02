import { Wind, Droplets, Anchor, CloudRain } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export function HiddenRiskLayersSection() {
  useScrollReveal();

  const layers = [
    {
      icon: Wind,
      title: 'Wind Exposure',
      description: 'Sustained wind patterns and gust potential based on terrain and coastal proximity',
    },
    {
      icon: Droplets,
      title: 'Flood Zones',
      description: 'FEMA-designated flood zones and elevation-based inundation risk mapping',
    },
    {
      icon: Anchor,
      title: 'Coastal Proximity',
      description: 'Distance from coastline and exposure to storm surge amplification zones',
    },
    {
      icon: CloudRain,
      title: 'Hurricane Track History',
      description: 'Historical hurricane corridors and frequency of direct impacts over decades',
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            The Data Behind Storm Exposure
          </h2>
        </div>

        <div className="reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <div
                key={index}
                className="bg-slate-50 border border-gray-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  {layer.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {layer.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
