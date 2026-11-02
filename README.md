# INVICTUS_LOGISTICTS_Part3
# INVICTUS Logistics

## Student Information
- Name: Mphidi Asakundwi
- Student number: ST10521417
- Module code: WEDE5020
- Submission: Part 3
  
A responsive website for **INVICTUS Logistics**, a fictional Gauteng-based company that hauls bulk and industrial cargo from ports and bays, airports and mine sites for small and medium businesses.

**Live site:** <add your Netlify / GitHub Pages link here>
**Author:** ASAKUNDWI MPHIDI ST10521417


---

## Pages

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Introduction, services snapshot, how it works, login / register |
| About Us | `about.html` | Company story, mission, vision and target audience |
| Services | `services.html` | The three hauling services, searchable cargo catalogue and FAQ |
| Enquiry | `enquiry.html` | Enquiry form that returns a cost estimate and availability |
| Contact | `contact.html` | Contact form that builds an email, business details and map |
| Track Shipment | `track.html` | Look up a shipment by reference number |

## Project structure

```
├── index.html, about.html, services.html, enquiry.html, contact.html, track.html
├── css/style.css          All styling (Part 2 + Part 3 additions at the bottom)
├── js/main.js             All JavaScript (Part 3)
├── data/services.json     Rates, cargo catalogue and demo shipment (loaded with fetch)
├── images/                Logo and photographs
├── robots.txt             Crawler instructions
├── sitemap.xml            List of pages for search engines
└── _headers               Security headers (used by Netlify)
```

## Features (Part 3)

### JavaScript interactivity
- **Accordion:** FAQ section on the Services page.
- **Image lightbox:** service images open enlarged in a native `<dialog>`.
- **Interactive map:** Leaflet with OpenStreetMap on the Contact page.
- **Animations and transitions:** scroll fade-up (IntersectionObserver + CSS), accordion slide; reduced-motion preference respected.
- **DOM manipulation:** elements created with `createElement`, `replaceChildren` and `insertAdjacentElement`; the current page is marked in the navigation.
- **Dynamic content:** the cargo catalogue is loaded from `data/services.json` with `fetch()` and can be searched, filtered by pickup point and sorted by name or price.

### Forms and validation
- **Enquiry form:** after validation it shows an estimated cost, the earliest pickup date and an availability message, without reloading the page. Rates are loaded asynchronously (AJAX).
- **Contact form:** after validation it compiles an email (recipient, subject and body) and offers a **Send email** button that opens the visitor's email app addressed to `info@invictuslogistics.co.za`.
- **Client-side validation (JavaScript):** required fields, email format, South African phone number format, letters-only names, tracking reference format, minimum lengths, number ranges and no past dates. Errors appear next to the field and the first invalid field receives focus.
- **Track Shipment:** looks up a reference (demo reference: `INV-2026-00184`).
- Login and register forms are validated on the front end only; there is no back end yet.

### Search Engine Optimisation
- **Keywords used:** freight hauling Gauteng, bulk cargo transport, port and bay hauling, airport cargo collection, mine hauling, container transport, shipment tracking, logistics for small businesses.
- Unique `<title>` and meta description on every page.
- Logical heading structure (one `<h1>` per page, then `<h2>` and `<h3>`).
- Descriptive image file names and alt text; lazy loading for below-the-fold images.
- Clean, descriptive file names and internal links between pages.
- Canonical link and Open Graph / Twitter tags on every page.
- Local SEO: `LocalBusiness` structured data (JSON-LD) with address, hours and area served.
- `robots.txt` and `sitemap.xml`.
- Mobile-friendly responsive layout with a hamburger menu on small screens.
- Off-page SEO plan: list the business on Google Business Profile, request backlinks from supplier and client sites, and share the site on social media.

### Security and performance
- `_headers` file with Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy.
- User text is inserted with `textContent`, never `innerHTML`, to prevent HTML injection.
- Leaflet is loaded with Subresource Integrity hashes.
- Scripts use `defer`; the hero image uses `fetchpriority="high"`.

## Running the project locally

1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

Live Server (or any web server) is needed because the catalogue and enquiry load `data/services.json` with `fetch()`, which browsers block when a page is opened directly from the file system.

## Deployment

