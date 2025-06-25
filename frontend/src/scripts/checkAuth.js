document.addEventListener("dynamicContentLoaded", async () => {
  const loginLi = document.getElementById("login-container");
  const profileLi = document.getElementById("profile-dropdown");
  const usernameElem = profileLi?.querySelector(".profile-username");
  const picElem = profileLi?.querySelector(".profile-pic");
  const logoutBtn = document.getElementById("logout-btn");

  try {
    const res = await fetch("/api/auth/profile", {
      method: "GET",
      credentials: "include",
    });

    if (res.ok) {
      const user = await res.json();

      // Show profile, hide login
      if (loginLi) loginLi.style.display = "none";
      if (profileLi) profileLi.style.display = "block";

      // Populate
      if (usernameElem) usernameElem.textContent = user.username;
      if (picElem && user.avatarUrl) picElem.src = user.avatarUrl;

      // Hook up logout
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          // on success, reverse the UI
          loginLi.style.display = "block";
          profileLi.style.display = "none";
        });
      }
    } else {
      // Not logged in: show login, hide profile
      if (loginLi) loginLi.style.display = "block";
      if (profileLi) profileLi.style.display = "none";
    }
  } catch (err) {
    console.error("Auth check failed:", err);
    // On error, default to showing login
    if (loginLi) loginLi.style.display = "block";
    if (profileLi) profileLi.style.display = "none";
  }
});