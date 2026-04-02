import { ClipboardCheck, Shield, FileText, Camera } from 'lucide-react';

export function ProfessionalRecommendationSection() {
  const benefits = [
    {
      icon: <ClipboardCheck className="w-5 h-5" />,
      text: 'Comprehensive roof and structural assessment'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: 'Wind mitigation feature verification'
    },
    {
      icon: <FileText className="w-5 h-5" />,
      text: 'Insurance documentation compliance'
    },
    {
      icon: <Camera className="w-5 h-5" />,
      text: 'Complete photo documentation package'
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 sm:p-10 shadow-2xl border border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-white/10 rounded-full mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Professional Recommendation
            </h2>
            <div className="w-16 h-1 bg-white/30 mx-auto mb-6"></div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 mb-6">
            <p className="text-lg text-white leading-relaxed">
              A professional Storm Readiness Inspection helps identify roof vulnerabilities,
              wind mitigation gaps and insurance documentation issues before the next storm season.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4"
              >
                <div className="text-white/80 flex-shrink-0">
                  {benefit.icon}
                </div>
                <span className="text-sm text-white/90">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-sm text-white/70">
              Certified inspectors available throughout Florida
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
