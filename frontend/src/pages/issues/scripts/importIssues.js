// importIssues.js
import { marked } from "marked";
import DOMPurify from "dompurify";

// raw imports of each Markdown file
import md_commitment from "../../../assets/content/issues/commitment.md";
import md_economic from "../../../assets/content/issues/economic.md";
import md_housing from "../../../assets/content/issues/housing.md";
import md_immigration from "../../../assets/content/issues/immigration.md";
import md_agriculture from "../../../assets/content/issues/agriculture.md";
import md_energy from "../../../assets/content/issues/energy.md";
import md_health from "../../../assets/content/issues/health.md";
import md_education from "../../../assets/content/issues/education.md";
import md_guns from "../../../assets/content/issues/guns.md";
import md_social from "../../../assets/content/issues/social.md";
import md_tribal from "../../../assets/content/issues/tribal.md";

// map tab IDs → markdown content
const contentMap = {
  commitment: md_commitment,
  economic: md_economic,
  housing: md_housing,
  immigration: md_immigration,
  agriculture: md_agriculture,
  energy: md_energy,
  health: md_health,
  education: md_education,
  guns: md_guns,
  social: md_social,
  tribal: md_tribal,
};

function enhanceContentSections(rootEl) {
  // Find all H2/H3 headings produced by Markdown
  const headings = Array.from(rootEl.querySelectorAll("h2, h3"));
  if (!headings.length) return;

  // If the very first heading is acting like the page title, keep it as-is
  let startIdx = 0;
  const first = headings[0];
  if (!first.previousElementSibling) startIdx = 1;

  for (let i = startIdx; i < headings.length; i++) {
    const h = headings[i];
    const details = document.createElement("details");
    details.className = "issue-accordion";
    // start all accordions closed

    // Theme accents based on common section names (optional, safe)
    const t = h.textContent.toLowerCase();
    if (t.includes("proposed")) details.dataset.theme = "policies";
    if (t.includes("how these policies")) details.dataset.theme = "benefits";

    const summary = document.createElement("summary");
    summary.innerHTML = h.innerHTML;
    details.appendChild(summary);

    const body = document.createElement("div");
    body.className = "issue-accordion-body";

    // Move siblings until the next H2/H3 into the accordion body
    let sib = h.nextSibling;
    while (
      sib &&
      !(sib.nodeType === 1 && /^(H2|H3)$/i.test(sib.tagName))
    ) {
      const next = sib.nextSibling;
      body.appendChild(sib);
      sib = next;
    }
    details.appendChild(body);

    // Replace heading with the details accordion
    h.replaceWith(details);
  }
}

function loadTabContent(id) {
  const raw = contentMap[id] || "";
  const html = marked.parse(raw);
  return DOMPurify.sanitize(html);
}

// 1) Inject Markdown into each tab-content div
Object.keys(contentMap).forEach((id) => {
  const container = document.getElementById(id);
  if (container) {
    container.innerHTML = loadTabContent(id);
    enhanceContentSections(container);
    // ensure all accordions start closed on each tab switch
    container.querySelectorAll("details").forEach(d => (d.open = false));
  }
});

// 2) Set up your tab-switching (with consistent scroll-to-top)
const buttons = document.querySelectorAll(".tab-button");
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const target = btn.dataset.target;

    // update the URL hash without causing native scroll
    if (target) {
      history.pushState(null, "", `#${target}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }

    // deactivate all
    document.querySelectorAll(".tab-content").forEach((div) => {
      div.classList.remove("active");
    });
    document.querySelectorAll(".tab-button").forEach((b) => {
      b.classList.remove("active");
    });

    // activate the clicked one
    const pane = document.getElementById(target);
    if (pane) pane.classList.add("active");
    btn.classList.add("active");

    // always scroll to top
    window.scrollTo(0, 0);
  });
});

// optional: handle browser back/forward
window.addEventListener("popstate", () => {
  const hash = window.location.hash.replace("#", "");
  const btn = document.querySelector(`.tab-button[data-target="${hash}"]`);
  if (btn) btn.click();
});

// 3) Optionally, activate the first tab on load
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.replace("#", "");
  const initialBtn = document.querySelector(
    `.tab-button[data-target="${hash}"]`,
  );
  if (initialBtn) {
    initialBtn.click();
  } else if (buttons[0]) {
    buttons[0].click();
  }
});
