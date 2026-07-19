/**
 * PALKI — ui.js
 * -----------------------------------------------------------------------
 * Sitewide interactive chrome: sticky nav state, mobile menu, toast
 * messages, testimonial slider, animated stats, "why choose us" cards,
 * featured collections and the Instagram gallery.
 * No untrusted data is ever inserted with innerHTML — text goes through
 * textContent, and the handful of SVG icons used are fixed strings picked
 * from a whitelist keyed by a known icon name, never built from raw JSON.
 * -----------------------------------------------------------------------
 */

(function () {
  'use strict';

  window.PALKI = window.PALKI || {};

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(message) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3200);
  }
  window.PALKI.toast = toast;

  /* ---------------- Sticky nav ---------------- */
  let navInitialized = false;
  function initNav() {
    if (navInitialized) return;
    const nav = document.querySelector('[data-nav]');
    if (!nav) return;
    navInitialized = true;
    const onScroll = () => {
      nav.classList.toggle('is-solid', window.scrollY > 60);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = nav.querySelector('[data-nav-toggle]');
    const mobile = document.querySelector('[data-nav-mobile]');
    if (toggle && mobile) {
      toggle.addEventListener('click', () => {
        const open = mobile.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      });
      mobile.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
        mobile.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }));
    }
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    items.forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${(i % 4) * 90}ms`);
      io.observe(el);
    });
  }

  /* ---------------- Animated stat counters ---------------- */
  function animateCount(el, target, suffix) {
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function renderStats(stats) {
    const container = document.querySelector('[data-stats]');
    if (!container || !Array.isArray(stats)) return;
    container.textContent = '';
    stats.forEach((stat) => {
      const wrap = document.createElement('div');
      wrap.className = 'stat';
      const value = document.createElement('div');
      value.className = 'stat__value';
      value.textContent = '0';
      value.dataset.target = stat.value;
      value.dataset.suffix = stat.suffix || '';
      const label = document.createElement('div');
      label.className = 'stat__label';
      label.textContent = stat.label || '';
      wrap.appendChild(value);
      wrap.appendChild(label);
      container.appendChild(wrap);
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            container.querySelectorAll('.stat__value').forEach((el) => {
              animateCount(el, Number(el.dataset.target) || 0, el.dataset.suffix);
            });
            io.disconnect();
          }
        });
      }, { threshold: 0.4 });
      io.observe(container);
    } else {
      container.querySelectorAll('.stat__value').forEach((el) => {
        el.textContent = Number(el.dataset.target).toLocaleString('en-IN') + el.dataset.suffix;
      });
    }
  }

  /* ---------------- Why choose us ---------------- */
  const ICONS = {
    needle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 20 L17 7"/><circle cx="19" cy="5" r="2.2"/><path d="M9 12 L12 15"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 20c8 0 16-8 16-16C12 4 4 12 4 20Z"/><path d="M4 20c4-4 8-8 12-12"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="7" width="12" height="9"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/></svg>'
  };

  function renderFeatures(features) {
    const container = document.querySelector('[data-features]');
    if (!container || !Array.isArray(features)) return;
    container.textContent = '';
    features.forEach((f) => {
      const card = document.createElement('div');
      card.className = 'feature-card';
      card.setAttribute('data-reveal', '');

      const icon = document.createElement('div');
      icon.className = 'feature-card__icon';
      // Safe: ICONS keys are a fixed whitelist of our own SVG markup.
      icon.innerHTML = ICONS[f.icon] || ICONS.shield;

      const h3 = document.createElement('h3');
      h3.textContent = f.title || '';
      const p = document.createElement('p');
      p.textContent = f.description || '';

      card.appendChild(icon);
      card.appendChild(h3);
      card.appendChild(p);
      container.appendChild(card);
    });
  }

  /* ---------------- Featured collections ---------------- */
  async function renderCollections() {
    const container = document.querySelector('[data-collections]');
    if (!container) return;
    try {
      const res = await fetch('data/collections.json', { cache: 'no-store' });
      const collections = await res.json();
      container.textContent = '';
      collections.forEach((c) => {
        const a = document.createElement('a');
        a.href = c.link || 'products.html';
        a.className = 'collection-card lift-on-hover';
        a.setAttribute('data-reveal', '');
        a.style.cssText = 'position:relative;display:block;aspect-ratio:3/4;border-radius:var(--radius-md);overflow:hidden;';

        const img = document.createElement('img');
        img.src = c.image;
        img.alt = c.title || '';
        img.loading = 'lazy';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(10,10,10,0.75));display:flex;flex-direction:column;justify-content:flex-end;padding:1.5rem;color:#faf8f3;';
        const title = document.createElement('div');
        title.style.cssText = 'font-family:var(--font-display);font-size:1.4rem;';
        title.textContent = c.title || '';
        const sub = document.createElement('div');
        sub.style.cssText = 'font-size:0.82rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-gold);margin-top:4px;';
        sub.textContent = c.subtitle || '';
        overlay.appendChild(title);
        overlay.appendChild(sub);

        a.appendChild(img);
        a.appendChild(overlay);
        container.appendChild(a);
      });
    } catch (err) {
      console.warn('PALKI: collections.json failed to load', err);
    }
  }

  /* ---------------- Testimonials slider ---------------- */
  async function initTestimonials() {
    const root = document.querySelector('[data-testimonials]');
    if (!root) return;
    try {
      const res = await fetch('data/testimonials.json', { cache: 'no-store' });
      const items = await res.json();
      if (!items.length) return;

      const slidesWrap = document.createElement('div');
      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'testimonial-dots';

      items.forEach((t, i) => {
        const slide = document.createElement('div');
        slide.className = 'testimonial-slide' + (i === 0 ? ' is-active' : '');

        const stars = document.createElement('div');
        stars.className = 'stars';
        const starCount = Math.max(0, Math.min(5, Number(t.rating) || 0));
        for (let s = 0; s < starCount; s++) {
          const span = document.createElement('span');
          span.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.6 1.7 7-6.3-4-6.3 4 1.7-7L2 9.5l7.1-.6z"/></svg>';
          stars.appendChild(span.firstChild);
        }

        const quote = document.createElement('blockquote');
        quote.textContent = `“${t.text || ''}”`;
        const cite = document.createElement('cite');
        cite.textContent = `${t.name || ''} — ${t.location || ''}`;

        slide.appendChild(stars);
        slide.appendChild(quote);
        slide.appendChild(cite);
        slidesWrap.appendChild(slide);

        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = i === 0 ? 'is-active' : '';
        dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
        dot.addEventListener('click', () => show(i));
        dotsWrap.appendChild(dot);
      });

      root.appendChild(slidesWrap);
      root.appendChild(dotsWrap);

      const slides = slidesWrap.querySelectorAll('.testimonial-slide');
      const dots = dotsWrap.querySelectorAll('button');
      let current = 0;

      function show(i) {
        slides[current].classList.remove('is-active');
        dots[current].classList.remove('is-active');
        current = (i + items.length) % items.length;
        slides[current].classList.add('is-active');
        dots[current].classList.add('is-active');
      }

      let autoplay = setInterval(() => show(current + 1), 6000);
      root.addEventListener('mouseenter', () => clearInterval(autoplay));
      root.addEventListener('mouseleave', () => { autoplay = setInterval(() => show(current + 1), 6000); });
    } catch (err) {
      console.warn('PALKI: testimonials.json failed to load', err);
    }
  }

  /* ---------------- Instagram gallery ---------------- */
  async function renderGallery() {
    const container = document.querySelector('[data-gallery]');
    if (!container) return;
    try {
      const res = await fetch('data/social.json', { cache: 'no-store' });
      const social = await res.json();

      document.querySelectorAll('[data-instagram-handle]').forEach((el) => {
        el.textContent = social.instagramHandle || '';
      });

      // Generic binder for any [data-bind-href^="social."] element (footer social icons, etc).
      document.querySelectorAll('[data-bind-href]').forEach((el) => {
        const path = el.getAttribute('data-bind-href');
        if (!path || !path.startsWith('social.')) return;
        const value = path.split('.').slice(1).reduce((acc, key) => (acc ? acc[key] : undefined), social);
        if (value) el.setAttribute('href', value);
      });

      container.textContent = '';
      (social.gallery || []).forEach((item) => {
        const a = document.createElement('a');
        a.className = 'gallery__item';
        a.href = item.link || social.instagramLink || '#';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = 'PALKI on Instagram';
        img.loading = 'lazy';
        a.appendChild(img);
        container.appendChild(a);
      });
    } catch (err) {
      console.warn('PALKI: social.json failed to load', err);
    }
  }

  /* ---------------- Footer newsletter (demo only, no backend) ---------------- */
  function initNewsletterForms() {
    document.querySelectorAll('[data-newsletter-form]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.reset();
        toast("Thanks — you're on the list (demo).");
      });
    });
  }

  /* ---------------- Init ---------------- */
  function boot(settings) {
    initNav();
    renderStats(settings.stats);
    renderFeatures(settings.whyChooseUs);
    renderCollections();
    initTestimonials();
    renderGallery();
    initReveal();
    // Re-run reveal registration after dynamic content mounts.
    setTimeout(initReveal, 400);
  }

  document.addEventListener('palki:settings-ready', (e) => boot(e.detail || {}));

  // Nav/menu and newsletter forms should still work even before settings resolve.
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initNewsletterForms();
  });
})();
