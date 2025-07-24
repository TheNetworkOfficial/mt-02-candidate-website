/**
 * Initializes the collapsible navigation on the issues page.
 * When the toggle button is clicked, the navigation column is hidden
 * and the issues content expands to fill the space. On mobile, the
 * navigation is collapsed by default so only the hamburger icon shows.
 * Additionally, the page is scrolled to the top on load to ensure
 * the hamburger button is visible.
 */
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("issuesNavToggle");
  const wrapper = document.querySelector(".issues-wrapper");

  if (toggleBtn && wrapper) {
    // Collapse the navigation by default on small screens
    if (window.innerWidth <= 768) {
      wrapper.classList.add("collapsed");
    }

    toggleBtn.addEventListener("click", () => {
      wrapper.classList.toggle("collapsed");
    });
  }

  // Ensure the page starts scrolled to the top so the nav toggle is visible
  window.scrollTo(0, 0);
});