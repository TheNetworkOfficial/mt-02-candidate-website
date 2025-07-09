import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Fetches the about markdown file, converts it to sanitized HTML,
 * and injects it into the about-content placeholder.
 */
async function loadAbout() {
  try {
    const response = await fetch("../../assets/content/about.md");
    const markdown = await response.text();
    const html = marked.parse(markdown);
    const sanitized = DOMPurify.sanitize(html);
    document.getElementById("about-content").innerHTML = sanitized;
  } catch (err) {
    console.error("Error loading about content", err);
    const placeholder = document.getElementById("about-content");
    if (placeholder) placeholder.textContent = "Failed to load content.";
  }
}

document.addEventListener("DOMContentLoaded", loadAbout);