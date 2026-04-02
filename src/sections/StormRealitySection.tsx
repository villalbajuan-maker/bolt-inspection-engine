import { useScrollReveal } from '../hooks/useScrollReveal';
import { Waves, MapPin, Wind } from 'lucide-react';

interface StormRealitySectionProps {
  onCheckRisk: (zipCode?: string) => void;
}

export function StormRealitySection({ onCheckRisk: _onCheckRisk }: StormRealitySectionProps) {
  useScrollReveal();

  const panels = [
    {
      icon: Waves,
      title: 'Coastal Exposure',
      description:
        'Homes located closer to the coastline are often more exposed to storm surge, wind impact, and flooding during major weather events. Even small differences in distance from the ocean can significantly change storm vulnerability.',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop&q=80',
    },
    {
      icon: MapPin,
      title: 'Flood Zone Risk',
      description:
        'Flood zones identify areas where water intrusion is statistically more likely during severe weather. Properties within these zones often require additional preparation and structural resilience.',
      imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
    },
    {
      icon: Wind,
      title: 'Hurricane Path Patterns',
      description:
        'Historical hurricane paths reveal how storms repeatedly move across certain regions of Florida. These long-term patterns influence how storm risk accumulates in specific areas.',
      imageUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section id="storm-reality" className="py-20 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Storm Risk Isn't the Same Everywhere
          </h2>
          <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed">
            <p>
              Many homeowners assume that storm risk is the same across Florida.
            </p>
            <p>
              But storm exposure is shaped by several geographic factors — including coastal proximity,
              flood zones, wind exposure, and the historical paths hurricanes have taken across the state.
            </p>
            <p>
              When these layers combine, they create very different levels of storm exposure from one
              neighborhood to another.
            </p>
            <p className="font-semibold text-slate-900">
              Two homes only a few miles apart may face completely different levels of storm risk.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-16">
          {panels.map((panel, index) => (
            <div key={index} className="reveal group">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="relative h-64 sm:h-72 overflow-hidden">
                  <img
                    src={panel.imageUrl}
                    alt={panel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white mb-1">
                      <panel.icon className="w-5 h-5" />
                      <h3 className="text-xl font-bold">{panel.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed">{panel.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="reveal max-w-2xl mx-auto text-center">
          <p className="text-base text-gray-600 leading-relaxed">
            Understanding these geographic factors is the first step in evaluating the real storm
            exposure of your home.
          </p>
        </div>
      </div>
    </section>
  );
}
