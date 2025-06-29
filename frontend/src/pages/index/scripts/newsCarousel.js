/**
 * Simple carousel for the recent news section.
 */
document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector(".news-list");
  if (!list) return;

  const items = Array.from(list.children);
  const prevBtn = document.querySelector(".news-prev");
  const nextBtn = document.querySelector(".news-next");
  let current = 0;

  const show = (index) => {
    items.forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });
  };

  const next = () => {
    current = (current + 1) % items.length;
    show(current);
  };

  const prev = () => {
    current = (current - 1 + items.length) % items.length;
    show(current);
  };

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  show(0);
  setInterval(next, 15000);
});