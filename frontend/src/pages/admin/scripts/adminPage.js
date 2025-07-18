/**
 * Admin page logic to manage events and view form submissions.
 * Redirects to login if the current user is not an admin.
 */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/auth/profile", { credentials: "include" });
    if (!res.ok) {
      window.location.href = "login.html";
      return;
    }
    const user = await res.json();
    if (!user.isAdmin) {
      window.location.href = "login.html";
      return;
    }
  } catch (err) {
    console.error("Profile fetch failed", err);
    window.location.href = "login.html";
    return;
  }

  const form = document.getElementById("event-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const eventDate = document.getElementById("eventDate").value;
    const location = document.getElementById("location").value.trim();
    const description = document.getElementById("description").value.trim();
    const thumbnail = document.getElementById("thumbnail").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("eventDate", eventDate);
    formData.append("location", location);
    formData.append("description", description);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (res.ok) {
        alert("Event created");
        form.reset();
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Error creating event");
      }
    } catch (err) {
      console.error("Create event error", err);
      alert("Server error");
    }
  });

  async function loadData() {
    await Promise.all([
      loadMessages(),
      loadVolunteers(),
      loadSignups(),
      loadEvents(),
    ]);
  }

  async function loadMessages() {
    const list = document.getElementById("messages-list");
    list.innerHTML = "";
    try {
      const res = await fetch("/api/admin/contact-messages", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        data.forEach((m) => {
          const li = document.createElement("li");
          li.textContent = `${m.name} (${m.email}): ${m.message}`;
          list.appendChild(li);
        });
      }
    } catch (err) {
      console.error("Load messages error", err);
    }
  }

  async function loadVolunteers() {
    const list = document.getElementById("volunteers-list");
    list.innerHTML = "";
    try {
      const res = await fetch("/api/admin/volunteers", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        data.forEach((v) => {
          const li = document.createElement("li");
          li.textContent = `${v.firstName} ${v.lastName} - ${v.email}`;
          list.appendChild(li);
        });
      }
    } catch (err) {
      console.error("Load volunteers error", err);
    }
  }

  async function loadSignups() {
    const list = document.getElementById("signups-list");
    list.innerHTML = "";
    try {
      const res = await fetch("/api/admin/event-signups", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        data.forEach((s) => {
          const li = document.createElement("li");
          li.textContent = `${s.firstName} ${s.lastName} - ${s.email}`;
          list.appendChild(li);
        });
      }
    } catch (err) {
      console.error("Load signups error", err);
    }
  }

    async function loadEvents() {
    const list = document.getElementById("events-admin-list");
    if (!list) return;
    list.innerHTML = "";
    try {
      const res = await fetch("/api/events", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        data.forEach((ev) => {
          const li = document.createElement("li");
          li.textContent = `${ev.title} - ${new Date(ev.eventDate).toLocaleDateString()}`;
          const del = document.createElement("button");
          del.textContent = "Delete";
          del.addEventListener("click", async () => {
            if (!confirm("Delete this event?")) return;
            await fetch(`/api/events/${ev.id}`, {
              method: "DELETE",
              credentials: "include",
            });
            loadEvents();
          });
          li.appendChild(del);
          list.appendChild(li);
        });
      }
    } catch (err) {
      console.error("Load events error", err);
    }
  }

  loadData();
});