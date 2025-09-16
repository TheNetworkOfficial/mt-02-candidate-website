/**
 * Simple carousel for the recent news section.
 */
export default function initNewsCarousel() {
  const list = document.querySelector(".news-list");
  if (!list) return;

  const items = Array.from(list.children);
  if (!items.length) {
    // Nothing to rotate through—leave the list as-is and disable controls.
    document.querySelector(".news-prev")?.setAttribute("disabled", "true");
    document.querySelector(".news-next")?.setAttribute("disabled", "true");
    return;
  }
  const prevBtn = document.querySelector(".news-prev");
  const nextBtn = document.querySelector(".news-next");
  let current = 0;

  const show = (index) => {
    const total = items.length;
    const prevIndex = (index - 1 + total) % total;
    const nextIndex = (index + 1) % total;

    items.forEach((item) => item.classList.remove("prev", "active", "next"));
    items[prevIndex]?.classList.add("prev");
    items[index]?.classList.add("active");
    if (total > 1) {
      items[nextIndex]?.classList.add("next");
    }
  };

  const next = () => {
    if (items.length <= 1) {
      return;
    }
    current = (current + 1) % items.length;
    show(current);
  };

  const prev = () => {
    if (items.length <= 1) {
      return;
    }
    current = (current - 1 + items.length) % items.length;
    show(current);
  };

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

  show(current);
  if (items.length > 1) {
    setInterval(next, 15000);
  }
}
