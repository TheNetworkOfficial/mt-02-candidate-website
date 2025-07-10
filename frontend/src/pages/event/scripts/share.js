// share.js

/**
 * Basic share functionality for event page.
 * Handles Facebook, Bluesky (opens new post), email mailto, and copy link.
 */

document.querySelectorAll(".share-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const url = window.location.href;
    const type = btn.dataset.share;
    if (type === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank",
      );
    } else if (type === "bluesky") {
      window.open(
        `https://bsky.app/intent/compose?text=${encodeURIComponent(url)}`,
        "_blank",
      );
    } else if (type === "email") {
      window.location.href = `mailto:?subject=Check%20out%20this%20event&body=${encodeURIComponent(url)}`;
    } else if (type === "copy") {
      navigator.clipboard.writeText(url).then(() => alert("Link copied"));
    }
  });
});