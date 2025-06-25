document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const entries = Object.fromEntries(new FormData(form).entries());
    const { reptileImage, reptileDescription, reptileId, ...payload } = entries;
    try {
      const res = await fetch("/api/adoption-apps", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, reptileDescription, reptileId }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Submission failed");
        return;
      }
      const redirect = `confirmation.html?reptileDescription=${encodeURIComponent(
        reptileDescription,
      )}&reptileId=${encodeURIComponent(reptileId)}&reptileImage=${encodeURIComponent(
        reptileImage,
      )}`;
      window.location.href = redirect;
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission failed");
    }
  });
});