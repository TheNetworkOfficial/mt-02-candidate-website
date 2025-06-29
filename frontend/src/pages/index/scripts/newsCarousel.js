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
    const prevIndex = (index - 1 + items.length) % items.length;
    const nextIndex = (index + 1) % items.length;

    items.forEach((item) => item.classList.remove("prev", "active", "next"));
    items[prevIndex].classList.add("prev");
    items[index].classList.add("active");
    items[nextIndex].classList.add("next");
  };

  const next = () => {
    current = (current + 1) % items.length;
    show(current);
  };

  const prev = () => {
    current = (current - 1 + items.length) % items.length;
    show(current);
  };

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

  show(current);
  setInterval(next, 15000);
});