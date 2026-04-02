import { useScrollReveal } from '../hooks/useScrollReveal';
import { Shield, Wind, Droplet, FileText } from 'lucide-react';

interface StormReadinessInspectionSectionProps {
  onCheckRisk: (zipCode?: string) => void;
}

export function StormReadinessInspectionSection({ onCheckRisk: _onCheckRisk }: StormReadinessInspectionSectionProps) {
  useScrollReveal();

  const inspectionBlocks = [
    {
      icon: Shield,
      title: 'Roof Structural Integrity',
      description:
        'Inspection of roof condition, fastening systems, and visible vulnerabilities that strong winds can exploit.',
    },
    {
      icon: Wind,
      title: 'Wind Mitigation Verification',
      description:
        'Evaluation of structural elements that reduce wind damage, including roof-to-wall connections and secondary water barriers.',
    },
    {
      icon: Droplet,
      title: 'Water Intrusion Risk',
      description:
        'Identification of areas where storm water can penetrate the structure during heavy rainfall events.',
    },
    {
      icon: FileText,
      title: 'Insurance Readiness Documentation',
      description:
        'Documentation that may support insurance compliance, underwriting reviews, or future claims if storm damage occurs.',
    },
  ];


  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            What a Storm Readiness Inspection Actually Checks
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            A storm readiness inspection is designed to identify structural vulnerabilities that
            storms commonly expose in Florida homes.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mt-4">
            These inspections focus on the areas most affected by wind, water intrusion, and
            insurance documentation requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          <div className="reveal order-2 lg:order-1">
            <img
              src="/storm-readiness-inspection.png"
              alt="Professional storm readiness home inspection in Florida"
              className="w-full max-w-[720px] mx-auto rounded-[14px] shadow-[0_20px_40px_rgba(0,0,0,0.12)] object-cover"
              style={{ imageRendering: 'auto' }}
            />
          </div>

          <div className="reveal order-1 lg:order-2 space-y-6">
            {inspectionBlocks.map((block, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <block.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{block.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{block.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-16 reveal">
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Why this matters</h3>
            <p className="text-gray-700 leading-relaxed">
              Storm inspections often identify small vulnerabilities before they become major damage
              during hurricane season.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
