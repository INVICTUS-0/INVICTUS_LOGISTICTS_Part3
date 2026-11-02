"use strict";

const CONTACT_EMAIL = "info@invictuslogistics.co.za";
const PRIORITY_SURCHARGE = 0.25; // priority delivery costs 25% more

// Used only if data/services.json cannot be loaded (e.g. opened as a plain file).
const FALLBACK_RATES = {
  bay: { label: "Port & Bay Hauling", base: 1800, perKg: 1.2, leadDays: 2 },
  airport: { label: "Airport Hauling", base: 1500, perKg: 2.4, leadDays: 1 },
  mine: { label: "Mine Hauling", base: 3500, perKg: 0.8, leadDays: 3 },
};

const CATEGORY_LABELS = { bay: "Port & Bay", airport: "Airport", mine: "Mine" };
const TRACK_STAGES = [
  "Booked",
  "Picked up",
  "In transit",
  "Customs / gate clearance",
  "Out for delivery",
  "Delivered",
];

// Short selectors: $("css") finds one element, $$("css") finds all of them.
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];

// Builds an element in one go
// It uses textContent (not innerHTML) so user input can never inject HTML.
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

const pad = (n) => String(n).padStart(2, "0");
// Local date as YYYY-MM-DD (the format <input type="date"> uses).
const isoLocal = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => isoLocal(new Date());
const fmtZAR = (n) => "R " + Math.round(n).toLocaleString("en-ZA");
const fmtDate = (d) =>
  d.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/*  1. SMALL PAGE ENHANCEMENTS  */

// Footer year always current (also fixes the old "2024" on services.html).
function initFooterYear() {
  const p = $("footer p");
  if (p)
    p.innerHTML = `&copy; ${new Date().getFullYear()} INVICTUS Logistics. All rights reserved.`;
}

// Marks the nav link of the page you're on (styled in CSS with [aria-current]).
function initActiveNav() {
  const clean = (s) =>
    (s.split("/").pop() || "index").replace(".html", "") || "index";
  const here = clean(location.pathname);
  $$("header nav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href.includes("#") && clean(href) === here)
      a.setAttribute("aria-current", "page");
  });
}

// Close the mobile hamburger menu after a link is tapped.
function initMobileMenu() {
  const toggle = $("#menu-toggle");
  if (!toggle) return;
  $$("header nav a, header .nav-cta").forEach((a) =>
    a.addEventListener("click", () => (toggle.checked = false)),
  );
}

/*  2. ANIMATION: fade-up on scroll  */
// IntersectionObserver tells us when an element enters the screen.
// We add .reveal (starts invisible, see CSS) then .is-visible when seen.
function initScrollReveal() {
  const targets = $$(
    ".service-cards article, .steps li, #bay, #airports, #mines, .auth-card, fieldset, .accordion-item",
  );
  if (!("IntersectionObserver" in window)) return; // old browser: just show everything
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // animate once only
        }
      });
    },
    { threshold: 0.12 },
  );
  targets.forEach((t) => {
    t.classList.add("reveal");
    observer.observe(t);
  });
}

/*  3. INTERACTIVE: accordion (FAQ)  */
function initAccordion() {
  const triggers = $$(".accordion-trigger");
  if (!triggers.length) return;

  function setOpen(button, open) {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-expanded", String(open)); // screen readers read this
    panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px"; // CSS animates the change
  }

  triggers.forEach((button) => {
    button.addEventListener("click", () => {
      const willOpen = button.getAttribute("aria-expanded") !== "true";
      triggers.forEach((b) => setOpen(b, false)); // only one open at a time
      if (willOpen) setOpen(button, true);
    });
  });
}

/*  4. INTERACTIVE: image gallery with lightbox  */
// Any <img class="gallery-img"> opens bigger in a native <dialog>.
function initLightbox() {
  const images = $$("img.gallery-img");
  if (!images.length || typeof HTMLDialogElement === "undefined") return;

  // Build the lightbox once and reuse it for every image.
  const dialog = el("dialog", {
    class: "lightbox",
    "aria-label": "Enlarged image",
  });
  const closeBtn = el("button", {
    class: "lightbox-close",
    "aria-label": "Close image",
    text: "\u00D7",
  });
  const big = el("img", { alt: "" });
  const caption = el("p", { class: "lightbox-caption" });
  dialog.append(closeBtn, big, caption);
  document.body.append(dialog);

  function open(img) {
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    caption.textContent = img.alt;
    dialog.showModal(); // modal: page behind is inert, Esc closes it
  }

  images.forEach((img) => {
    img.tabIndex = 0; // reachable with the keyboard
    img.setAttribute("role", "button");
    img.addEventListener("click", () => open(img));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(img);
      }
    });
  });

  // Clicking the dark backdrop (the dialog element itself) or the X closes it.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target === closeBtn) dialog.close();
  });
}

