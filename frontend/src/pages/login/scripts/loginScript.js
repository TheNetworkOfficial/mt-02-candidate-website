document
  .getElementById("login-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const password = e.target.password.value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert("Login failed: " + data.error);
      }
      alert(data.message);
      window.location.href = "index.html"; // or your protected dashboard
    } catch (err) {
      console.error("Login error:", err);
      alert("Login error");
    }
});