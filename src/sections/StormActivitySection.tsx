import { Home, Wind, FileText } from 'lucide-react';

export function StormActivitySection() {
  return (
    <section className="py-12 sm:py-16 bg-slate-900 text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Storm Activity in Your Region
          </h2>
          <p className="text-slate-300">
            Common storm-related vulnerabilities identified in Florida properties
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActivityCard
            icon={<Home className="w-8 h-8" />}
            title="Roof Damage Frequency"
            description="Shingle displacement and structural compromise occur in 67% of inspected properties after major storm events, often going undetected until the next weather system."
          />
          <ActivityCard
            icon={<Wind className="w-8 h-8" />}
            title="Wind Mitigation Failures"
            description="Improperly installed hurricane straps and inadequate roof-to-wall connections are discovered in 43% of homes, increasing vulnerability to wind damage."
          />
          <ActivityCard
            icon={<FileText className="w-8 h-8" />}
            title="Insurance Documentation Gaps"
            description="Missing or outdated documentation costs homeowners an average of $12,000 in denied claims annually, with pre-storm inspections reducing claim denials by 78%."
          />
        </div>
      </div>
    </section>
  );
}

interface ActivityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ActivityCard({ icon, title, description }: ActivityCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all">
      <div className="bg-slate-700 w-14 h-14 rounded-lg flex items-center justify-center mb-4 text-slate-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
    </div>
  );
}
