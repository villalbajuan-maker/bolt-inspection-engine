import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LeadCaptureFormProps {
  onSubmit: (data: { name: string; email: string; phone?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function LeadCaptureForm({ onSubmit, isLoading = false }: LeadCaptureFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
    } catch (err) {
      setError('Failed to generate report. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-base font-medium text-slate-900 mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="John Smith"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-base font-medium text-slate-900 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="john@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-base font-medium text-slate-900 mb-2">
          Phone Number <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="(555) 123-4567"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Report...
          </>
        ) : (
          'Get My Storm Risk Report'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your information is secure and will only be used to provide your storm risk assessment.
      </p>
    </form>
  );
}
