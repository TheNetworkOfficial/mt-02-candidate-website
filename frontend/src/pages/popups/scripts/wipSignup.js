// wipSignup.js
// Handles optional mailing list signup from the work in progress popup

document.addEventListener("popupsLoaded", () => {
  const form = document.getElementById("wip-signup-form");
  const popup = document.getElementById("workInProgressPopup");
  if (!form || !popup) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();

    if (email || phone) {
      try {
        await fetch("/api/mailing-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, phone }),
        });
      } catch (err) {
        console.error("Mailing list signup error:", err);
      }
    }

    popup.style.display = "none";
    form.reset();
  });
});