/*  5. INTERACTIVE MAP (Leaflet + OpenStreetMap)  */
function initMap() {
  const box = $("#map");
  if (!box) return;
  if (typeof L === "undefined") {
    box.textContent =
      "The map could not be loaded. Please check your internet connection.";
    return;
  }
  const position = [-25.7479, 28.2293]; // [latitude, longitude] - change to your exact spot
  const map = L.map(box).setView(position, 12);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  L.marker(position)
    .addTo(map)
    .bindPopup(
      "<strong>INVICTUS Logistics</strong><br>123 Freight Way, City Deep<br>Pretoria, Gauteng",
    )
    .openPopup();
}

/*  6. AJAX: loading data/services.json  */
// fetch() asks the server for a file WITHOUT reloading the page (that is AJAX).
// We keep the promise so the file is only requested once, however many features use it.
let dataPromise = null;
function loadData() {
  if (!dataPromise) {
    dataPromise = fetch("data/services.json").then((response) => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    });
  }
  return dataPromise;
}

/*  7. DYNAMIC CONTENT: searchable / sortable cargo catalogue  */
async function initCatalogue() {
  const list = $("#catList");
  if (!list) return;
  const search = $("#catSearch");
  const category = $("#catCategory");
  const sort = $("#catSort");
  const count = $("#catCount");

  let items;
  try {
    items = (await loadData()).catalogue;
  } catch (err) {
    count.textContent =
      "The cargo catalogue could not be loaded right now. Please contact us directly.";
    return;
  }

  // One compare function per sort option.
  const sorters = {
    "name-asc": (a, b) => a.name.localeCompare(b.name),
    "price-asc": (a, b) => a.fromPrice - b.fromPrice,
    "price-desc": (a, b) => b.fromPrice - a.fromPrice,
  };

  function buildCard(item) {
    return el(
      "article",
      { class: "cat-card" },
      el("span", { class: "cat-tag", text: CATEGORY_LABELS[item.category] }),
      el("h3", { text: item.name }),
      el("p", { text: item.description }),
      el("p", {
        class: "cat-meta",
        text: `From ${fmtZAR(item.fromPrice)} \u00B7 ${item.turnaround}`,
      }),
      el("a", {
        href: "enquiry.html",
        class: "btn btn-secondary",
        text: "Enquire",
      }),
    );
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const results = items
      .filter((i) => category.value === "all" || i.category === category.value)
      .filter((i) =>
        `${i.name} ${i.description} ${i.keywords}`
          .toLowerCase()
          .includes(query),
      )
      .sort(sorters[sort.value]);

    list.replaceChildren(...results.map(buildCard)); // swap old cards for new ones
    count.textContent = results.length
      ? `Showing ${results.length} of ${items.length} cargo types.`
      : "No cargo types match your search. Try a different keyword.";
  }

  [search, category, sort].forEach((control) =>
    control.addEventListener("input", render),
  );
  render();
}

/*  8. FORM VALIDATION ENGINE (shared by every form)  */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+27|0)[1-9]\d{8}$/; // South African: 0721385814 or +27721385814
const NAME_RE = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F\s'.-]+$/;
const REF_RE = /^INV-\d{4}-\d{5}$/i; // e.g. INV-2026-00184

// Reads the human label of a field (used inside error messages).
function labelOf(field) {
  const label = field.id && $(`label[for="${field.id}"]`);
  const text = label ? label.textContent : field.name;
  return text.replace(/\(optional\)|:/gi, "").trim();
}

