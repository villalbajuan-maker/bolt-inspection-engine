import { Shield } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { CheckRiskCTA } from '../components/CheckRiskCTA';

interface PrimaryCTASectionProps {
  onCheckRisk: (zipCode?: string) => void;
}

export function PrimaryCTASection({ onCheckRisk }: PrimaryCTASectionProps) {
  useScrollReveal();

  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold mb-6">
              <Shield className="w-4 h-4" />
              Free Storm Intelligence Report
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Check My Home Risk
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Generate your Storm Intelligence Report
            </p>
          </div>

          <CheckRiskCTA onCheckRisk={onCheckRisk} variant="inline" />

          <p className="text-sm text-gray-500 mt-6">
            Enter your ZIP code to see your storm exposure analysis
          </p>
        </div>
      </div>
    </section>
  );
}
