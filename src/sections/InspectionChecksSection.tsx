import { Home, Shield, Link2, FileCheck, Search } from 'lucide-react';

export function InspectionChecksSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Storm Readiness Inspection Protocol
          </h2>
          <p className="text-slate-600">
            Comprehensive assessment performed by certified inspectors to evaluate your property's storm resilience
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InspectionCheckCard
            icon={<Home className="w-7 h-7" />}
            title="Roof Structural Integrity"
            description="Detailed examination of shingle condition, flashing, underlayment, and deck stability to identify potential failure points."
          />
          <InspectionCheckCard
            icon={<Shield className="w-7 h-7" />}
            title="Wind Mitigation Verification"
            description="Assessment of hurricane straps, roof-to-wall connections, and wind-resistant features required for insurance discounts."
          />
          <InspectionCheckCard
            icon={<Link2 className="w-7 h-7" />}
            title="Attachment Points"
            description="Inspection of critical connection points including roof trusses, wall ties, and foundation anchoring systems."
          />
          <InspectionCheckCard
            icon={<FileCheck className="w-7 h-7" />}
            title="Insurance Documentation Review"
            description="Verification that all required documentation is current, accurate, and sufficient for claim substantiation."
          />
          <InspectionCheckCard
            icon={<Search className="w-7 h-7" />}
            title="Exterior Vulnerability Scan"
            description="Comprehensive evaluation of windows, doors, siding, and drainage systems for storm-related weaknesses."
          />
          <InspectionCheckCard
            icon={<Shield className="w-7 h-7" />}
            title="Compliance Certification"
            description="Official documentation confirming adherence to Florida Building Code and local wind mitigation requirements."
          />
        </div>

        <div className="mt-10 bg-slate-50 rounded-xl p-6 sm:p-8 border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Professional Certification</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                All inspections are conducted by state-licensed inspectors with specialized training in hurricane preparedness,
                structural engineering, and insurance compliance. Reports are accepted by major insurance carriers and meet
                all Florida Department of Financial Services requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface InspectionCheckCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function InspectionCheckCard({ icon, title, description }: InspectionCheckCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
      <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-slate-700">
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