// Returns an error message string, or "" if the field is fine.
function getError(field) {
  const value = field.value.trim();
  const label = labelOf(field);

  if (field.required && !value) {
    return field.tagName === "SELECT"
      ? `Please select an option for "${label}".`
      : `${label} is required.`;
  }
  if (!value) return ""; // optional and empty: nothing to check

  if (field.type === "email" && !EMAIL_RE.test(value))
    return "Enter a valid email address, e.g. name@example.com.";
  if (field.type === "tel" && !PHONE_RE.test(value.replace(/[\s-]/g, "")))
    return "Enter a valid South African number, e.g. 072 138 5814 or +27 72 138 5814.";
  if (field.dataset.type === "name" && !NAME_RE.test(value))
    return "Use letters only (spaces, hyphens and apostrophes are fine).";
  if (field.dataset.type === "ref" && !REF_RE.test(value))
    return "Use the format INV-2026-00184.";
  if (field.minLength > 0 && value.length < field.minLength)
    return `${label} must be at least ${field.minLength} characters (you have ${value.length}).`;

  if (field.type === "number") {
    const n = Number(value);
    if (Number.isNaN(n)) return `${label} must be a number.`;
    if (field.min !== "" && n < Number(field.min))
      return `${label} must be at least ${field.min}.`;
    if (field.max !== "" && n > Number(field.max))
      return `${label} must be no more than ${field.max}.`;
  }
  if (field.type === "date" && value < todayISO())
    return "Please choose today or a future date.";
  return "";
}

// Shows (or clears) the red message under a field.
function showError(field, message) {
  const id = field.id + "-error";
  let box = document.getElementById(id);
  if (!box) {
    box = el("span", { class: "error-msg", id, role: "alert" });
    field.insertAdjacentElement("afterend", box);
  }
  box.textContent = message;
  field.classList.toggle("invalid", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));
  field.setAttribute("aria-describedby", id);
}

