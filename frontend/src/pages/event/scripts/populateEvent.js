// Populate event details
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  let eventData = null;
  if (id) {
    try {
      const res = await fetch(`/api/events/${id}`);
      eventData = await res.json();
      if (!res.ok) throw new Error(eventData.error || "Failed to load event");
    } catch (err) {
      console.error("Event fetch error:", err);
    }
  }

  if (!eventData) {
    eventData = {
      name: params.get("name"),
      type: params.get("type"),
      eventDate: params.get("datetime"),
      location: params.get("location"),
      description: params.get("about"),
      access: params.get("access"),
      map: params.get("map"),
      id,
    };
  }

  if (eventData.id) {
    document.getElementById("eventId").value = eventData.id;
  }
  const img = document.getElementById("eventImage");
  if (img) {
    img.src =
      eventData.thumbnailImage || "../../assets/images/hero/hero.jpg";
    if (eventData.name) img.alt = eventData.name;
  }
  if (eventData.name)
    document.getElementById("eventName").textContent = eventData.name;
  if (eventData.type)
    document.getElementById("eventType").textContent = eventData.type;
  if (eventData.eventDate) {
    const dt = new Date(eventData.eventDate);
    document.getElementById("eventDateTime").textContent = dt.toLocaleString();
  }
  let mapUrl = null;
  if (eventData.location) {
    const link = document.getElementById("eventLocationLink");
    link.textContent = eventData.location;
    mapUrl =
      eventData.map ||
      `https://maps.google.com/?q=${encodeURIComponent(eventData.location)}`;
    link.href = mapUrl;
  }
  if (eventData.description)
    document.getElementById("eventAbout").textContent = eventData.description;
  if (eventData.access)
    document.getElementById("accessibilityNotice").textContent =
      eventData.access;
  if (mapUrl) {
    document.getElementById("mapEmbed").innerHTML =
      `<iframe src="${mapUrl}&output=embed" loading="lazy"></iframe>`;
  }
});