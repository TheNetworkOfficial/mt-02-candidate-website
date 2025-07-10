// eventsPage.js

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("eventsList");
  if (!list) return;

  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");

  const items = Array.from(list.querySelectorAll("li"));

  const todayStr = new Date().toISOString().split("T")[0];

  // Add "Today" tag to events happening today
  items.forEach((li) => {
    const dt = li.dataset.datetime || li.querySelector("time").dateTime;
    if (!dt) return;
    if (dt.startsWith(todayStr)) {
      const tag = document.createElement("span");
      tag.className = "event-tag-today";
      tag.textContent = "Today";
      const info = li.querySelector(".event-info");
      info.appendChild(tag);
    }
  });

  /**
   * Filter and display events based on search term and dropdown filter.
   */
  function filterEvents() {
    const term = searchInput.value.toLowerCase();
    const filter = filterSelect.value;
    const now = new Date();

    items.forEach((li) => {
      const name = li.dataset.name.toLowerCase();
      const location = li.dataset.location.toLowerCase();
      const text = `${name} ${location}`;
      const dt = new Date(li.dataset.datetime);

      let visible = text.includes(term);

      if (filter === "today") {
        visible = visible && dt.toDateString() === now.toDateString();
      } else if (filter === "upcoming") {
        visible = visible && dt >= now;
      } else if (filter === "past") {
        visible = visible && dt < now;
      }

      li.style.display = visible ? "flex" : "none";
    });
  }

  searchInput.addEventListener("input", filterEvents);
  filterSelect.addEventListener("change", filterEvents);

  // initial sort by date ascending
  items.sort(
    (a, b) => new Date(a.dataset.datetime) - new Date(b.dataset.datetime),
  );
  items.forEach((li) => list.appendChild(li));

  filterEvents();

  // open event detail page when clicking Details
  items.forEach((li) => {
    const btn = li.querySelector('.details-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const params = new URLSearchParams();
        ['name','type','datetime','location','about','access','map'].forEach((k) => {
          if (li.dataset[k]) params.set(k, li.dataset[k]);
        });
        window.location.href = `event.html?${params.toString()}`;
      });
    }
  });
});