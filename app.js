/**
 * PALKI — app.js
 * -----------------------------------------------------------------------
 * Runs on every page. Responsibilities:
 *   1. Fetch data/settings.json (with graceful fallback if it fails).
 *   2. Bind values onto elements using data-bind-* attributes so that
 *      almost nothing needs to be hard-coded in the HTML.
 *   3. Apply theme colors/fonts from settings.json onto CSS variables.
 *   4. Kick off shared UI behaviour (nav, footer year, etc).
 *
 * Binding attributes recognised on any element:
 *   data-bind="settings.path.to.value"        -> sets textContent (escaped)
 *   data-bind-html="settings.path"             -> NOT supported by design;
 *                                                 use data-bind instead to
 *                                                 avoid unsafe innerHTML.
 *   data-bind-href="settings.path"             -> sets href
 *   data-bind-src="settings.path"              -> sets src
 *   data-bind-bg="settings.path"               -> sets background-image
 *   data-bind-alt="settings.path"              -> sets alt text
 * -----------------------------------------------------------------------
 */

(function () {
  'use strict';

  window.PALKI = window.PALKI || {};

  /** Safely resolve a dot-path like "contact.phone" against an object. */
  function resolvePath(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, key) => {
      if (acc === undefined || acc === null) return undefined;
      return acc[key];
    }, obj);
  }

  /** Set text content safely (never innerHTML) to avoid XSS from data files. */
  function setText(el, value) {
    if (value === undefined || value === null) return;
    el.textContent = String(value);
  }

  function applyBindings(root, settings) {
    const scope = { settings };

    root.querySelectorAll('[data-bind]').forEach((el) => {
      const val = resolvePath(scope, el.getAttribute('data-bind'));
      if (val !== undefined) setText(el, val);
    });

    root.querySelectorAll('[data-bind-href]').forEach((el) => {
      const val = resolvePath(scope, el.getAttribute('data-bind-href'));
      if (val) el.setAttribute('href', val);
    });

    root.querySelectorAll('[data-bind-src]').forEach((el) => {
      const val = resolvePath(scope, el.getAttribute('data-bind-src'));
      if (val) el.setAttribute('src', val);
    });

    root.querySelectorAll('[data-bind-alt]').forEach((el) => {
      const val = resolvePath(scope, el.getAttribute('data-bind-alt'));
      if (val) el.setAttribute('alt', val);
    });

    root.querySelectorAll('[data-bind-bg]').forEach((el) => {
      const val = resolvePath(scope, el.getAttribute('data-bind-bg'));
      if (val) el.style.backgroundImage = `url("${val.replace(/"/g, '')}")`;
    });
  }

  /** Push theme.* values from settings.json onto the live CSS custom properties. */
  function applyTheme(settings) {
    const theme = settings.theme || {};
    const root = document.documentElement;
    const map = {
      colorPrimary: '--color-ink',
      colorSecondary: '--color-paper',
      colorAccent: '--color-gold',
      colorAccentDeep: '--color-gold-deep',
      colorMuted: '--color-muted',
      fontDisplay: '--font-display',
      fontBody: '--font-body'
    };
    Object.keys(map).forEach((key) => {
      if (theme[key]) root.style.setProperty(map[key], theme[key]);
    });
  }

  function applySEO(settings) {
    const seo = settings.seo || {};
    if (seo.title) document.title = document.title.includes('|')
      ? document.title
      : seo.title;

    const ensureMeta = (name, content, attr = 'name') => {
      if (!content) return;
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    ensureMeta('description', seo.description);
    ensureMeta('keywords', seo.keywords);
    ensureMeta('og:title', seo.title, 'property');
    ensureMeta('og:description', seo.description, 'property');
    ensureMeta('og:image', seo.ogImage, 'property');
  }

  function wireWhatsappLinks(settings) {
    const c = settings.contact || {};
    const digits = (c.whatsapp || '').replace(/[^\d]/g, '');
    const msg = encodeURIComponent(c.whatsappMessage || 'Hi, I would like to know more.');
    document.querySelectorAll('[data-whatsapp-link]').forEach((el) => {
      el.setAttribute('href', digits ? `https://wa.me/${digits}?text=${msg}` : '#');
    });
    document.querySelectorAll('[data-phone-link]').forEach((el) => {
      el.setAttribute('href', c.phone ? `tel:${c.phone.replace(/\s+/g, '')}` : '#');
    });
    document.querySelectorAll('[data-email-link]').forEach((el) => {
      el.setAttribute('href', c.email ? `mailto:${c.email}` : '#');
    });
  }

  function setActiveNavLink() {
    const current = (location.pathname.split('/').pop() || 'index.html');
    document.querySelectorAll('.nav__links a, .nav__mobile a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  function setFooterYear() {
    document.querySelectorAll('[data-current-year]').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  async function loadSettings() {
    try {
      const res = await fetch('data/settings.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('settings.json request failed');
      return await res.json();
    } catch (err) {
      console.warn('PALKI: could not load settings.json, using fallback content.', err);
      // Minimal fallback so the page still renders sensibly offline.
      return {
        brand: { name: 'PALKI', tagline: 'Tailored for the Few' },
        contact: {},
        theme: {},
        footer: { copyright: '© 2026 PALKI. All rights reserved.' },
        developer: { credit: 'Website Designed & Developed by HARSH' },
        seo: {}
      };
    }
  }

  async function init() {
    const settings = await loadSettings();
    window.PALKI.settings = settings;

    applyTheme(settings);
    applyBindings(document, settings);
    applySEO(settings);
    wireWhatsappLinks(settings);
    setActiveNavLink();
    setFooterYear();

    document.dispatchEvent(new CustomEvent('palki:settings-ready', { detail: settings }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
