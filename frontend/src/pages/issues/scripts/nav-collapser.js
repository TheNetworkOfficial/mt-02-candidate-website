/**
 * Initializes the collapsible navigation on the issues page.
 * When the toggle button is clicked, the navigation column is hidden
 * and the issues content expands to fill the space.
 */
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("issuesNavToggle");
  const wrapper = document.querySelector(".issues-wrapper");

  if (toggleBtn && wrapper) {
    toggleBtn.addEventListener("click", () => {
      wrapper.classList.toggle("collapsed");
    });
  }
});