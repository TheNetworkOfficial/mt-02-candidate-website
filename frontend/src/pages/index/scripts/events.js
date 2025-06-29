 /* Sort events by date and show only the four soonest.
 */
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("eventsList");
  if (!list) return;

  const items = Array.from(list.querySelectorAll("li"));

  items.sort((a, b) => {
    const dateA = new Date(a.dataset.date || a.querySelector("time").dateTime);
    const dateB = new Date(b.dataset.date || b.querySelector("time").dateTime);
    return dateA - dateB;
  });

  list.innerHTML = "";
  items.slice(0, 4).forEach((li) => list.appendChild(li));
});