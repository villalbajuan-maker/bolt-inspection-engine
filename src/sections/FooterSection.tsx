import { useScrollReveal } from '../hooks/useScrollReveal';
import { Shield, Linkedin, Youtube, Instagram } from 'lucide-react';

export function FooterSection() {
  useScrollReveal();

  return (
    <footer
      className="w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0B1620 0%, #081017 100%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-20 reveal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <div className="mb-4">
              <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">
              Storm Intelligence for Florida Homes
            </h3>
            <p className="text-sm text-[#9AA7B5] leading-relaxed max-w-[420px]">
              Disaster Shield helps homeowners understand their real storm exposure before the
              next storm season.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-[#9AA7B5]">
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
                className="text-[#9AA7B5] hover:text-[#2E8BC0] transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[#9AA7B5] hover:text-[#2E8BC0] transition-colors duration-300"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[#9AA7B5] hover:text-[#2E8BC0] transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 mt-12 pt-6">
          <p className="text-center text-[13px] text-[#9AA7B5]">
            © 2026 Disaster Shield — Storm Intelligence & Inspection Services — Florida
          </p>
        </div>
      </div>
    </footer>
  );
}
