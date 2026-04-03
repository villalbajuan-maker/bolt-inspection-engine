import type { LucideIcon } from 'lucide-react';

type BrandIconBadgeProps = {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
};

const sizeMap = {
  sm: {
    wrapper: 'h-10 w-10 rounded-lg',
    icon: 'h-4 w-4',
  },
  md: {
    wrapper: 'h-12 w-12 rounded-xl',
    icon: 'h-5 w-5',
  },
  lg: {
    wrapper: 'h-14 w-14 rounded-2xl',
    icon: 'h-6 w-6',
  },
} as const;

const toneMap = {
  primary: {
    background: 'linear-gradient(180deg, var(--ds-primary-900) 0%, var(--ds-primary-800) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--ds-white)',
    shadow: '0 12px 24px rgba(11, 31, 58, 0.24)',
  },
  accent: {
    background: 'linear-gradient(180deg, var(--ds-accent-500) 0%, var(--ds-accent-600) 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--ds-white)',
    shadow: '0 12px 24px rgba(47, 107, 255, 0.24)',
  },
  success: {
    background: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.18)',
    color: 'var(--ds-success)',
    shadow: 'none',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.18)',
    color: 'var(--ds-warning)',
    shadow: 'none',
  },
} as const;

export function BrandIconBadge({
  icon: Icon,
  size = 'md',
  tone = 'primary',
  className = '',
}: BrandIconBadgeProps) {
  const selectedSize = sizeMap[size];
  const selectedTone = toneMap[tone];

  return (
    <div
      className={`inline-flex items-center justify-center ${selectedSize.wrapper} ${className}`}
      style={{
        background: selectedTone.background,
        border: selectedTone.border,
        boxShadow: selectedTone.shadow,
        color: selectedTone.color,
      }}
    >
      <Icon className={selectedSize.icon} strokeWidth={2.2} />
    </div>
  );
}
