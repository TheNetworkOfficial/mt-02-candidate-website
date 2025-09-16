// Importing CSS files
import "./css/index.css";

// Importing JavaScript files
import "./scripts/events.js";
import fetchNews from "./scripts/fetchNews.js";
import initNewsCarousel from "./scripts/newsCarousel.js";
import "./scripts/ticker.js";
import initFinanceSummary from "../../scripts/initFinanceSummary.js";

const initializeNewsSection = async () => {
  try {
    await fetchNews();
  } catch (error) {
    console.error("Failed to load news entries", error);
  }

  try {
    initNewsCarousel();
  } catch (error) {
    console.error("Failed to initialize news carousel", error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initializeNewsSection();

  try {
    initFinanceSummary();
  } catch (error) {
    console.error("Failed to initialize finance summary", error);
  }
});
