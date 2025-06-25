document.addEventListener("DOMContentLoaded", () => {
  // 1) Grab the query‐string param "reptileDescription"
  const params = new URLSearchParams(window.location.search);
  const desc = params.get("reptileDescription");
  const reptileId = params.get("reptileId");
  const reptileImg = params.get("reptileImage");

  if (desc) {
    // 2) If there is a matching input on the page, populate it
    const reptileInput = document.getElementById("reptileDescription");
    if (reptileInput) {
      reptileInput.value = desc;
      // Prevent editing when passed from the details page
      reptileInput.readOnly = true;
      // 3) Dispatch a "change" event so formWizard.js picks up the new value
      reptileInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  if (reptileId) {
    const idInput = document.getElementById("reptileId");
    if (idInput) {
      idInput.value = reptileId;
    }
  }

  if (reptileImg) {
    const imgInput = document.getElementById("reptileImage");
    if (imgInput) {
      imgInput.value = reptileImg;
    }
  }
});