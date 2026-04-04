import type { LucideIcon } from 'lucide-react';

type InlineAttachmentProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: 'neutral' | 'success' | 'info' | 'warning';
  media?: React.ReactNode;
  children?: React.ReactNode;
};

function getToneClasses(tone: NonNullable<InlineAttachmentProps['tone']>) {
  switch (tone) {
    case 'success':
      return 'border-emerald-200/90 bg-emerald-50/60';
    case 'info':
      return 'border-sky-200/90 bg-sky-50/60';
    case 'warning':
      return 'border-amber-200/90 bg-amber-50/60';
    default:
      return 'border-slate-200/90 bg-slate-50/88';
  }
}

function getIconToneClasses(tone: NonNullable<InlineAttachmentProps['tone']>) {
  switch (tone) {
    case 'success':
      return 'bg-emerald-100 text-emerald-700';
    case 'info':
      return 'bg-sky-100 text-sky-700';
    case 'warning':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-white text-slate-600';
  }
}

export function InlineAttachment({
  eyebrow,
  title,
  description,
  icon: Icon,
  tone = 'neutral',
  media,
  children,
}: InlineAttachmentProps) {
  return (
    <div
      className={`max-w-full rounded-[1.5rem] border px-3 py-3 sm:ml-2 sm:max-w-[88%] sm:px-3.5 ${getToneClasses(
        tone
      )} shadow-[0_12px_28px_rgba(15,23,42,0.05)] sm:px-4`}
    >
      <div className="flex flex-col gap-2.5">
        {media && <div className="-mx-1 mb-0.5">{media}</div>}

        <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={`mt-0.5 flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl shadow-sm ${getIconToneClasses(
              tone
            )}`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {eyebrow}
              </div>
            )}
            <div className={`${eyebrow ? 'mt-1' : ''} text-[15px] font-semibold leading-snug text-slate-900`}>
              {title}
            </div>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{description}</p>
            )}
            {children && <div className="mt-2">{children}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
