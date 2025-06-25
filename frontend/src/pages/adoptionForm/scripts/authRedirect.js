document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/auth/profile", { credentials: "include" });
    if (res.status === 401) {
      window.location.href = "login.html";
    }
  } catch (err) {
    console.error("Auth check failed:", err);
    window.location.href = "login.html";
  }
});