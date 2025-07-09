// importIssues.js
import { marked }  from "marked";
import DOMPurify   from "dompurify";

// raw imports of each Markdown file
import md_commitment  from "../../../assets/content/issues/commitment.md";
import md_economic    from "../../../assets/content/issues/economic.md";
import md_housing     from "../../../assets/content/issues/housing.md";
import md_immigration from "../../../assets/content/issues/immigration.md";
import md_agriculture from "../../../assets/content/issues/agriculture.md";
import md_energy      from "../../../assets/content/issues/energy.md";
import md_health      from "../../../assets/content/issues/health.md";
import md_education   from "../../../assets/content/issues/education.md";
import md_guns        from "../../../assets/content/issues/guns.md";
import md_social      from "../../../assets/content/issues/social.md";
import md_tribal      from "../../../assets/content/issues/tribal.md";

// map tab IDs → markdown content
const contentMap = {
  commitment:  md_commitment,
  economic:    md_economic,
  housing:     md_housing,
  immigration: md_immigration,
  agriculture: md_agriculture,
  energy:      md_energy,
  health:      md_health,
  education:   md_education,
  guns:        md_guns,
  social:      md_social,
  tribal:      md_tribal,
};

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
  }
});

// 2) Set up your tab-switching (if not already wired)
const buttons = document.querySelectorAll(".tab-button");
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const target = btn.dataset.target;

    // update the URL hash for bookmarking/sharing
    if (target) {
      window.location.hash = target;
    }

    // deactivate all
    document.querySelectorAll(".tab-content").forEach((div) => {
      div.classList.remove("active");
    });
    document.querySelectorAll(".tab-button").forEach((b) => {
      b.classList.remove("active");
    });

    // activate the clicked one
    document.getElementById(target).classList.add("active");
    btn.classList.add("active");
  });
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
