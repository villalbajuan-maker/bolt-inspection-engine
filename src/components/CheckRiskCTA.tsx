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
            className="ds-input flex-1 px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] text-base rounded-xl"
            maxLength={5}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="ds-btn-primary w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.99] whitespace-nowrap"
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
          <p className="text-sm text-center mt-2" style={{ color: 'var(--ds-danger)' }}>{error}</p>
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
            className="ds-input w-full px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] text-base rounded-xl text-center"
            maxLength={5}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="ds-btn-primary w-full px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.99]"
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
          <p className="text-sm text-center mt-2" style={{ color: 'var(--ds-danger)' }}>{error}</p>
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
          className="ds-input w-full px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] text-base rounded-xl"
          maxLength={5}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="ds-btn-primary w-full px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.99]"
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
        <p className="text-sm text-center mt-2" style={{ color: 'var(--ds-danger)' }}>{error}</p>
      )}
    </div>
  );
}
