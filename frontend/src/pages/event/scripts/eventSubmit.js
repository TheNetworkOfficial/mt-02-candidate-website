// eventSubmit.js

/**
 * Handle signup form submission for an event.
 * Currently posts data to /api/volunteers as a placeholder.
 */
document
  .getElementById("event-signup-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      zip: form.zip.value.trim(),
      newsletter: form.newsletter.checked,
      textAlerts: form.textAlerts.checked,
    };

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json();
      if (!res.ok) {
        return alert("Error: " + out.error);
      }
      alert("Thanks for signing up!");
      form.reset();
    } catch (err) {
      console.error("Event signup error:", err);
      alert("Submission failed");
    }
  });