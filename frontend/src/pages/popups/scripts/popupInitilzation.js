// popupInitilzation.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // List all popup files to load
  let popupsToLoad = [
    "workInProgressPopup.html",
  ];
  let loadedPopupsCount = 0;

  // Function to set up popup events for a specific popup container
  function setupPopup(popupId, triggerSelector, closeButtonSelector) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    // 1) Always wire up the close‑button
    const closeButton = popup.querySelector(closeButtonSelector);
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        popup.style.display = "none";
      });
    }

    // 2) Only wire up triggers if a valid selector string was passed
    if (typeof triggerSelector === 'string' && triggerSelector.trim()) {
      const triggers = document.querySelectorAll(triggerSelector);
      triggers.forEach(trigger => {
        trigger.addEventListener("click", e => {
          e.preventDefault();
          popup.style.display = "flex";
        });
      });
      if (triggers.length === 0) {
        console.warn(`No triggers found for selector "${triggerSelector}".`);
      }
    }
  }

  // Initialize popup wiring and session‑only display
  function initializePopupEvents() {
    // Wire up only the close‑buttons (no click‑triggers)
    setupPopup("workInProgressPopup", null, ".close-button");

    // Show the popup once per session after all popups have loaded
    document.addEventListener("popupsLoaded", () => {
      if (!sessionStorage.getItem("popupDisplayed")) {
        sessionStorage.setItem("popupDisplayed", "true");
        const popup = document.getElementById("workInProgressPopup");
        if (popup) popup.style.display = "flex";
      }
    });
  }

  // Load each popup HTML into the DOM
  function loadPopupHtml(popupFileName) {
    fetch(`/popups/${popupFileName}`)
      .then(response => response.text())
      .then(html => {
        const container = document.createElement("div");
        container.innerHTML = html;
        document.body.appendChild(container);

        loadedPopupsCount++;
        if (loadedPopupsCount === popupsToLoad.length) {
          initializePopupEvents();
          document.dispatchEvent(new Event("popupsLoaded"));
        }
      })
      .catch(error => {
        console.error(`Error loading ${popupFileName}:`, error);
        loadedPopupsCount++;
        if (loadedPopupsCount === popupsToLoad.length) {
          initializePopupEvents();
          document.dispatchEvent(new Event("popupsLoaded"));
        }
      });
  }

  // Kick off loading of all popups
  popupsToLoad.forEach(popupFileName => {
    loadPopupHtml(popupFileName);
  });
});
