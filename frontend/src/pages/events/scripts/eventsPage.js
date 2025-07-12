// eventsPage.js

document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("eventsList");
  if (!list) return;

  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");

  const items = [];

  try {
    const res = await fetch("/api/events");
    const data = await res.json();
    if (res.ok) {
      data.forEach((ev) => {
        const li = document.createElement("li");
        li.dataset.id = ev.id;
        li.dataset.name = ev.title;
        li.dataset.location = ev.location || "";
        li.dataset.datetime = ev.eventDate;
        li.dataset.about = ev.description || "";
        li.innerHTML = `
          <img src="../../assets/images/hero/hero.jpg" alt="${ev.title}" class="events-thumb" />
          <div class="events-info">
            <h3>${ev.title}</h3>
            <time datetime="${ev.eventDate}">${new Date(ev.eventDate).toLocaleString()}</time>
            <p class="events-location">${ev.location || ""}</p>
          </div>
          <a href="#" class="details-btn">See details &amp; more times <i class="fas fa-arrow-right"></i></a>`;
        list.appendChild(li);
        items.push(li);
      });
    } else {
      console.error("Events load failed", data.error);
    }
  } catch (err) {
    console.error("Events fetch error:", err);
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // Add "Today" tag to events happening today
  items.forEach((li) => {
    const dt = li.dataset.datetime;
    if (!dt) return;
    if (dt.startsWith(todayStr)) {
      const tag = document.createElement("span");
      tag.className = "event-tag-today";
      tag.textContent = "Today";
      const info =
        li.querySelector(".events-info") || li.querySelector(".event-info");
      if (info) info.appendChild(tag);
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
  items.sort(
    (a, b) => new Date(a.dataset.datetime) - new Date(b.dataset.datetime),
  );
  items.forEach((li) => list.appendChild(li));

  filterEvents();

  // open event detail page when clicking Details
  items.forEach((li) => {
    const btn = li.querySelector(".details-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        window.location.href = `event.html?id=${li.dataset.id}`;
      });
    }
  });
});