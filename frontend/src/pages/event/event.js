// Import CSS
import "./css/event.css";

// Import scripts
import "./scripts/eventSubmit.js";
import "./scripts/share.js";

// Populate event details from query parameters
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const type = params.get("type");
  const datetime = params.get("datetime");
  const location = params.get("location");
  const about = params.get("about");
  const access = params.get("access");
  const map = params.get("map");

  if (name) document.getElementById("eventName").textContent = name;
  if (type) document.getElementById("eventType").textContent = type;
  if (datetime) {
    const dt = new Date(datetime);
    document.getElementById("eventDateTime").textContent = dt.toLocaleString();
  }
  if (location) {
    const link = document.getElementById("eventLocationLink");
    link.textContent = location;
    link.href =
      map || `https://maps.google.com/?q=${encodeURIComponent(location)}`;
  }
  if (about) document.getElementById("eventAbout").textContent = about;
  if (access)
    document.getElementById("accessibilityNotice").textContent = access;
  if (map) {
    document.getElementById("mapEmbed").innerHTML =
      `<iframe src="${map}&output=embed" loading="lazy"></iframe>`;
  }
});