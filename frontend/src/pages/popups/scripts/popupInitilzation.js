document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // List all popup files to load
  let popupsToLoad = [
    "admin-add-skill-popup.html",
    "admin-add-animal-popup.html",
    "admin-health-inspections-popup.html",
    "admin-adoption-app-popup.html"
  ];
  let loadedPopupsCount = 0;

  // Function to set up popup events for a specific popup container
  function setupPopup(popupId, triggerSelector, closeButtonSelector) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    // 1) Always wire up the close-button
    const closeButton = popup.querySelector(closeButtonSelector);
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        popup.style.display = "none";
      });
    }

    // 2) Then wire up whatever triggers you have
    const triggers = document.querySelectorAll(triggerSelector);
    triggers.forEach(trigger => {
      trigger.addEventListener("click", e => {
        e.preventDefault();
        popup.style.display = "flex";
      });
    });

    if (triggers.length === 0) {
      console.warn(`No triggers found for selector ${triggerSelector}.`);
    }
  }

  // Initialize events for all popups using a configuration mapping
  function initializePopupEvents() {
    console.log("Initializing popup events...");
    const popupConfigurations = [
      {
        popupId: "skill-popup-container", // ID from admin-add-skill-popup.html
        triggerSelector: "#add-skill-btn"  // Button in adminSkills.html
      },
      {
        popupId: "animal-popup-container", // ID from admin-add-animal-popup.html
        triggerSelector: "#add-animal-btn" // Button in admin.html
      },
      {
        popupId: "inspection-popup-container", // ID from admin-inspection-popup.html
        triggerSelector: ".inspection-cell" // Button in admin.html
      },
      {
        popupId: "adoption-app-popup-container", // ID from admin-adoption-app-popup.html
        triggerSelector: ".view-app-btn" // Button in pendingAdoptionsTab.js
      }
    ];

    popupConfigurations.forEach((config) => {
      setupPopup(config.popupId, config.triggerSelector, ".close-button");
    });
  }

  // Load a popup's HTML and append it to the body
  function loadPopupHtml(popupFileName) {
    console.log(`Attempting to load ${popupFileName} into body`);
    const placeholder = document.body;
    fetch(popupFileName)
      .then((response) => response.text())
      .then((data) => {
        console.log(`Successfully loaded ${popupFileName}`);
        const popupContainer = document.createElement("div");
        popupContainer.innerHTML = data;
        placeholder.appendChild(popupContainer);
        loadedPopupsCount++;

        // Once all popups are loaded, initialize events and dispatch event
        if (loadedPopupsCount === popupsToLoad.length) {
          initializePopupEvents();
          document.dispatchEvent(new Event("popupsLoaded"));
        }
      })
      .catch((error) => {
        console.error(`Error loading ${popupFileName}:`, error);
        loadedPopupsCount++;
        if (loadedPopupsCount === popupsToLoad.length) {
          initializePopupEvents();
          document.dispatchEvent(new Event("popupsLoaded"));
        }
      });
  }

  // Load each popup file
  popupsToLoad.forEach((popupFileName) => {
    loadPopupHtml(popupFileName);
  });
});