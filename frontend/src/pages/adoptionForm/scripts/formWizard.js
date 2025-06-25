document.addEventListener('DOMContentLoaded', () => {
  const steps = Array.from(document.querySelectorAll('.form-step'));
  let current = 0;

  function showStep(i) {
    steps.forEach((s, idx) => s.classList.toggle('active', idx === i));
    updateNavButtons();
  }

    function updateNavButtons() {
    const stepEl = steps[current];

    // Gather all *visible* required fields
    const requiredFields = Array.from(
        stepEl.querySelectorAll('[required]')
    ).filter(el => el.offsetParent !== null);

    // Check validity
    const allValid = requiredFields.every(el => {
        if (el.type === 'checkbox') {
        return el.checked;
        }
        if (el.type === 'radio') {
        return Array.from(
            stepEl.querySelectorAll(`[name="${el.name}"]`)
        ).some(r => r.checked);
        }
        return el.value.trim() !== '';
    });

    // Toggle “Continue” button if present
    const nextBtn = stepEl.querySelector('.btn-next');
    if (nextBtn) nextBtn.disabled = !allValid;

    // Toggle “Submit” button on final step
    const submitBtn = stepEl.querySelector('.btn-submit');
    if (submitBtn) submitBtn.disabled = !allValid;
    }

  // 1) Landlord section (only when renting)
  document.querySelectorAll('input[name="rentOrOwn"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const section = document.querySelector('.landlord-info');
      const inputs  = section.querySelectorAll('input');
      if (radio.value === 'rent') {
        section.style.display = 'block';
        inputs.forEach(i => { i.disabled = false; i.required = true; });
      } else {
        section.style.display = 'none';
        inputs.forEach(i => { i.disabled = true;  i.required = false; });
      }
    });
  });

  // 2) “Other residents” section
  document.querySelectorAll('input[name="othersResiding"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const section = document.querySelector('.residing-details');
      const inputs  = section.querySelectorAll('input');
      if (radio.value === 'yes') {
        section.style.display = 'block';
        inputs.forEach(i => { i.disabled = false; i.required = true; });
      } else {
        section.style.display = 'none';
        inputs.forEach(i => { i.disabled = true;  i.required = false; });
      }
    });
  });

  // 3) Children section
  document.querySelectorAll('input[name="childrenLiving"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const section = document.querySelector('.children-info');
      const inputs  = section.querySelectorAll('input');
      // show for both fullTime or partTime
      if (radio.value === 'fullTime' || radio.value === 'partTime') {
        section.style.display = 'block';
        inputs.forEach(i => { i.disabled = false; i.required = true; });
      } else {
        section.style.display = 'none';
        inputs.forEach(i => { i.disabled = true;  i.required = false; });
      }
    });
  });

  // setup navigation & validation hooks
  steps.forEach((step, idx) => {
    step.querySelectorAll('.btn-next').forEach(b =>
      b.addEventListener('click', () => { if (idx < steps.length - 1) { current = idx + 1; showStep(current); } })
    );
    step.querySelectorAll('.btn-back').forEach(b =>
      b.addEventListener('click', () => { if (idx > 0) { current = idx - 1; showStep(current); } })
    );
    // Include <select> so dropdowns trigger validation
    step.querySelectorAll('input, textarea, select').forEach(el =>
      el.addEventListener('change', updateNavButtons)
    );
  });

  showStep(0);
});