import { useState, useEffect } from 'react';
import { CheckRiskCTA } from '../components/CheckRiskCTA';

interface HeroSectionProps {
  onCheckRisk: (zipCode?: string) => void;
}

export function HeroSection({ onCheckRisk }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/hero-home-storm.png"
          alt="Storm approaching coastal homes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/55" />
      </div>

      <div
        className="relative max-w-2xl mx-auto px-6 py-20 text-center z-10"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
          transition: 'transform 0.1s linear'
        }}
      >
        <div className="ds-kicker text-white/80 mb-5">
          Florida Storm Intelligence
        </div>

        <h1 className="ds-display-title text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
          Understand Your Home's Storm Risk Before the Next Hurricane Season
        </h1>

        <p className="ds-lead text-base sm:text-xl text-white/90 mb-8">
          Check your Storm Risk Score and see how exposed your property may be to hurricane and flood damage.
        </p>

        <CheckRiskCTA onCheckRisk={onCheckRisk} variant="stacked" />
      </div>
    </section>
  );
}
