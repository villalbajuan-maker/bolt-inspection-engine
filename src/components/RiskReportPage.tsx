import { useEffect, useState } from 'react';
import { Calendar, MessageSquare } from 'lucide-react';
import { StormRiskReport } from '../api/stormReports';
import { StormEvidenceSnapshot } from '../api/stormEvidence';
import { BookingModal } from './BookingModal';
import { CompanionModal } from '../companion';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { HeroHeaderSection } from '../sections/HeroHeaderSection';
import { TechnicalSnapshotSection } from '../sections/TechnicalSnapshotSection';
import { ScientificRiskBreakdownSection } from '../sections/ScientificRiskBreakdownSection';
import { StormEvidenceSection } from '../sections/StormEvidenceSection';
import { StructuralVulnerabilitySection } from '../sections/StructuralVulnerabilitySection';
import { EngineeringInterpretationSection } from '../sections/EngineeringInterpretationSection';
import { ProfessionalRecommendationSection } from '../sections/ProfessionalRecommendationSection';

interface RiskReportPageProps {
  report: StormRiskReport & {
    lat?: number;
    lon?: number;
    evidence_snapshot?: StormEvidenceSnapshot;
  };
}

function getRiskVideo(stormScore: number): string {
  if (stormScore >= 80) {
    return "/storm-risk-high.mp4";
  } else if (stormScore >= 55) {
    return "/storm-risk-moderate.mp4";
  } else {
    return "/storm-risk-low.mp4";
  }
}

export function RiskReportPage({ report }: RiskReportPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<{
    address?: string;
    city?: string;
    zipCode?: string;
    inspectionType?: string;
  }>({});

  useScrollReveal();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const riskVideo = getRiskVideo(report.storm_score);

  const riskComponents = {
    hurricane_risk: report.hurricane_score,
    flood_risk: report.flood_score,
    coastal_exposure: report.coastal_score,
    distance_to_coast: Math.min(5, Math.round((report.coastal_score + report.hurricane_score) / 2)),
    fema_flood_zone: report.flood_score,
    hurricane_corridor: report.hurricane_score
  };

  const lat = report.lat || 27.9506;
  const lon = report.lon || -82.4572;
  const reportContext = {
    reportId: report.id,
    zipCode: report.zip_code,
    city: report.city,
    county: report.evidence_snapshot?.countyLabel,
    state: 'Florida',
    stormScore: report.storm_score,
    riskLevel: report.risk_level,
    hurricaneScore: report.hurricane_score,
    floodScore: report.flood_score,
    coastalScore: report.coastal_score,
    lat: report.lat,
    lon: report.lon,
    evidenceSnapshot: report.evidence_snapshot,
  };

  console.log("Report coordinates - ZIP:", report.zip_code, "Lat:", report.lat, "Lon:", report.lon);
  console.log("Using coordinates - Lat:", lat, "Lon:", lon);

  return (
    <>
      <div id="storm-report" className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <HeroHeaderSection
          stormScore={report.storm_score}
          riskLevel={report.risk_level}
        />

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1000px] flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                New Companion Experience
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                Explore your report with an interactive companion
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Open the Companion to preview the new guided experience that will help interpret this report, personalize it to the property, and guide the next action.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCompanionOpen(true)}
              className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl sm:text-base"
            >
              <MessageSquare className="h-5 w-5" />
              Open Report Companion
            </button>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-slate-50">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Video Explanation
              </h2>
              <p className="text-slate-600">
                Understanding what your risk level means for your property
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
              <div className="aspect-video w-full">
                <video
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                >
                  <source src={riskVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="p-6 bg-slate-50">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Professional explanation of what your risk level means and the importance of proactive storm readiness inspection for Florida properties.
                </p>
              </div>
            </div>
          </div>
        </section>

        <TechnicalSnapshotSection
          zipCode={report.zip_code}
          lat={lat}
          lon={lon}
          coastalScore={report.coastal_score}
          floodScore={report.flood_score}
        />

        <ScientificRiskBreakdownSection
          riskComponents={riskComponents}
          stormRiskScore={report.storm_score}
        />

        <StormEvidenceSection
          city={report.city}
          zipCode={report.zip_code}
          stormScore={report.storm_score}
          hurricaneScore={report.hurricane_score}
          floodScore={report.flood_score}
          coastalScore={report.coastal_score}
          lat={report.lat}
          lon={report.lon}
          evidenceSnapshot={report.evidence_snapshot}
        />

        <StructuralVulnerabilitySection />

        <EngineeringInterpretationSection riskLevel={report.risk_level} />

        <ProfessionalRecommendationSection />

        <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
            <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 text-center shadow-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Schedule Your Storm Readiness Inspection
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-slate-300">
                Certified inspectors available throughout Florida. Most inspections completed in 45-60 minutes with comprehensive documentation provided.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-10 py-5 min-h-[56px] rounded-xl text-lg font-bold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                <Calendar className="w-6 h-6" />
                Schedule Your Inspection
              </button>
              <p className="text-sm mt-6 text-slate-400">
                Professional. Comprehensive. Insurance-compliant.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 bg-slate-50">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
            <div className="text-center text-xs text-slate-500 max-w-3xl mx-auto leading-relaxed">
              <p className="mb-3">
                <strong>Professional Disclaimer:</strong> This storm risk assessment represents a location-based analysis of environmental and historical factors.
                Actual property vulnerability depends on construction quality, maintenance history, and specific structural conditions.
              </p>
              <p>
                A certified inspection is required to evaluate individual property conditions and wind mitigation features.
                This report does not constitute a home inspection, structural engineering analysis, or insurance underwriting decision.
              </p>
            </div>
          </div>
        </section>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reportData={report}
        initialFormData={bookingPrefill}
      />

      <CompanionModal
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
        reportContext={reportContext}
        onOpenBooking={(payload) => {
          setBookingPrefill({
            address: payload.address,
            city: payload.city,
            zipCode: payload.zipCode,
            inspectionType: payload.inspectionType,
          });
          setIsModalOpen(true);
        }}
      />
    </>
  );
}
