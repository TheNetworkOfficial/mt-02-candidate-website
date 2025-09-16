// Importing CSS files
import "./css/index.css";

// Importing JavaScript files
import "./scripts/events.js";
import fetchNews from "./scripts/fetchNews.js";
import initNewsCarousel from "./scripts/newsCarousel.js";
import "./scripts/ticker.js";
import initFinanceSummary from "../../scripts/initFinanceSummary.js";

document.addEventListener("DOMContentLoaded", async () => {
  await fetchNews();
  initNewsCarousel();
  initFinanceSummary();
});