The site is deployed as a static site on **Netlify**. The project folder was uploaded using Netlify's manual deploy, so no build command is required. If you deploy to GitHub Pages instead, `_headers` is ignored.

---

## Changelog

### Part 3

**Feedback from Part 2**

- Fixed typo "prcing" to "pricing" in `index.html` (How it works, step 2).
- `contact.html`: added the missing closing `</footer>` tag.
- `services.html`: footer year corrected from 2024 to 2026; "Login / Register" link changed from `#account` to `index.html#account`, because that section is on the home page.
- All pages: "Pretoria,Gauteng" changed to "Pretoria, Gauteng" in the footer. The footer year is now also set automatically by JavaScript.
- Mobile navigation: the hamburger toggle only existed on `index.html`, so the menu disappeared on small screens on every other page. It was added to `about.html`, `services.html`, `enquiry.html`, `contact.html` and `track.html`.
- `quote.html` (now `enquiry.html`): removed whitespace inside the textarea that made an empty field look filled in.
- Renamed `quote.html` to `enquiry.html` as required by the Part 3 brief, and updated every link to it.

**New: JavaScript (`js/main.js`)**
- Accordion (FAQ) on `services.html`.
- Lightbox for the service images on `services.html`.
- Leaflet + OpenStreetMap map with marker and popup on `contact.html`.
- Scroll fade-up animation, accordion slide transition and reduced-motion support.
- Advanced DOM manipulation and active navigation link.
- Cargo catalogue loaded with `fetch()` from `data/services.json` with search, filter and sort.
- Shipment lookup on `track.html`.

**New: forms**
- JavaScript validation with inline error messages on every form.
- `enquiry.html`: added a "Delivery speed" field; the form returns an estimated cost, earliest pickup date and availability message without reloading.
- `contact.html`: validated message is compiled into an email with a **Send email** button.

**New: SEO**
- Keyword-focused title and meta description added to `index.html`; canonical and Open Graph tags on all pages.
- `LocalBusiness` structured data on `index.html`.
- Added `robots.txt` and `sitemap.xml`.
- Lazy loading on service images; `fetchpriority="high"` on the hero image.

**New: security and deployment**
- Added `_headers` with security headers.
- Deployed to a free hosting platform (see the live site link above).

### Part 1 - [2026/08/14]
Added 
- Initial repository structure and README.
- Two website proposals (INVICTUS Logistics, Ubuntu Community Library).
- Raw semantic HTML for all six INIVICTUS Logistic pages.
- Sitemap documentation.

### Part 2 Details[2026/09/18]

Part 2 Covered
- Added external stylesheet (`css/style.css`) linked across all pages
- Styled header/nav, hero section, service cards, forms, auth cards, timeline and footer
- Added responsive breakpoints at 600px and 900px

##Testing
The site was tested manually across the following:

- **Cross-page navigation** — every nav link, footer link and button checked on all six pages
- **Responsive layout** — checked at mobile, tablet (≥600px) and desktop (≥900px) breakpoints using Chrome DevTools device toolbar
- **Forms** — login, register, contact, quote and tracking forms checked for required-field validation and correct input types
- **HTML/CSS validation** — all pages run through the [W3C Markup Validator](https://validator.w3.org/) and [CSS Validator](https://jigsaw.w3.org/css-validator/)
- **Keyboard accessibility** — tab order and `:focus-visible` states checked on interactive elements

---

## References

- MDN Web Docs. *HTML, CSS and JavaScript reference*. https://developer.mozilla.org
- MDN Web Docs. *Using the Fetch API*. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- MDN Web Docs. *Intersection Observer API*. https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- MDN Web Docs. *The Dialog element*. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
- Leaflet. *Leaflet quick start guide*. https://leafletjs.com/examples/quick-start/
- OpenStreetMap contributors. *OpenStreetMap*. https://www.openstreetmap.org/copyright
- Google Search Central. *SEO starter guide*. https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Schema.org. *LocalBusiness*. https://schema.org/LocalBusiness
- W3C Web Accessibility Initiative. *Accordion pattern (WAI-ARIA Authoring Practices)*. https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
- Netlify Docs. *Deploy a static site*. https://docs.netlify.com
- Anthropic. Claude (AI assistant), used for code assistance and explanations during development.
