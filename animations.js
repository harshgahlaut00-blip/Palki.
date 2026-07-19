/**
 * PALKI — animations.js
 * -----------------------------------------------------------------------
 * Small, purposeful motion only:
 *   - draws the signature gold "stitch" divider in as it enters view
 *   - a very subtle parallax drift on the hero background image
 * Respects prefers-reduced-motion throughout.
 * -----------------------------------------------------------------------
 */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initStitchDividers() {
    const dividers = document.querySelectorAll('.stitch-divider');
    if (!dividers.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      dividers.forEach((d) => d.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    dividers.forEach((d) => io.observe(d));
  }

  function initHeroParallax() {
    if (reduceMotion) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY * 0.25, 120);
        hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;
        ticking = false;
      });
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initStitchDividers();
    // Hero parallax intentionally disabled — keeps the page feeling
    // stable/fixed while scrolling instead of shifting the background.
    // initHeroParallax();
  });
})();
