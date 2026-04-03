import { useScrollReveal } from '../hooks/useScrollReveal';
import { Linkedin, Youtube, Instagram } from 'lucide-react';

export function FooterSection() {
  useScrollReveal();

  return (
    <footer
      className="w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--ds-primary-900) 0%, var(--ds-primary-800) 100%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-20 reveal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <div className="mb-6">
              <img
                src="/disaster-logo.png"
                alt="Disaster Shield"
                className="h-auto w-full max-w-[320px]"
                loading="lazy"
              />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Storm Intelligence for Florida Homes
            </h3>
            <p className="text-sm leading-relaxed max-w-[420px]" style={{ color: 'var(--ds-gray-500)' }}>
              Disaster Shield helps homeowners understand their real storm exposure before the
              next storm season.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-2 text-sm" style={{ color: 'var(--ds-gray-500)' }}>
              <div>
                <div className="text-white font-medium mb-1">Phone</div>
                <div>(941) XXX-XXXX</div>
              </div>
              <div>
                <div className="text-white font-medium mb-1">Email</div>
                <div>inspections@disastershield.com</div>
              </div>
              <div>
                <div className="text-white font-medium mb-1">Service Area</div>
                <div>Florida</div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <a
                href="#"
                className="transition-colors duration-300"
                style={{ color: 'var(--ds-gray-500)' }}
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="transition-colors duration-300"
                style={{ color: 'var(--ds-gray-500)' }}
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="transition-colors duration-300"
                style={{ color: 'var(--ds-gray-500)' }}
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 mt-12 pt-6">
          <p className="text-center text-[13px]" style={{ color: 'var(--ds-gray-500)' }}>
            © 2026 Disaster Shield — Storm Intelligence & Inspection Services — Florida
          </p>
        </div>
      </div>
    </footer>
  );
}
