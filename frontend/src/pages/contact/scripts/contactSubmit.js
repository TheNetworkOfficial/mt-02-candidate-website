// contactSubmit.js

document
  .getElementById("contact-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      phone: e.target.phone.value.trim(),
      zip: e.target.zip.value.trim(),
      subject: e.target.subject.value.trim(),
      message: e.target.message.value.trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json();
      if (!res.ok) {
        return alert("Error: " + out.error);
      }
      alert("Message sent!");
      e.target.reset();
    } catch (err) {
      console.error("Contact submission error:", err);
      alert("Submission failed");
    }
  });