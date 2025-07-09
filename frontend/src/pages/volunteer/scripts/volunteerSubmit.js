// volunteerSubmit.js

document
  .getElementById("volunteer-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      firstName: e.target.firstName.value.trim(),
      lastName: e.target.lastName.value.trim(),
      email: e.target.email.value.trim(),
      phone: e.target.phone.value.trim(),
      zip: e.target.zip.value.trim(),
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
      e.target.reset();
    } catch (err) {
      console.error("Volunteer submission error:", err);
      alert("Submission failed");
    }
  });