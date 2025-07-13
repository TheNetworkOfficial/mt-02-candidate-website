/* Sort events by date and show only the four soonest.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("eventsList");
  if (!list) return;

  try {
    const res = await fetch("/api/events");
    const data = await res.json();
    if (res.ok) {
      data
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
        .slice(0, 4)
        .forEach((ev) => {
          const li = document.createElement("li");
          li.innerHTML = `<a href="event.html?id=${ev.id}">
          <img src="${ev.thumbnailImage || "../../assets/images/hero/hero.jpg"}" alt="${ev.title}" />
            <h3>${ev.title}</h3>
            <time datetime="${ev.eventDate}">${new Date(ev.eventDate).toLocaleDateString()}</time>
          </a>`;
          list.appendChild(li);
        });
    } else {
      console.error("Failed to load events", data.error);
    }
  } catch (err) {
    console.error("Events fetch error:", err);
  }
});
