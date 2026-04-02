import { CheckCircle, FileText, Clock, Shield } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const features = [
  {
    icon: CheckCircle,
    text: '4-Point Inspection',
  },
  {
    icon: Shield,
    text: 'Wind Mitigation Inspection',
  },
  {
    icon: FileText,
    text: 'Insurance Readiness Inspection',
  },
  {
    icon: Clock,
    text: 'Detailed Report Delivered in 24 Hours',
  },
];

export function InspectionAuthoritySection() {
  useScrollReveal();

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          <div className="reveal">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-5 sm:mb-6">
              Professional Inspections That Protect Your Home
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8">
              Disaster Shield inspections evaluate the critical systems that determine how your home performs during severe weather.
            </p>

            <div className="space-y-3 sm:space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-slate-900">
                      {feature.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="reveal grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl overflow-hidden bg-slate-100 border border-gray-200 aspect-square flex items-center justify-center shadow-sm">
              <div className="text-center text-slate-400">
                <div className="text-3xl sm:text-4xl mb-2">🏠</div>
                <p className="text-xs px-2 sm:px-4">Roof Inspection</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-100 border border-gray-200 aspect-square flex items-center justify-center mt-6 sm:mt-8 shadow-sm">
              <div className="text-center text-slate-400">
                <div className="text-3xl sm:text-4xl mb-2">⚡</div>
                <p className="text-xs px-2 sm:px-4">Electrical System</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-100 border border-gray-200 aspect-square flex items-center justify-center -mt-6 sm:-mt-8 shadow-sm">
              <div className="text-center text-slate-400">
                <div className="text-3xl sm:text-4xl mb-2">🔧</div>
                <p className="text-xs px-2 sm:px-4">Plumbing Check</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-100 border border-gray-200 aspect-square flex items-center justify-center shadow-sm">
              <div className="text-center text-slate-400">
                <div className="text-3xl sm:text-4xl mb-2">❄️</div>
                <p className="text-xs px-2 sm:px-4">HVAC System</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
