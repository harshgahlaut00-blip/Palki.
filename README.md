# PALKI — Luxury Clothing Website

A premium, static demo storefront for a luxury clothing brand. No build tools,
no framework, no backend required — plain HTML, CSS and modular JavaScript,
with (almost) every piece of content editable through JSON files.

---

## 1. Quick start

Because the site loads data with `fetch()`, opening `index.html` directly
from the file system (`file://`) will block those requests in most browsers.
Serve the folder locally instead:

```bash
# Option A — Python
python3 -m http.server 8080

# Option B — Node
npx serve .
```

Then open `http://localhost:8080`.

---

## 2. Editing content (no coding required)

Almost everything on the site lives in `data/*.json`. Edit these with any
text editor and refresh the page — no HTML changes needed.

| File | Controls |
|---|---|
| `data/settings.json` | Brand name & logo, hero text/image, brand story, about page copy (vision/mission/values), stats, "why choose us" cards, contact details, WhatsApp number, theme colors & fonts, footer text, **developer credit** |
| `data/products.json` | Every product: name, category, price, rating, images, description, "New"/"Featured" flags |
| `data/testimonials.json` | Customer testimonial slider on the home page |
| `data/collections.json` | The three "Featured Collections" tiles on the home page |
| `data/social.json` | Instagram gallery images and social media links |

### Replacing images
All images currently point to royalty-free Unsplash placeholder URLs so the
demo looks complete out of the box. Replace any `image` field in the JSON
files with your own file path (e.g. `assets/images/coat-01.jpg`) once you've
added real product photography to `assets/images/`.

### Replacing the logo & favicon
- Swap `assets/logo/palki-logo.svg` with your real logo (or just edit
  `brand.logoText` in `settings.json` if you're using a text wordmark).
- Swap `assets/icons/favicon.svg` with a branded favicon, and add PNG
  fallbacks (`apple-touch-icon.png`, etc.) referenced in each page's `<head>`.

### Developer credit (footer)
Edit `developer` in `settings.json`:

```json
"developer": {
  "name": "HARSH",
  "credit": "Website Designed & Developed by HARSH",
  "whatsapp": "https://wa.me/91XXXXXXXXXX",
  "instagram": "https://instagram.com/yourhandle",
  "email": "mailto:you@example.com",
  "portfolio": "https://your-portfolio.example"
}
```

---

## 3. Connecting the contact form

The form in `contact.html` already validates input and shows success/error
states. By default it's wired for **FormSubmit** using the endpoint in
`settings.json` → `contact.formEndpoint`.

- **FormSubmit** — set `contact.formEndpoint` to
  `https://formsubmit.co/your-email@example.com`. The first submission
  triggers a confirmation email you must approve once.
- **EmailJS** — load the EmailJS SDK on `contact.html`, then replace the
  `fetch()` call inside `submitForm()` in `js/contact.js` with
  `emailjs.send(serviceId, templateId, payload, publicKey)`.
- **Netlify Forms** — add `data-netlify="true"` and a `name` attribute to
  the `<form>` in `contact.html`; Netlify intercepts the POST automatically
  once deployed on their platform.

The form includes a hidden honeypot field (`company_website`) for basic
spam protection, plus a commented placeholder for a CAPTCHA widget
(hCaptcha/reCAPTCHA) if spam volume ever warrants one.

---

## 4. Folder structure

```
PALKI/
  index.html / about.html / products.html / contact.html / 404.html
  robots.txt / sitemap.xml / manifest.json
  assets/{images,icons,logo,videos}
  css/{variables,style,components,animations,responsive}.css
  js/{app,ui,products,animations,contact}.js
  data/{settings,products,testimonials,collections,social}.json
```

---

## 5. Deployment

Static hosting only, HTTPS enabled by default on all three:

- **Vercel** — `vercel deploy` from this folder, or drag-and-drop in the dashboard.
- **Netlify** — drag-and-drop the folder into Netlify Drop, or connect a Git repo.
- **Cloudflare Pages** — connect a Git repo, build command: none, output directory: `/`.

Update `settings.seo.siteUrl`, `robots.txt`, and `sitemap.xml` with your real
domain before going live.

---

## 6. Security notes

- All dynamic content is inserted with `textContent`/safe DOM methods —
  never `innerHTML` with data from the JSON files — to avoid XSS.
- The contact form validates required fields client-side and includes a
  honeypot field; still validate/sanitize on whichever backend or form
  service ultimately receives submissions.
- No API keys or secrets are stored in this codebase.
- This project follows secure coding practices but, like any site, is not
  "unhackable" — keep dependencies (Google Fonts, your hosting platform,
  any form service) up to date and review third-party embeds (e.g. the
  Google Maps iframe) periodically.

---

Website Designed & Developed by **HARSH**.
