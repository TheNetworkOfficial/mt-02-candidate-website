// highlightActiveMenu.js
// Highlights current page in desktop and mobile navigation menus

document.addEventListener("dynamicContentLoaded", () => {
  const currentPath = window.location.pathname.split("/").pop();
  const currentHash = window.location.hash;

  const highlightLinks = (container) => {
    const links = container.querySelectorAll("a");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      const [path, hash] = href.split("#");
      const fullHash = hash ? `#${hash}` : "";
      if (
        path === currentPath &&
        (fullHash === "" || fullHash === currentHash)
      ) {
        link.classList.add("active");
        const dropdown = link.closest(".mobile-dropdown");
        if (dropdown) {
          dropdown.classList.add("open");
          const toggle = dropdown.querySelector(".submenu-toggle");
          if (toggle) toggle.setAttribute("aria-expanded", "true");
        }
      }
    });
  };

  const desktopNav = document.querySelector(".nav-list");
  const mobileNav = document.querySelector(".nav-list-mobile");

  if (desktopNav) highlightLinks(desktopNav);
  if (mobileNav) highlightLinks(mobileNav);
});