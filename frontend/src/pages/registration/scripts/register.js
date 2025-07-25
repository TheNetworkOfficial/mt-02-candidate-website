// registration.js
document
  .getElementById("registration-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const firstName = e.target.firstName.value.trim();
    const lastName = e.target.lastName.value.trim();
    const phone = e.target.phone.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          firstName,
          lastName,
          phone,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert("Error: " + data.error);
      }
      alert(data.message);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Registration failed");
    }
  });