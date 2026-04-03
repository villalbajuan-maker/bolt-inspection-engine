import { useScrollReveal } from '../hooks/useScrollReveal';
import { Check } from 'lucide-react';
import { CheckRiskCTA } from '../components/CheckRiskCTA';
import { BrandIconBadge } from '../components/BrandIconBadge';

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
    <section id="check-risk" className="py-28 sm:py-32" style={{ background: 'linear-gradient(to bottom, var(--ds-gray-50), var(--ds-white))' }}>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="text-center reveal">
          <div className="ds-kicker mb-4" style={{ color: 'var(--ds-gray-500)' }}>
            Instant storm report
          </div>
          <h2 className="ds-display-title text-4xl sm:text-5xl lg:text-6xl mb-6" style={{ color: 'var(--ds-primary-900)' }}>
            Check Your Home Storm Risk
          </h2>

          <p className="ds-lead text-lg sm:text-xl max-w-[640px] mx-auto mb-12" style={{ color: 'var(--ds-primary-800)' }}>
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
                  <BrandIconBadge icon={Check} size="sm" tone="success" />
                  <span className="ds-body text-sm font-semibold" style={{ color: 'var(--ds-primary-800)' }}>{indicator}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="ds-caption" style={{ color: 'var(--ds-gray-500)' }}>
            No signup required. Instant storm intelligence report.
          </p>
        </div>
      </div>
    </section>
  );
}
