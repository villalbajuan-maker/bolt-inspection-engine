import { useState } from 'react';
import { Calendar, Clock, Home, Mail, Phone, User, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { submitInspectionRequest } from '../api/inspectionRequests';
import { trackEvent } from '../api/analytics';
import { InspectionRequest } from '../types';

const inspectionTypes = [
  '4-Point Inspection',
  'Wind Mitigation Inspection',
  'Insurance Readiness Inspection',
];

const timeWindows = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
];

export function InspectionBookingForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
    email: '',
    preferred_date: '',
    preferred_time_window: '',
    inspection_type: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Please enter your address');
      return false;
    }
    if (!formData.city.trim()) {
      setError('Please enter your city');
      return false;
    }
    if (formData.zip.length !== 5 || !/^\d+$/.test(formData.zip)) {
      setError('Please enter a valid 5-digit ZIP code');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.preferred_date) {
      setError('Please select a preferred date');
      return false;
    }
    if (!formData.preferred_time_window) {
      setError('Please select a time window');
      return false;
    }
    if (!formData.inspection_type) {
      setError('Please select an inspection type');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const request: InspectionRequest = {
        ...formData,
        source: 'conversion_microapp',
      };

      const result = await submitInspectionRequest(request);

      if (result.success) {
        await trackEvent('inspection_booked', formData.zip, true);
        setSuccess(true);
        setFormData({
          full_name: '',
          address: '',
          city: '',
          zip: '',
          phone: '',
          email: '',
          preferred_date: '',
          preferred_time_window: '',
          inspection_type: '',
        });
      } else {
        setError(result.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section id="booking-form" className="py-24 bg-white">
        <div className="max-w-xl mx-auto px-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-semibold text-slate-900 mb-4">
              Inspection Scheduled!
            </h3>
            <p className="text-base text-gray-600 mb-8">
              Thank you for booking with Disaster Shield. We'll contact you shortly to confirm your inspection appointment.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-8 py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-md"
            >
              Schedule Another Inspection
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking-form" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">
            Schedule Your Inspection
          </h2>
          <p className="text-base text-gray-600">
            Get your comprehensive home assessment within 24 hours.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-medium text-slate-900 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                    placeholder="John Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-slate-900 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-slate-900 mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-slate-900 mb-2">
                Address
              </label>
              <div className="relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                  placeholder="123 Main Street"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-medium text-slate-900 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                  placeholder="Miami"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-slate-900 mb-2">
                  ZIP Code
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={(e) =>
                      setFormData({ ...formData, zip: e.target.value.slice(0, 5) })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                    placeholder="33101"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-medium text-slate-900 mb-2">
                  Preferred Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    name="preferred_date"
                    value={formData.preferred_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-slate-900 mb-2">
                  Time Window
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="preferred_time_window"
                    value={formData.preferred_time_window}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors appearance-none bg-white"
                  >
                    <option value="">Select time</option>
                    {timeWindows.map((window) => (
                      <option key={window} value={window}>
                        {window}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-slate-900 mb-2">
                Inspection Type
              </label>
              <div className="space-y-3">
                {inspectionTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-slate-900 transition-colors cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="inspection_type"
                      value={type}
                      checked={formData.inspection_type === type}
                      onChange={handleChange}
                      className="w-5 h-5 text-slate-900"
                    />
                    <span className="text-slate-900 font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule Inspection'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
