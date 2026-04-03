import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const observeCurrentElements = () => {
      const elements = document.querySelectorAll('.reveal:not(.reveal-visible)');
      elements.forEach((el) => observer.observe(el));
    };

    observeCurrentElements();

    const mutationObserver = new MutationObserver(() => {
      observeCurrentElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);
}
