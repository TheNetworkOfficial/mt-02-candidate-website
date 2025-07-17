// headerBehavior.js
let lastScrollTop = 0;

window.addEventListener(
  "scroll",
  function () {
  const siteHeader = document.querySelector(".site-header");
  if (!siteHeader) return;             // ← bail out if header not in DOM
  const currentScroll = window.scrollY || document.documentElement.scrollTop;
  if (currentScroll > lastScrollTop) {
    siteHeader.style.top = "-160px";
  } else {
    siteHeader.style.top = "0px";
  }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  },
  false,
);
