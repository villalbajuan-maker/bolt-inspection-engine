import { useState } from 'react';
import { X, Calendar, CheckCircle } from 'lucide-react';
import { StormRiskReport } from '../api/stormReports';
import { submitInspectionBooking } from '../api/inspectionRequests';
import { BrandIconBadge } from './BrandIconBadge';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: StormRiskReport;
  initialFormData?: Partial<{
    address: string;
    city: string;
    zipCode: string;
    inspectionType: string;
    rationaleSummary: string;
  }>;
}

export function BookingModal({ isOpen, onClose, reportData, initialFormData }: BookingModalProps) {
  const [formData, setFormData] = useState({
    fullName: reportData.name || '',
    phone: reportData.phone || '',
    email: reportData.email || '',
    address: initialFormData?.address || '',
    city: initialFormData?.city || '',
    zipCode: initialFormData?.zipCode || reportData.zip_code || '',
    preferredDate: '',
    preferredTime: '',
    inspectionType: initialFormData?.inspectionType || '4-Point Inspection'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitInspectionBooking({
        ...formData,
        stormScore: reportData.storm_score,
        riskLevel: reportData.risk_level
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          zipCode: '',
          preferredDate: '',
          preferredTime: '',
          inspectionType: '4-Point Inspection'
        });
      }, 2000);
    } catch (error) {
      setSubmitError('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ border: '1px solid var(--ds-gray-200)' }}>
        <div className="sticky top-0 bg-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--ds-gray-200)' }}>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--ds-primary-900)' }}>Schedule Your Inspection</h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--ds-gray-500)' }}>Fill out the form below to request an inspection</p>
          </div>
          <button
            onClick={onClose}
            className="ds-btn-secondary min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 rounded-full"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <BrandIconBadge icon={CheckCircle} size="lg" tone="success" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-2" style={{ color: 'var(--ds-primary-900)' }}>Request Submitted!</h3>
            <p className="text-sm sm:text-base" style={{ color: 'var(--ds-gray-500)' }}>We'll contact you shortly to confirm your inspection.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {(initialFormData?.inspectionType || initialFormData?.rationaleSummary) && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(47, 107, 255, 0.06)',
                  border: '1px solid rgba(47, 107, 255, 0.16)',
                }}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--ds-accent-600)' }}>
                  Continuing from the Companion
                </div>
                {initialFormData?.inspectionType && (
                  <div className="mt-2 text-sm font-semibold" style={{ color: 'var(--ds-primary-900)' }}>
                    We will carry over: {initialFormData.inspectionType}
                  </div>
                )}
                {initialFormData?.rationaleSummary && (
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ds-gray-500)' }}>
                    {initialFormData.rationaleSummary}
                  </p>
                )}
                <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--ds-gray-500)' }}>
                  This keeps the same context the Companion already used, so you do not have to re-explain the recommendation from scratch.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ds-primary-900)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="ds-input w-full px-4 py-3 h-12 text-base rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ds-primary-900)' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="ds-input w-full px-4 py-3 h-12 text-base rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ds-primary-900)' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="ds-input w-full px-4 py-3 h-12 text-base rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ds-primary-900)' }}>
                Property Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="ds-input w-full px-4 py-3 h-12 text-base rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ds-primary-900)' }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="ds-input w-full px-4 py-3 h-12 text-base rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ds-primary-900)' }}>
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  className="ds-input w-full px-4 py-3 h-12 text-base rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ds-primary-900)' }}>
                  Preferred Inspection Date
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="ds-input w-full px-4 py-3 h-12 text-base rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ds-primary-900)' }}>
                  Preferred Time Window
                </label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  required
                  className="ds-input w-full px-4 py-3 h-12 text-base rounded-lg"
                >
                  <option value="">Select time</option>
                  <option value="8:00 AM - 10:00 AM">8:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 2:00 PM">12:00 PM - 2:00 PM</option>
                  <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
                  <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ds-primary-900)' }}>
                Inspection Type
              </label>
              <select
                name="inspectionType"
                value={formData.inspectionType}
                onChange={handleChange}
                required
                className="ds-input w-full px-4 py-3 h-12 text-base rounded-lg"
              >
                <option value="4-Point Inspection">4-Point Inspection</option>
                <option value="Wind Mitigation Inspection">Wind Mitigation Inspection</option>
                <option value="Insurance Readiness Inspection">Insurance Readiness Inspection</option>
              </select>
            </div>

            {submitError && (
              <div className="rounded-lg p-3 sm:p-4 text-sm" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.18)', color: 'var(--ds-danger)' }}>
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="ds-btn-primary w-full py-4 px-8 min-h-[44px] rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Calendar className="w-5 h-5" />
              {isSubmitting ? 'Submitting...' : 'Request Inspection'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
