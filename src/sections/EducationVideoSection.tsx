import { trackEvent } from '../api/analytics';
import { useScrollReveal } from '../hooks/useScrollReveal';

export function EducationVideoSection() {
  useScrollReveal();

  const handleVideoPlay = () => {
    trackEvent('video_watched');
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-4">
            Understanding Storm Risk
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Watch this guide to learn what makes homes vulnerable during severe weather.
          </p>
        </div>

        <div className="reveal max-w-4xl mx-auto">
          <video
            src="/disaster-shield-hero-video.mp4"
            poster="/storm-risk-preview.png"
            autoPlay
            muted
            loop
            controls
            playsInline
            onPlay={handleVideoPlay}
            className="w-full rounded-xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
