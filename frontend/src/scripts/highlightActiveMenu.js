// highlightActiveMenu.js
// Highlights current page in desktop and mobile navigation menus

document.addEventListener("dynamicContentLoaded", () => {
  const desktopNav = document.querySelector(".nav-list");
  const mobileNav = document.querySelector(".nav-list-mobile");

  const highlightLinks = () => {
    const currentPath = window.location.pathname.split("/").pop();
    const currentHash = window.location.hash;
    [desktopNav, mobileNav].forEach((container) => {
      if (!container) return;
      const links = container.querySelectorAll("a");
      links.forEach((link) => link.classList.remove("active"));
      const dropdown = container.querySelector(".mobile-dropdown");
      if (dropdown) {
        dropdown.classList.remove("open");
        const toggle = dropdown.querySelector(".submenu-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
      links.forEach((link) => {
        const href = link.getAttribute("href");
        const [path, hash] = href.split("#");
        const fullHash = hash ? `#${hash}` : "";
        if (
          path === currentPath &&
          (fullHash === "" || fullHash === currentHash)
        ) {
          link.classList.add("active");
          const parentDropdown = link.closest(".mobile-dropdown");
          if (parentDropdown) {
            parentDropdown.classList.add("open");
            const toggle = parentDropdown.querySelector(".submenu-toggle");
            if (toggle) toggle.setAttribute("aria-expanded", "true");
          }
        }
      });
    });
  };

  highlightLinks();
  window.addEventListener("hashchange", highlightLinks);
});
