/**
 * PALKI — products.js
 * -----------------------------------------------------------------------
 * Loads data/products.json and renders product cards wherever a
 * [data-products] container exists:
 *   data-products="featured"  -> home page, isFeatured items only
 *   data-products="new"       -> home page, isNew items only
 *   data-products="all"       -> products page, full catalog + filters
 *
 * Wishlist is a demo only (kept in memory for the session — no backend,
 * no local storage dependency) and Quick View opens an accessible modal.
 * All product data is rendered through textContent/DOM APIs, never
 * innerHTML, since product data ultimately comes from an editable JSON
 * file.
 * -----------------------------------------------------------------------
 */

(function () {
  'use strict';

  window.PALKI = window.PALKI || {};
  const wishlist = new Set();

  function formatPrice(amount, currency) {
    if (typeof amount !== 'number') return '';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency || 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `₹${amount}`;
    }
  }

  function starIcon() {
    const span = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    span.setAttribute('viewBox', '0 0 24 24');
    span.innerHTML = '<path d="M12 2l2.9 6.9 7.1.6-5.4 4.6 1.7 7-6.3-4-6.3 4 1.7-7L2 9.5l7.1-.6z"/>';
    return span;
  }

  function buildCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.category = product.category || '';
    card.dataset.id = product.id;

    const frame = document.createElement('div');
    frame.className = 'product-card__frame';

    if (product.isNew) {
      const badge = document.createElement('span');
      badge.className = 'product-card__badge';
      badge.textContent = 'New';
      frame.appendChild(badge);
    } else if (product.compareAtPrice) {
      const badge = document.createElement('span');
      badge.className = 'product-card__badge product-card__badge--sale';
      badge.textContent = 'Sale';
      frame.appendChild(badge);
    }

    const wishBtn = document.createElement('button');
    wishBtn.type = 'button';
    wishBtn.className = 'product-card__wishlist';
    wishBtn.setAttribute('aria-label', `Add ${product.name} to wishlist`);
    wishBtn.setAttribute('aria-pressed', wishlist.has(product.id) ? 'true' : 'false');
    wishBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7.5-4.6-10-9.2C.6 8.4 2.4 5 6 5c2 0 3.4 1 6 3.6C14.6 6 16 5 18 5c3.6 0 5.4 3.4 4 6.8-2.5 4.6-10 9.2-10 9.2z"/></svg>';
    wishBtn.addEventListener('click', () => {
      const pressed = wishBtn.getAttribute('aria-pressed') === 'true';
      wishBtn.setAttribute('aria-pressed', String(!pressed));
      if (pressed) {
        wishlist.delete(product.id);
        window.PALKI.toast && window.PALKI.toast(`Removed “${product.name}” from wishlist`);
      } else {
        wishlist.add(product.id);
        window.PALKI.toast && window.PALKI.toast(`Added “${product.name}” to wishlist (demo)`);
      }
    });
    frame.appendChild(wishBtn);

    const imgBase = document.createElement('img');
    imgBase.className = 'img--base';
    imgBase.src = product.image;
    imgBase.alt = product.name || '';
    imgBase.loading = 'lazy';
    frame.appendChild(imgBase);

    if (product.hoverImage) {
      const imgHover = document.createElement('img');
      imgHover.className = 'img--hover';
      imgHover.src = product.hoverImage;
      imgHover.alt = '';
      imgHover.loading = 'lazy';
      imgHover.setAttribute('aria-hidden', 'true');
      frame.appendChild(imgHover);
    }

    const quickBtn = document.createElement('button');
    quickBtn.type = 'button';
    quickBtn.className = 'product-card__quickview btn btn--primary btn--block btn--sm';
    quickBtn.textContent = 'Quick View';
    quickBtn.addEventListener('click', () => openQuickView(product));
    frame.appendChild(quickBtn);

    const body = document.createElement('div');
    body.className = 'product-card__body';

    const category = document.createElement('div');
    category.className = 'product-card__category';
    category.textContent = product.category || '';

    const name = document.createElement('h3');
    name.className = 'product-card__name';
    name.textContent = product.name || '';

    const meta = document.createElement('div');
    meta.className = 'product-card__meta';

    const price = document.createElement('div');
    price.className = 'product-card__price';
    price.textContent = formatPrice(product.price, product.currency);
    if (product.compareAtPrice) {
      const del = document.createElement('del');
      del.textContent = formatPrice(product.compareAtPrice, product.currency);
      price.appendChild(del);
    }

    const rating = document.createElement('div');
    rating.className = 'product-card__rating';
    rating.appendChild(starIcon());
    const ratingText = document.createElement('span');
    ratingText.textContent = `${(product.rating || 0).toFixed(1)} (${product.reviews || 0})`;
    rating.appendChild(ratingText);

    meta.appendChild(price);
    meta.appendChild(rating);

    body.appendChild(category);
    body.appendChild(name);
    body.appendChild(meta);

    card.appendChild(frame);
    card.appendChild(body);
    return card;
  }

  function renderInto(container, products) {
    container.textContent = '';
    if (!products.length) {
      const empty = document.createElement('p');
      empty.className = 'state-message';
      empty.textContent = 'No products match this filter yet — check back soon.';
      container.appendChild(empty);
      return;
    }
    const frag = document.createDocumentFragment();
    products.forEach((p) => frag.appendChild(buildCard(p)));
    container.appendChild(frag);
  }

  /* ---------------- Quick View Modal ---------------- */
  let modalOverlay, lastFocused;

  function ensureModal() {
    if (modalOverlay) return modalOverlay;
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="qv-title">
        <button type="button" class="modal__close" aria-label="Close quick view">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l16 16M20 4L4 20"/></svg>
        </button>
        <div class="modal__image"><img alt="" id="qv-image"></div>
        <div class="modal__body">
          <div class="product-card__category" id="qv-category"></div>
          <h3 id="qv-title" style="font-family:var(--font-display);font-size:1.7rem;margin-top:4px;"></h3>
          <div class="product-card__meta" style="margin-top:0.75rem;">
            <div class="product-card__price" id="qv-price"></div>
          </div>
          <p id="qv-desc" style="color:var(--color-muted);margin-top:1rem;font-size:0.95rem;"></p>
          <div style="display:flex;gap:0.75rem;margin-top:1.5rem;">
            <button type="button" class="btn btn--primary" id="qv-wishlist">Add to Wishlist</button>
            <a href="contact.html" class="btn btn--outline">Enquire</a>
          </div>
          <p style="font-size:0.78rem;color:var(--color-muted);margin-top:1rem;">This is a demo storefront — checkout is not enabled. Contact us to place an order.</p>
        </div>
      </div>`;
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeQuickView();
    });
    modalOverlay.querySelector('.modal__close').addEventListener('click', closeQuickView);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) closeQuickView();
    });
    return modalOverlay;
  }

  function openQuickView(product) {
    const overlay = ensureModal();
    overlay.querySelector('#qv-image').src = product.image;
    overlay.querySelector('#qv-image').alt = product.name || '';
    overlay.querySelector('#qv-category').textContent = product.category || '';
    overlay.querySelector('#qv-title').textContent = product.name || '';
    overlay.querySelector('#qv-price').textContent = formatPrice(product.price, product.currency);
    overlay.querySelector('#qv-desc').textContent = product.description || '';

    const wishBtn = overlay.querySelector('#qv-wishlist');
    const pressed = wishlist.has(product.id);
    wishBtn.textContent = pressed ? 'In Wishlist ✓' : 'Add to Wishlist';
    wishBtn.onclick = () => {
      if (wishlist.has(product.id)) {
        wishlist.delete(product.id);
        wishBtn.textContent = 'Add to Wishlist';
      } else {
        wishlist.add(product.id);
        wishBtn.textContent = 'In Wishlist ✓';
      }
      window.PALKI.toast && window.PALKI.toast('Wishlist updated (demo)');
    };

    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    overlay.querySelector('.modal__close').focus();
  }

  function closeQuickView() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('is-open');
    if (lastFocused) lastFocused.focus();
  }

  /* ---------------- Filters (products page) ---------------- */
  function initFilters(allProducts, container) {
    const filterBar = document.querySelector('[data-product-filters]');
    if (!filterBar) return;

    const categories = ['All', ...new Set(allProducts.map((p) => p.category).filter(Boolean))];
    filterBar.textContent = '';

    const params = new URLSearchParams(location.search);
    const initialCategory = params.get('category') || 'All';

    categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = cat;
      if (cat === initialCategory) btn.classList.add('is-active');
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filtered = cat === 'All' ? allProducts : allProducts.filter((p) => p.category === cat);
        renderInto(container, filtered);
      });
      filterBar.appendChild(btn);
    });

    const initialFiltered = initialCategory === 'All'
      ? allProducts
      : allProducts.filter((p) => p.category === initialCategory);
    renderInto(container, initialFiltered);
  }

  async function loadProducts() {
    const targets = document.querySelectorAll('[data-products]');
    if (!targets.length) return;

    try {
      const res = await fetch('data/products.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('products.json request failed');
      const products = await res.json();

      targets.forEach((container) => {
        const mode = container.getAttribute('data-products');
        if (mode === 'featured') {
          renderInto(container, products.filter((p) => p.isFeatured));
        } else if (mode === 'new') {
          renderInto(container, products.filter((p) => p.isNew));
        } else {
          initFilters(products, container);
        }
      });
    } catch (err) {
      console.warn('PALKI: products.json failed to load', err);
      targets.forEach((container) => {
        container.textContent = '';
        const msg = document.createElement('p');
        msg.className = 'state-message';
        msg.textContent = 'Products could not be loaded right now. Please refresh or check back shortly.';
        container.appendChild(msg);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', loadProducts);
})();
