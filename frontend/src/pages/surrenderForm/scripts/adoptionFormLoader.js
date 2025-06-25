document.addEventListener('DOMContentLoaded', () => {
  // 1) Grab the query‐string param "reptileDescription"
  const params = new URLSearchParams(window.location.search);
  const desc = params.get('reptileDescription');

  if (desc) {
    // 2) If there is a matching input on the page, populate it
    const reptileInput = document.getElementById('reptileDescription');
    if (reptileInput) {
      reptileInput.value = desc;
      // 3) Dispatch a “change” event so formWizard.js picks up the new value
      reptileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
});