// Wires a form up: validate on blur, re-check while typing, validate all on submit.
// onValid(formData) is only called when every field passes.
function setupForm(form, onValid) {
  form.noValidate = true; // turn off the browser's own pop-ups; we show our own messages
  const fields = () =>
    $$("input, select, textarea", form).filter(
      (f) => !["checkbox", "hidden"].includes(f.type),
    );

  fields().forEach((field) => {
    field.addEventListener("blur", () => showError(field, getError(field)));
    field.addEventListener("input", () => {
      if (field.classList.contains("invalid"))
        showError(field, getError(field));
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // stop the page reloading - we handle it with JS
    let firstBad = null;
    fields().forEach((field) => {
      const message = getError(field);
      showError(field, message);
      if (message && !firstBad) firstBad = field;
    });
    if (firstBad) return firstBad.focus();
    onValid(new FormData(form));
  });
}

// Shows a result box, scrolls to it and moves keyboard focus there.
function revealPanel(panel) {
  panel.hidden = false;
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  panel.focus();
}

/*  9. ENQUIRY FORM: instant cost + availability response  */
function initEnquiry() {
  const form = $("#enquiryForm");
  if (!form) return;
  const panel = $("#enquiryResult");
  $("#pickupDate").min = todayISO(); // calendar greys out past dates

  setupForm(form, async (data) => {
    panel.replaceChildren(el("p", { text: "Calculating your estimate\u2026" }));
    revealPanel(panel);

    let rates;
    try {
      rates = (await loadData()).rates; // AJAX: no page reload
    } catch (err) {
      rates = FALLBACK_RATES;
    }

    const rate = rates[data.get("serviceType")];
    const weight = Number(data.get("weight"));
    const priority = data.get("speed") === "priority";

    let cost = rate.base + rate.perKg * weight;
    if (priority) cost *= 1 + PRIORITY_SURCHARGE;

    // Earliest pickup = today + lead time (priority saves a day).
    const earliest = new Date();
    earliest.setDate(
      earliest.getDate() + Math.max(0, rate.leadDays - (priority ? 1 : 0)),
    );
    const preferred = data.get("pickupDate");

    let availability;
    if (!preferred)
      availability = `Our earliest available pickup is ${fmtDate(earliest)}.`;
    else if (preferred >= isoLocal(earliest))
      availability = "Good news: your preferred pickup date is available.";
    else
      availability = `That date is too soon for this service. Our earliest pickup is ${fmtDate(earliest)}.`;

    const list = el("dl", { class: "result-list" });
    [
      ["Service", rate.label],
      ["Cargo weight", `${weight.toLocaleString("en-ZA")} kg`],
      ["Delivery speed", priority ? "Priority (+25%)" : "Standard"],
      ["Estimated cost", fmtZAR(cost)],
      ["Earliest pickup", fmtDate(earliest)],
    ].forEach(([term, detail]) =>
      list.append(el("dt", { text: term }), el("dd", { text: detail })),
    );

    panel.replaceChildren(
      el("h2", { text: "Your estimate" }),
      el("p", {
        text: `Thank you, ${data.get("fullName").trim()}. Here is what we can offer:`,
      }),
      list,
      el("p", { text: availability }),
      el("p", {
        class: "note",
        text: `This is an estimate only. Distance, access and handling can change the final price. We will confirm it by email at ${data.get("email").trim()} within one business day.`,
      }),
    );
    revealPanel(panel);
  });
}

/*  10. CONTACT FORM: builds an email the visitor can send  */
function initContact() {
  const form = $("#contactForm");
  if (!form) return;
  const panel = $("#contactPreview");

  setupForm(form, (data) => {
    const select = $("#contactSubject");
    const topic = select.options[select.selectedIndex].text;
    const name = data.get("name").trim();

    const subject = `[${topic}] Website message from ${name}`;
    const body = `Name: ${name}\nEmail: ${data.get("email").trim()}\nTopic: ${topic}\n\n${data.get("message").trim()}`;

    // mailto: opens the visitor's own email app with everything filled in.
    // encodeURIComponent makes spaces/line breaks/symbols safe inside a URL.
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    panel.replaceChildren(
      el("h2", { text: "Your message is ready" }),
      el("p", {
        text: "Check the email below, then press Send email to open it in your email app.",
      }),
      el("p", { class: "preview-line", text: `To: ${CONTACT_EMAIL}` }),
      el("p", { class: "preview-line", text: `Subject: ${subject}` }),
      el("pre", { class: "preview-body", text: body }),
      el("a", { href, class: "btn btn-primary", text: "Send email" }),
    );
    revealPanel(panel);
  });
}

/*  11. TRACK SHIPMENT: look up a reference  */
function initTrack() {
  const form = $("#trackForm");
  if (!form) return;
  const panel = $("#trackResult");

  setupForm(form, async (data) => {
    const ref = data.get("ref").trim().toUpperCase();
    let shipments;
    try {
      shipments = (await loadData()).shipments;
    } catch (err) {
      panel.replaceChildren(
        el("p", {
          text: "Tracking is unavailable right now. Please try again shortly.",
        }),
      );
      return revealPanel(panel);
    }

    const shipment = shipments[ref];
    if (!shipment) {
      panel.replaceChildren(
        el("h2", { text: "Shipment not found" }),
        el("p", {
          text: `We could not find ${ref}. Check the reference and try again (demo reference: INV-2026-00184).`,
        }),
      );
      return revealPanel(panel);
    }

    const timeline = el("ol", { class: "timeline" });
    TRACK_STAGES.forEach((stage, i) => {
      const date = shipment.dates[i] || "pending";
      const item = el("li", {
        text: `${stage} \u2014 ${date}${i === shipment.stage ? " (current stage)" : ""}`,
      });
      if (i === shipment.stage) item.className = "current";
      timeline.append(item);
    });

    panel.replaceChildren(
      el("h2", { text: `Shipment ${ref}` }),
      el("p", {
        text: `Service: ${shipment.service} \u00B7 From: ${shipment.from} \u00B7 To: ${shipment.to}`,
      }),
      timeline,
    );
    revealPanel(panel);
  });
}

/*  12. LOGIN / REGISTER (front-end validation only)  */
function initAuth() {
  $$("#account form").forEach((form) => {
    const status = el("p", { class: "form-status", role: "status" });
    form.after(status);
    setupForm(form, () => {
      status.textContent =
        "Details look good! (Demo only: accounts are not connected to a back-end yet.)";
      form.reset();
    });
  });
}

/*  START EVERYTHING  */
document.addEventListener("DOMContentLoaded", () => {
  initFooterYear();
  initActiveNav();
  initMobileMenu();
  initScrollReveal();
  initAccordion();
  initLightbox();
  initMap();
  initCatalogue();
  initEnquiry();
  initContact();
  initTrack();
  initAuth();
});
