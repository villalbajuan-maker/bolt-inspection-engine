import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { getStormRiskFromSupabase } from '../api/riskData';
import { trackEvent } from '../api/analytics';
import { RiskModalData } from '../types';

interface StormRiskCalculatorProps {
  onRiskCalculated: (data: RiskModalData) => void;
  initialZipCode?: string;
}

export function StormRiskCalculator({ onRiskCalculated, initialZipCode }: StormRiskCalculatorProps) {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialZipCode && initialZipCode.length === 5) {
      setZipCode(initialZipCode);
      handleSubmitWithZip(initialZipCode);
    }
  }, [initialZipCode]);

  const handleSubmitWithZip = async (zip: string) => {
    setError('');

    if (zip.length !== 5 || !/^\d+$/.test(zip)) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setLoading(true);

    try {
      const riskData = await getStormRiskFromSupabase(zip);

      if (!riskData || riskData.error) {
        setError('No risk data available for this ZIP code. Please try another.');
        setLoading(false);
        return;
      }

      await trackEvent('risk_checked', zip);

      const modalData: RiskModalData = {
        zipCode: zip,
        overallRisk: riskData.storm_risk_score,
        hurricaneRisk: riskData.risk_components.hurricane_risk,
        floodRisk: riskData.risk_components.flood_risk,
        coastalExposure: riskData.risk_components.coastal_exposure,
        insuranceClaimRisk: riskData.risk_level,
      };

      onRiskCalculated(modalData);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Risk calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitWithZip(zipCode);
  };

  return (
    <section id="storm-risk-snapshot" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-4">
            Storm Risk Snapshot
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Enter your ZIP code to see your property's vulnerability assessment.
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div>
              <label className="block text-sm sm:text-base font-medium text-slate-900 mb-2">
                ZIP Code
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
                  placeholder="33101"
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 h-12 sm:h-auto text-base border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 min-h-[44px] bg-slate-900 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Calculate Risk'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
