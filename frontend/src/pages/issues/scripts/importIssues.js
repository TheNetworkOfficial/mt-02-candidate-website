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

function buildProposalAccordions(container) {
  const headings = Array.from(container.querySelectorAll("h2"));
  const proposalsHeading = headings.find((heading) =>
    heading.textContent.toLowerCase().includes("proposed policies"),
  );

  if (!proposalsHeading) return;

  const isHeading = (node, level) =>
    node &&
    node.nodeType === 1 &&
    node.tagName.toUpperCase() === `H${level}`;

  let cursor = proposalsHeading.nextSibling;

  while (cursor) {
    if (cursor.nodeType === 1 && cursor.tagName === "H2") break;

    if (isHeading(cursor, 3)) {
      const proposalHeading = cursor;
      const details = document.createElement("details");
      details.className = "issue-proposal";
      details.open = false;

      const summary = document.createElement("summary");
      summary.innerHTML = proposalHeading.innerHTML;
      details.appendChild(summary);

      const body = document.createElement("div");
      body.className = "issue-proposal-body";

      const sections = [];
      let nextNode = proposalHeading.nextSibling;

      while (
        nextNode &&
        !(
          (isHeading(nextNode, 3) || isHeading(nextNode, 2)) &&
          nextNode !== proposalHeading
        )
      ) {
        const current = nextNode;
        nextNode = current.nextSibling;

        // Ignore whitespace or comment nodes so they don't create empty sections
        if (
          current.nodeType === Node.TEXT_NODE &&
          current.textContent.trim().length === 0
        ) {
          current.remove();
          continue;
        }

        if (current.nodeType === Node.COMMENT_NODE) {
          current.remove();
          continue;
        }

        if (isHeading(current, 4)) {
          const sectionWrapper = document.createElement("div");
          sectionWrapper.className = "issue-proposal-section";
          const sectionHeading = document.createElement("h4");
          sectionHeading.innerHTML = current.innerHTML;
          sectionWrapper.appendChild(sectionHeading);
          sections.push(sectionWrapper);
          body.appendChild(sectionWrapper);
          current.remove();
        } else {
          let targetSection = sections[sections.length - 1];
          if (!targetSection) {
            targetSection = document.createElement("div");
            targetSection.className = "issue-proposal-section";
            sections.push(targetSection);
            body.appendChild(targetSection);
          }
          targetSection.appendChild(current);
        }
      }

      if (!sections.length) {
        const fallback = document.createElement("div");
        fallback.className = "issue-proposal-section";
        fallback.innerHTML = "<p>No additional information provided.</p>";
        body.appendChild(fallback);
      }

      details.appendChild(body);
      const replacementAnchor = nextNode;
      proposalHeading.replaceWith(details);
      cursor = replacementAnchor;
      continue;
    }

    cursor = cursor.nextSibling;
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
    buildProposalAccordions(container);
    // ensure all accordions start closed on each tab switch
    container
      .querySelectorAll("details")
      .forEach((d) => {
        d.open = false;
      });
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
