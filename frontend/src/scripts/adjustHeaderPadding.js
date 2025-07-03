// adjustHeaderPadding.js
/**
 * Adjust the body's padding so content isn't hidden behind the
 * fixed header.
 */
function updateHeaderPadding() {
  const header = document.querySelector(".site-header");
  if (header) {
    document.body.style.paddingTop = `${header.offsetHeight}px`;
  }
}

// Run after dynamic header/footer content is loaded
document.addEventListener("dynamicContentLoaded", updateHeaderPadding);

// Update padding on resize
window.addEventListener("resize", updateHeaderPadding);
