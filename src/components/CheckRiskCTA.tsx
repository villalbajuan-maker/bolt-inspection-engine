import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CheckRiskCTAProps {
  onCheckRisk: (zipCode?: string) => void;
  variant?: 'default' | 'inline' | 'stacked';
  className?: string;
}

export function CheckRiskCTA({ onCheckRisk, variant = 'default', className = '' }: CheckRiskCTAProps) {
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!zipCode) {
      onCheckRisk();
      return;
    }

    if (zipCode.length !== 5 || !/^\d+$/.test(zipCode)) {
      setError('Please enter a valid ZIP code.');
      return;
    }

    setLoading(true);
    onCheckRisk(zipCode);

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (variant === 'inline') {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Enter your ZIP code"
            value={zipCode}
            onChange={(e) => {
              setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5));
              setError('');
            }}
            className="flex-1 px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
            maxLength={5}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Risk...
              </>
            ) : (
              'Check My Home Risk'
            )}
          </button>
        </form>
        {error && (
          <p className="text-sm text-red-600 text-center mt-2">{error}</p>
        )}
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mx-auto">
          <input
            type="text"
            placeholder="Enter your ZIP code"
            value={zipCode}
            onChange={(e) => {
              setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5));
              setError('');
            }}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 transition-colors text-center"
            maxLength={5}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Risk...
              </>
            ) : (
              'Check My Home Risk'
            )}
          </button>
        </form>
        {error && (
          <p className="text-sm text-red-600 text-center mt-2">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter your ZIP code"
          value={zipCode}
          onChange={(e) => {
            setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5));
            setError('');
          }}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 transition-colors"
          maxLength={5}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Risk...
            </>
          ) : (
            'Check My Home Risk'
          )}
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-600 text-center mt-2">{error}</p>
      )}
    </div>
  );
}
