import { useEffect, useState } from 'react';
import { Calendar, MessageSquare } from 'lucide-react';
import { StormRiskReport } from '../api/stormReports';
import { StormEvidenceSnapshot } from '../api/stormEvidence';
import { getStormRiskFromSupabase } from '../api/riskData';
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
import { BrandIconBadge } from './BrandIconBadge';

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
  const [referenceSnapshot, setReferenceSnapshot] = useState<{
    lat?: number;
    lon?: number;
    risk_components?: {
      distance_to_coast?: number;
    };
  } | null>(null);
  const [bookingPrefill, setBookingPrefill] = useState<{
    address?: string;
    city?: string;
    zipCode?: string;
    inspectionType?: string;
    rationaleSummary?: string;
  }>({});

  useScrollReveal();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadReferenceSnapshot() {
      const data = await getStormRiskFromSupabase(report.zip_code);
      if (!isMounted || !data) return;

      setReferenceSnapshot({
        lat: data.lat,
        lon: data.lon,
        risk_components: {
          distance_to_coast: data.risk_components?.distance_to_coast,
        },
      });
    }

    loadReferenceSnapshot();

    return () => {
      isMounted = false;
    };
  }, [report.zip_code]);

  const riskVideo = getRiskVideo(report.storm_score);
  const technicalSnapshotLat = referenceSnapshot?.lat ?? report.lat;
  const technicalSnapshotLon = referenceSnapshot?.lon ?? report.lon;
  const distanceToCoastScore = referenceSnapshot?.risk_components?.distance_to_coast;

  const riskComponents = {
    hurricane_risk: report.hurricane_score,
    flood_risk: report.flood_score,
    coastal_exposure: report.coastal_score,
    distance_to_coast: distanceToCoastScore,
    fema_flood_zone: report.flood_score,
    hurricane_corridor: report.hurricane_score
  };
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

  return (
    <>
      <div id="storm-report" className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <HeroHeaderSection
          stormScore={report.storm_score}
          riskLevel={report.risk_level}
        />

        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/85">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 shadow-sm sm:h-14 sm:w-14"
                style={{
                  background: 'linear-gradient(180deg, var(--ds-primary-900) 0%, var(--ds-primary-800) 100%)',
                }}
              >
                <img
                  src="/disaster-logo.png"
                  alt="Disaster Shield"
                  className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Report Companion
                </div>
                <h2 className="text-sm font-bold leading-tight text-slate-900 sm:text-lg">
                  Explore your report with an interactive companion
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCompanionOpen(true)}
              className="ds-btn-primary inline-flex min-h-[48px] w-full flex-shrink-0 items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold sm:w-auto sm:px-6"
            >
              <MessageSquare className="h-5 w-5" />
              Open Report Companion
            </button>
          </div>
        </header>

        <section className="py-12 sm:py-16 bg-slate-50">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Video Explanation
              </h2>
              <p className="text-slate-600">
                Understanding what this risk level means for the reported area and for inspection planning
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
                  Professional explanation of what this reported exposure level means and why a property-level storm readiness inspection can add the missing structural context.
                </p>
              </div>
            </div>
          </div>
        </section>

        <TechnicalSnapshotSection
          zipCode={report.zip_code}
          lat={technicalSnapshotLat}
          lon={technicalSnapshotLon}
          distanceToCoastScore={distanceToCoastScore}
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
            <div className="rounded-2xl p-7 text-center shadow-2xl sm:p-12" style={{ background: 'linear-gradient(180deg, var(--ds-primary-900) 0%, var(--ds-primary-800) 100%)', color: 'var(--ds-white)' }}>
              <h2 className="mb-4 text-2xl font-bold sm:text-4xl">
                Schedule Your Storm Readiness Inspection
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: 'rgba(255,255,255,0.78)' }}>
                Certified inspectors available throughout Florida. Most inspections completed in 45-60 minutes with comprehensive documentation provided.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="ds-btn-primary inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-base font-bold active:scale-[0.99] sm:w-auto sm:px-10 sm:py-5 sm:text-lg"
              >
                <BrandIconBadge icon={Calendar} size="sm" tone="accent" className="!h-9 !w-9 !rounded-full" />
                Schedule Your Inspection
              </button>
              <p className="text-sm mt-6" style={{ color: 'rgba(255,255,255,0.62)' }}>
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
            rationaleSummary: payload.rationaleSummary,
          });
          setIsModalOpen(true);
        }}
      />
    </>
  );
}
