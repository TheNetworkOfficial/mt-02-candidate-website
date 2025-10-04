function initCountdown() {
  const timer = document.querySelector("[data-countdown-timer]");
  if (!timer) return;

  const targetDateAttr = timer.dataset.countdownTarget;
  const targetDate = targetDateAttr ? new Date(targetDateAttr) : null;
  const completedMessage = document.querySelector("[data-countdown-complete]");

  if (!targetDate || Number.isNaN(targetDate.getTime())) {
    if (completedMessage) {
      completedMessage.hidden = false;
      completedMessage.textContent =
        "Election Day is approaching. Check back soon for updates.";
    }
    return;
  }

  const valueElements = {
    days: timer.querySelector('[data-countdown-value="days"]'),
    hours: timer.querySelector('[data-countdown-value="hours"]'),
    minutes: timer.querySelector('[data-countdown-value="minutes"]'),
    seconds: timer.querySelector('[data-countdown-value="seconds"]'),
  };

  function setValue(key, value) {
    const element = valueElements[key];
    if (!element) return;
    const normalizedValue = Math.max(value, 0);
    element.textContent =
      key === "days"
        ? String(normalizedValue)
        : String(normalizedValue).padStart(2, "0");
  }

  function updateTimer() {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      setValue("days", 0);
      setValue("hours", 0);
      setValue("minutes", 0);
      setValue("seconds", 0);
      if (completedMessage) completedMessage.hidden = false;
      clearInterval(intervalId);
      return;
    }

    const secondsTotal = Math.floor(diff / 1000);
    const days = Math.floor(secondsTotal / (60 * 60 * 24));
    const hours = Math.floor((secondsTotal % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((secondsTotal % (60 * 60)) / 60);
    const seconds = secondsTotal % 60;

    setValue("days", days);
    setValue("hours", hours);
    setValue("minutes", minutes);
    setValue("seconds", seconds);
  }

  updateTimer();
  const intervalId = setInterval(updateTimer, 1000);
}

function initCoalitionSignupForm() {
  const form = document.querySelector("[data-coalition-form]");
  if (!form) return;

  const status = form.querySelector("[data-coalition-form-status]");
  const submitButton = form.querySelector('button[type="submit"]');

  function setStatus(message, state = "info") {
    if (!status) return;
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const phone = (formData.get("phone") || "").toString().trim();
    const zip = (formData.get("zip") || "").toString().trim();

    if (!name || !email || !phone || !zip) {
      setStatus("Please complete all fields before submitting.", "error");
      return;
    }

    setStatus("Submitting your information…");
    if (submitButton) submitButton.disabled = true;

    try {
      const res = await fetch("/api/coalition-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, zip }),
      });

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Unable to save your sign up." }));
        throw new Error(data.error || "Unable to save your sign up.");
      }

      form.reset();
      setStatus(
        "Thanks for joining the coalition! We'll be in touch soon.",
        "success",
      );
    } catch (err) {
      console.error("Coalition signup failed", err);
      setStatus(
        err.message || "We couldn't process your sign up. Please try again.",
        "error",
      );
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

export default function initCoalitionPage() {
  initCountdown();
  initCoalitionSignupForm();
}
