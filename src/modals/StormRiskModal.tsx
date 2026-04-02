import { useState, useEffect } from 'react';
import { X, AlertTriangle, TrendingUp, MapPin, Loader2, ShieldAlert } from 'lucide-react';
import { trackEvent } from '../api/analytics';
import { LeadCaptureForm } from '../components/LeadCaptureForm';
import { saveStormRiskReport } from '../api/stormReports';
import { supabase } from '../lib/supabaseClient';
import { getCityFromCoordinates, getLocationContextFromCoordinates } from '../api/riskData';
import { buildStormEvidenceSnapshot } from '../api/stormEvidence';

interface StormRiskModalProps {
  onClose: () => void;
  onReportGenerated?: (reportId: string) => void;
  initialZipCode?: string;
}

function getRiskColor(score: number): string {
  if (score >= 85) return 'bg-red-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-green-500';
}

function getRiskBadgeColor(level: string): string {
  const upperLevel = level.toUpperCase();
  if (upperLevel === 'HIGH' || upperLevel === 'HIGH RISK') return 'bg-red-500';
  if (upperLevel === 'MODERATE' || upperLevel === 'MODERATE RISK') return 'bg-orange-500';
  return 'bg-green-500';
}

interface RiskBarProps {
  label: string;
  score: number;
}

