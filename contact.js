/**
 * PALKI — contact.js
 * -----------------------------------------------------------------------
 * Client-side validation + submission for the contact form.
 *
 * Works out of the box with FormSubmit (https://formsubmit.co) using the
 * endpoint configured in data/settings.json -> contact.formEndpoint.
 * To switch providers:
 *   - EmailJS: replace the fetch() call in submitForm() with
 *     emailjs.send(serviceId, templateId, payload, publicKey) after
 *     loading the EmailJS SDK on the page.
 *   - Netlify Forms: add `data-netlify="true"` and a matching `name`
 *     attribute to the <form> in contact.html and let Netlify intercept
 *     the POST at build time; this script's fetch() can be left as-is
 *     since Netlify also accepts a standard form-encoded POST to "/".
 *
 * Includes a honeypot field (hp-field) as basic spam protection and a
 * placeholder hook for a CAPTCHA widget if one is added later.
 * -----------------------------------------------------------------------
 */

(function () {
  'use strict';

  function showFieldError(group, message) {
    group.classList.add('has-error');
    const errorEl = group.querySelector('.form-error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(group) {
    group.classList.remove('has-error');
    const errorEl = group.querySelector('.form-error');
    if (errorEl) errorEl.textContent = '';
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateForm(form) {
    let valid = true;

    const name = form.querySelector('#contact-name');
    const email = form.querySelector('#contact-email');
    const message = form.querySelector('#contact-message');

    [name, email, message].forEach((field) => field && clearFieldError(field.closest('.form-group')));

    if (!name || !name.value.trim()) {
      valid = false;
      showFieldError(name.closest('.form-group'), 'Please enter your name.');
    }

    if (!email || !email.value.trim()) {
      valid = false;
      showFieldError(email.closest('.form-group'), 'Please enter your email.');
    } else if (!isValidEmail(email.value.trim())) {
      valid = false;
      showFieldError(email.closest('.form-group'), 'Please enter a valid email address.');
    }

    if (!message || !message.value.trim()) {
      valid = false;
      showFieldError(message.closest('.form-group'), 'Please enter a short message.');
    } else if (message.value.trim().length < 10) {
      valid = false;
      showFieldError(message.closest('.form-group'), 'Message should be at least 10 characters.');
    }

    return valid;
  }

  function setStatus(statusEl, type, text) {
    statusEl.className = 'form-status is-' + type;
    statusEl.textContent = text;
  }

  async function submitForm(form, statusEl, submitBtn) {
    const settings = (window.PALKI && window.PALKI.settings) || {};
    const endpoint = (settings.contact && settings.contact.formEndpoint) || form.getAttribute('action');

    const formData = new FormData(form);

    // Honeypot check — if filled, silently "succeed" without sending.
    if (formData.get('company_website')) {
      setStatus(statusEl, 'success', 'Thank you — your message has been sent.');
      form.reset();
      return;
    }

    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || '',
      message: formData.get('message'),
      _subject: `New enquiry from ${formData.get('name') || 'PALKI website'}`
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      if (!endpoint) throw new Error('No form endpoint configured');

      const res = await fetch(endpoint.includes('formsubmit.co') && !endpoint.includes('/ajax/')
        ? endpoint.replace('formsubmit.co/', 'formsubmit.co/ajax/')
        : endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Submission failed with status ${res.status}`);

      setStatus(statusEl, 'success', 'Thank you — your message has been sent. We will reply within 1–2 business days.');
      form.reset();
      window.PALKI && window.PALKI.toast && window.PALKI.toast('Message sent successfully');
    } catch (err) {
      console.warn('PALKI: contact form submission failed', err);
      setStatus(statusEl, 'error', 'Something went wrong sending your message. Please try again, or reach us directly via WhatsApp, phone, or email above.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  }

  function init() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    const statusEl = form.querySelector('[data-form-status]');
    const submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      statusEl.className = 'form-status';
      statusEl.textContent = '';

      if (!validateForm(form)) {
        setStatus(statusEl, 'error', 'Please fix the highlighted fields and try again.');
        return;
      }
      submitForm(form, statusEl, submitBtn);
    });

    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => clearFieldError(field.closest('.form-group')));
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
