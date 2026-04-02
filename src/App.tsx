import { useState, useEffect } from 'react';
import { HeroSection } from './sections/HeroSection';
import { EducationVideoSection } from './sections/EducationVideoSection';
import { StormRealitySection } from './sections/StormRealitySection';
import { StormIntelligenceSystemSection } from './sections/StormIntelligenceSystemSection';
import { StormRiskFactorsSection } from './sections/StormRiskFactorsSection';
import { StormReadinessInspectionSection } from './sections/StormReadinessInspectionSection';
import { CheckMyHomeRiskSection } from './sections/CheckMyHomeRiskSection';
import { FooterSection } from './sections/FooterSection';
import { StormRiskModal } from './modals/StormRiskModal';
import { RiskReportPage } from './components/RiskReportPage';
import { getStormRiskReport, StormRiskReport } from './api/stormReports';

function App() {
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [reportData, setReportData] = useState<StormRiskReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [initialZipCode, setInitialZipCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get('reportId');

    if (reportId) {
      setLoadingReport(true);
      getStormRiskReport(reportId)
        .then((report) => {
          if (report) {
            setReportData(report);
          }
        })
        .catch((err) => {
          console.error('Failed to load report:', err);
        })
        .finally(() => {
          setLoadingReport(false);
        });
    }
  }, []);

  const handleCheckRisk = (zipCode?: string) => {
    if (zipCode && zipCode.length === 5) {
      setInitialZipCode(zipCode);
      setShowRiskModal(true);
    } else {
      setInitialZipCode(undefined);
      setShowRiskModal(true);
    }
  };

  const handleReportGenerated = (reportId: string) => {
    window.history.pushState({}, '', `?reportId=${reportId}`);
    getStormRiskReport(reportId)
      .then((report) => {
        if (report) {
          setReportData(report);
          setShowRiskModal(false);
          setTimeout(() => {
            const reportSection = document.getElementById('storm-report');
            if (reportSection) {
              reportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }, 100);
        }
      })
      .catch((err) => {
        console.error('Failed to load report:', err);
      });
  };

  if (loadingReport) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (reportData) {
    return (
      <div className="min-h-screen bg-white">
        <RiskReportPage report={reportData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroSection onCheckRisk={handleCheckRisk} />
      <EducationVideoSection />
      <StormRealitySection onCheckRisk={handleCheckRisk} />
      <StormIntelligenceSystemSection onCheckRisk={handleCheckRisk} />
      <StormRiskFactorsSection onCheckRisk={handleCheckRisk} />
      <StormReadinessInspectionSection onCheckRisk={handleCheckRisk} />
      <CheckMyHomeRiskSection onCheckRisk={handleCheckRisk} />
      <FooterSection />

      {showRiskModal && (
        <StormRiskModal
          onClose={() => {
            setShowRiskModal(false);
            setInitialZipCode(undefined);
          }}
          onReportGenerated={handleReportGenerated}
          initialZipCode={initialZipCode}
        />
      )}
    </div>
  );
}

export default App;