function RiskBar({ label, score }: RiskBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-slate-700 font-medium">{label}</span>
        <span className="text-slate-900 font-bold">{score}/100</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getRiskColor(score)} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function StormRiskModal({ onClose, onReportGenerated, initialZipCode }: StormRiskModalProps) {
  const [step, setStep] = useState<'input' | 'results' | 'leadCapture'>('input');
  const [zipCode, setZipCode] = useState(initialZipCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [riskData, setRiskData] = useState<{
    zip_code: string;
    storm_risk_score: number;
    risk_level: string;
    hero_image: string;
    video: string;
    risk_components: {
      hurricane_risk: number;
      flood_risk: number;
      coastal_exposure: number;
      distance_to_coast: number;
      fema_flood_zone: number;
      hurricane_corridor: number;
    };
    inspection_recommendation: string;
    lat?: number;
    lon?: number;
  } | null>(null);

  useEffect(() => {
    if (initialZipCode && initialZipCode.length === 5) {
      handleAnalyze();
    }
  }, []);

  const handleAnalyze = async () => {
    if (zipCode.length !== 5 || !/^\d+$/.test(zipCode)) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_storm_report', {
        input_zip: zipCode
      });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        setError('An error occurred. Please try again.');
        setLoading(false);
        return;
      }

      if (!data || data.error) {
        setError('This ZIP code is outside our current risk dataset. We are expanding coverage across Florida.');
        setLoading(false);
        return;
      }

      setRiskData(data);
      setStep('results');
      await trackEvent('risk_checked', zipCode, false);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Risk calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullReport = () => {
    setStep('leadCapture');
  };

  const handleLeadSubmit = async (leadData: { name: string; email: string; phone?: string }) => {
    if (!riskData) return;

    setLoading(true);
    try {
      let city: string | undefined;
      let evidenceSnapshot;

      if (riskData.lat && riskData.lon) {
        const fetchedCity = await getCityFromCoordinates(riskData.lat, riskData.lon);
        city = fetchedCity || undefined;
        console.log("Fetched city:", city);

        const locationContext = await getLocationContextFromCoordinates(
          riskData.lat,
          riskData.lon,
          riskData.zip_code
        );

        evidenceSnapshot = await buildStormEvidenceSnapshot({
          city: locationContext?.city || city,
          county: locationContext?.county,
          state: locationContext?.state,
          locationLabel:
            locationContext?.displayLabel ||
            (city ? `${city}, Florida` : `ZIP ${riskData.zip_code}`),
          zipCode: riskData.zip_code,
          stormScore: riskData.storm_risk_score,
          hurricaneScore: riskData.risk_components.hurricane_risk,
          floodScore: riskData.risk_components.flood_risk,
          coastalScore: riskData.risk_components.coastal_exposure,
        });
      }

      const reportData = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        zip_code: riskData.zip_code,
        city: city,
        storm_score: riskData.storm_risk_score,
        risk_level: riskData.risk_level,
        hurricane_score: riskData.risk_components.hurricane_risk,
        flood_score: riskData.risk_components.flood_risk,
        coastal_score: riskData.risk_components.coastal_exposure,
        insurance_claim_score: 3,
        lat: riskData.lat,
        lon: riskData.lon,
        evidence_snapshot: evidenceSnapshot,
      };

      console.log("Saving report with coordinates:", riskData.lat, riskData.lon, "and city:", city);

      const savedReport = await saveStormRiskReport(reportData);
      await trackEvent('report_generated', riskData.zip_code, false);

      if (onReportGenerated) {
        onReportGenerated(savedReport.id);
      }
    } catch (err) {
      console.error('Failed to save report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInspection = () => {
    onClose();
    setTimeout(() => {
      const bookingSection = document.getElementById('booking-form');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleAnalyze();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center rounded-t-3xl">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {step === 'input' ? 'Check Your Home Storm Risk' :
               step === 'leadCapture' ? 'Get Your Full Storm Risk Report' :
               'Storm Risk Assessment'}
            </h3>
            {step === 'results' && riskData && (
              <p className="text-slate-600 mt-1">ZIP Code: {riskData.zip_code}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {step === 'input' ? (
          <div className="p-8 space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-10 h-10 text-slate-900" />
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">
                Enter your ZIP code to see your home's storm exposure based on regional hurricane and flood data.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ZIP Code
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:outline-none transition-colors text-lg"
                  placeholder="33101"
                  maxLength={5}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || zipCode.length !== 5}
              className="w-full py-4 bg-slate-900 text-white text-lg font-semibold rounded-full hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Risk...
                </>
              ) : (
                'Analyze Risk'
              )}
            </button>
          </div>
        ) : step === 'results' && riskData ? (
          <div className="p-8 space-y-8">
            <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-slate-900" />
                <h4 className="text-lg font-bold text-slate-900">Storm Risk Score</h4>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-6xl font-bold text-slate-900">{riskData.storm_risk_score}</span>
                <span className="text-3xl text-slate-500 mb-2">/100</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 font-medium">Risk Level:</span>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-white font-bold text-sm uppercase tracking-wide ${getRiskBadgeColor(
                    riskData.risk_level
                  )}`}
                >
                  {riskData.risk_level}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-slate-700">
                <TrendingUp className="w-5 h-5" />
                <h4 className="font-bold text-lg">Risk Breakdown</h4>
              </div>

              <RiskBar label="Hurricane Risk" score={riskData.risk_components.hurricane_risk * 20} />
              <RiskBar label="Flood Risk" score={riskData.risk_components.flood_risk * 20} />
              <RiskBar label="Coastal Exposure" score={riskData.risk_components.coastal_exposure * 20} />
              <RiskBar label="Distance to Coast" score={riskData.risk_components.distance_to_coast * 20} />
              <RiskBar label="FEMA Flood Zone" score={riskData.risk_components.fema_flood_zone * 20} />
              <RiskBar label="Hurricane Corridor" score={riskData.risk_components.hurricane_corridor * 20} />
            </div>

            <div className="bg-slate-100 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-slate-900 mb-3">What This Means</h4>
              <p className="text-slate-700 leading-relaxed">
                {riskData.inspection_recommendation}
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <h4 className="text-xl font-bold mb-2">Want to Learn More?</h4>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Get your personalized Storm Risk Report with detailed analysis, risk breakdowns,
                and recommended actions to protect your home.
              </p>
              <button
                onClick={handleViewFullReport}
                className="w-full py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition-colors text-lg mb-3"
              >
                Get Full Storm Risk Report
              </button>
              <button
                onClick={handleScheduleInspection}
                className="w-full py-4 bg-slate-800 text-white font-bold rounded-full hover:bg-slate-700 transition-colors text-lg border border-slate-600"
              >
                Schedule My Inspection
              </button>
            </div>
          </div>
        ) : step === 'leadCapture' && riskData ? (
          <div className="p-8 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-slate-900 mb-2">{riskData.storm_risk_score}</div>
                <div className="text-slate-600 text-sm mb-3">Storm Risk Score</div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-white font-bold text-sm uppercase tracking-wide ${getRiskBadgeColor(
                    riskData.risk_level
                  )}`}
                >
                  {riskData.risk_level}
                </span>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Enter your information below to receive your complete Storm Risk Report with detailed
                insights and recommendations.
              </p>
            </div>

            <LeadCaptureForm onSubmit={handleLeadSubmit} isLoading={loading} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
