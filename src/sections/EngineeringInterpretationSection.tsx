import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface EngineeringInterpretationSectionProps {
  riskLevel: string;
}

function getRiskInterpretation(riskLevel: string) {
  const upperLevel = riskLevel.toUpperCase();

  if (upperLevel === 'HIGH' || upperLevel === 'HIGH RISK') {
    return {
      icon: <AlertTriangle className="w-12 h-12" />,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      iconColor: 'text-red-600',
      title: 'High Storm Exposure Zone',
      interpretation: 'Properties in high storm exposure zones often experience increased structural stress from hurricane winds and storm surge. Regular professional inspection is critical to identify vulnerabilities in roofing systems, wind mitigation features, and structural integrity. Proactive maintenance and documentation can significantly reduce property damage and support insurance compliance.'
    };
  }

  if (upperLevel === 'MODERATE' || upperLevel === 'MODERATE RISK') {
    return {
      icon: <Shield className="w-12 h-12" />,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-900',
      iconColor: 'text-orange-600',
      title: 'Moderate Storm Exposure Zone',
      interpretation: 'Moderate storm exposure indicates periodic severe weather impact that may affect roofing systems and mitigation infrastructure. Properties in this zone benefit from regular inspection to verify wind mitigation features, assess roof condition, and ensure proper water drainage systems. Preventive assessment helps maintain structural resilience and insurance readiness.'
    };
  }

  return {
    icon: <CheckCircle className="w-12 h-12" />,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-900',
    iconColor: 'text-green-600',
    title: 'Lower Storm Exposure Zone',
    interpretation: 'Lower storm exposure regions still benefit from periodic inspection to maintain structural resilience. Even properties in reduced-risk zones should verify roof integrity, document wind mitigation features, and ensure proper maintenance protocols. Professional assessment provides peace of mind and supports long-term property protection and insurance compliance.'
  };
}

export function EngineeringInterpretationSection({ riskLevel }: EngineeringInterpretationSectionProps) {
  const interpretation = getRiskInterpretation(riskLevel);

  return (
    <section className="py-12 sm:py-16 bg-slate-50">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Engineering Interpretation
          </h2>
          <p className="text-slate-600">
            Professional interpretation of the reported area's storm exposure and what it suggests for inspection planning
          </p>
        </div>

        <div className={`${interpretation.bgColor} border-2 ${interpretation.borderColor} rounded-2xl p-8 sm:p-10`}>
          <div className="flex items-start gap-6 mb-6">
            <div className={`flex-shrink-0 ${interpretation.iconColor}`}>
              {interpretation.icon}
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${interpretation.textColor} mb-2`}>
                {interpretation.title}
              </h3>
              <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${interpretation.textColor} bg-white/60`}>
                Risk Level: {riskLevel}
              </div>
            </div>
          </div>

          <p className={`text-base leading-relaxed ${interpretation.textColor}`}>
            {interpretation.interpretation}
          </p>
        </div>
      </div>
    </section>
  );
}
