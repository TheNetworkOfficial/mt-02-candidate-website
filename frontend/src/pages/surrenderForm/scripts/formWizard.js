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

  // hide vet-explanation unless they click “Yes”
  const vetGroup = document
    .getElementById('vetExplanation')
    .closest('.form-group');
  vetGroup.style.display = 'none';

  document
    .querySelectorAll('input[name="haveVet"]')
    .forEach(radio =>
      radio.addEventListener('change', () => {
        if (radio.value === 'Yes') {
          vetGroup.style.display = 'block';
          document.getElementById('vetExplanation').setAttribute('required','');
        } else {
          vetGroup.style.display = 'none';
          document.getElementById('vetExplanation').removeAttribute('required');
        }
        updateNavButtons();
      })
    );

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