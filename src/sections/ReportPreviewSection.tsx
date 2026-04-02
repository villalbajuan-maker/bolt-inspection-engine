import { FileText, Layers, MapPin, Home } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export function ReportPreviewSection() {
  useScrollReveal();

  const reportFeatures = [
    { icon: FileText, label: 'Storm Risk Score' },
    { icon: Layers, label: 'Environmental risk layers' },
    { icon: MapPin, label: 'Regional storm evidence' },
    { icon: Home, label: 'Structural vulnerability indicators' },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Your Storm Risk Report in Less Than 60 Seconds
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Generate a comprehensive storm intelligence report that reveals the environmental
            factors affecting your property.
          </p>
        </div>

        <div className="reveal bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-10 border border-slate-700 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-3 mb-6">
              <p className="text-white/90 text-sm font-semibold">Storm Intelligence Report</p>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Comprehensive Risk Analysis
            </h3>
            <p className="text-white/70 text-sm">
              Your report provides
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {reportFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-900" />
                  </div>
                  <p className="text-white font-medium">{feature.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
