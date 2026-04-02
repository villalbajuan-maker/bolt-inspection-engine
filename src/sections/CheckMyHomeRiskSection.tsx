import { useScrollReveal } from '../hooks/useScrollReveal';
import { Check } from 'lucide-react';
import { CheckRiskCTA } from '../components/CheckRiskCTA';

interface CheckMyHomeRiskSectionProps {
  onCheckRisk: (zipCode?: string) => void;
}

export function CheckMyHomeRiskSection({ onCheckRisk }: CheckMyHomeRiskSectionProps) {
  useScrollReveal();

  const trustIndicators = [
    'Storm Risk Score',
    'Historical Storm Evidence',
    'Structural Inspection Guidance',
  ];

  return (
    <section id="check-risk" className="py-28 sm:py-32 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="text-center reveal">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Check Your Home Storm Risk
          </h2>

          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-[640px] mx-auto mb-12">
            In less than 30 seconds you can generate a Storm Intelligence Report for your property
            and understand the real storm exposure of your area.
          </p>

          <div className="mb-8">
            <CheckRiskCTA onCheckRisk={onCheckRisk} variant="stacked" />
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-4">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{indicator}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500">
            No signup required. Instant storm intelligence report.
          </p>
        </div>
      </div>
    </section>
  );
}
