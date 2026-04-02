import { Wind, Shield, AlertTriangle } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const educationCards = [
  {
    icon: Wind,
    title: 'Wind Risk',
    content: 'Roof attachments, structural connectors, and uplift vulnerability determine how your home performs in high winds. Minor weaknesses can lead to catastrophic failure.',
  },
  {
    icon: Shield,
    title: 'Insurance Readiness',
    content: '4-point inspections are increasingly required for policy renewals. Stay ahead of compliance requirements and potentially reduce premiums with proper documentation.',
  },
  {
    icon: AlertTriangle,
    title: 'Hidden System Failures',
    content: 'Electrical, plumbing, and HVAC failures are commonly discovered during inspections. Identifying these issues early prevents expensive emergency repairs during storm season.',
  },
];

export function RiskEducationSection() {
  useScrollReveal();

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-4">
            What We Evaluate
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Professional inspections reveal the critical factors that determine your home's storm readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {educationCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="reveal bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 rounded-xl flex items-center justify-center mb-5 sm:mb-6">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 sm:mb-4">
                  {card.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {card.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
