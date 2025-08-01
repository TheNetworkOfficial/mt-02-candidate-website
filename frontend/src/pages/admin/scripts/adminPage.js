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

  const logoutBtn = document.getElementById("admin-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Logout failed", err);
      } finally {
        window.location.href = "index.html";
      }
    });
  }

  const form = document.getElementById("event-form");
  const eventIdInput = document.getElementById("eventId");
  const cancelEditBtn = document.getElementById("cancel-edit");
  const submitBtn = form.querySelector("button[type='submit']");

  cancelEditBtn.addEventListener("click", () => {
    form.reset();
    eventIdInput.value = "";
    submitBtn.textContent = "Create Event";
    cancelEditBtn.style.display = "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const rawLocal = document.getElementById("eventDate").value; // e.g. "2025-07-31T12:00"
    let eventDateUTC = "";
    if (rawLocal) {
      const [datePart, timePart] = rawLocal.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);
      // Build a local Date and convert to UTC ISO string
      const localDate = new Date(year, month - 1, day, hour, minute);
      eventDateUTC = localDate.toISOString(); // absolute time in UTC
    }
    const location = document.getElementById("location").value.trim();
    const description = document.getElementById("description").value.trim();
    const thumbnail = document.getElementById("thumbnail").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("eventDate", eventDateUTC);
    formData.append("location", location);
    formData.append("description", description);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    const id = eventIdInput.value;
    const url = id ? `/api/events/${id}` : "/api/events";
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });
      if (res.ok) {
        alert(id ? "Event updated" : "Event created");
        form.reset();
        eventIdInput.value = "";
        submitBtn.textContent = "Create Event";
        cancelEditBtn.style.display = "none";
        loadData();
      } else {
        const data = await res.json();
        alert(
          data.error || (id ? "Error updating event" : "Error creating event"),
        );
      }
    } catch (err) {
      console.error(id ? "Update event error" : "Create event error", err);
      alert("Server error");
    }
  });

  const newsForm = document.getElementById("news-form");
  newsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("news-title").value.trim();
    const url = document.getElementById("news-url").value.trim();
    const summary = document.getElementById("news-summary").value.trim();

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, summary }),
      });
      if (res.ok) {
        alert("News article added");
        newsForm.reset();
        loadNews();
      } else {
        const data = await res.json();
        alert(data.error || "Error adding article");
      }
    } catch (err) {
      console.error("Create news error", err);
      alert("Server error");
    }
  });

  async function loadData() {
    await Promise.all([
      loadMessages(),
      loadVolunteers(),
      loadSignups(),
      loadMailingList(),
      loadNews(),
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
          const details = document.createElement("details");
          details.className = "message-item";
          if (!m.read) details.classList.add("unread");

          const summary = document.createElement("summary");
          summary.textContent = `${m.subject || "(no subject)"} - ${m.name}`;
          details.appendChild(summary);

          const body = document.createElement("div");
          body.innerHTML = `
            <p><strong>Email:</strong> ${m.email}</p>
            <p><strong>Phone:</strong> ${m.phone || ""}</p>
            <p><strong>Zip:</strong> ${m.zip || ""}</p>
            <p>${m.message}</p>`;
          const del = document.createElement("button");
          del.textContent = "Delete";
          del.className = "delete-btn";
          del.className = "delete-btn";
          del.addEventListener("click", async () => {
            if (!confirm("Delete this message?")) return;
            await fetch(`/api/admin/contact-messages/${m.id}`, {
              method: "DELETE",
              credentials: "include",
            });
            loadMessages();
          });
          body.appendChild(del);
          details.appendChild(body);

          details.addEventListener("toggle", async () => {
            if (details.open && !m.read) {
              await fetch(`/api/admin/contact-messages/${m.id}/read`, {
                method: "PATCH",
                credentials: "include",
              });
              details.classList.remove("unread");
              m.read = true;
            }
          });

          list.appendChild(details);
        });
      }
    } catch (err) {
      console.error("Load messages error", err);
    }
  }

  async function loadVolunteers() {
    const table = document.getElementById("volunteers-table");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    try {
      const res = await fetch("/api/admin/volunteers", {
        credentials: "include",
      });
      if (res.ok) {
        volunteerData = await res.json();
        renderVolunteers();
      }
    } catch (err) {
      console.error("Load volunteers error", err);
    }
  }

  let volunteerData = [];
  let sortKey = null;
  let sortAsc = true;

  function renderVolunteers() {
    const table = document.getElementById("volunteers-table");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    volunteerData.forEach((v) => {
      const row = tbody.insertRow();
      row.innerHTML = `<td>${v.firstName}</td><td>${v.lastName}</td><td>${v.email}</td><td>${v.phone || ""}</td><td>${v.zip || ""}</td><td>${v.discord || ""}</td>`;
    });
  }

  function sortVolunteers(key) {
    if (sortKey === key) sortAsc = !sortAsc;
    else {
      sortKey = key;
      sortAsc = true;
    }
    volunteerData.sort((a, b) => {
      if (a[key] > b[key]) return sortAsc ? 1 : -1;
      if (a[key] < b[key]) return sortAsc ? -1 : 1;
      return 0;
    });
    renderVolunteers();
  }

  document
    .querySelectorAll("#volunteers-table th[data-key]")
    .forEach((th) =>
      th.addEventListener("click", () => sortVolunteers(th.dataset.key)),
    );

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

  async function loadMailingList() {
    const tbody = document.getElementById("mailing-list");
    tbody.innerHTML = "";
    try {
      const res = await fetch("/api/admin/mailing-list", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        data.forEach((m) => {
          const tr = document.createElement("tr");
          const emailTd = document.createElement("td");
          emailTd.textContent = m.email || "";
          const phoneTd = document.createElement("td");
          phoneTd.textContent = m.phone || "";
          tr.appendChild(emailTd);
          tr.appendChild(phoneTd);
          tbody.appendChild(tr);
        });
      }
    } catch (err) {
      console.error("Load mailing list error", err);
    }
  }

  async function loadNews() {
    const list = document.getElementById("news-list");
    list.innerHTML = "";
    try {
      const res = await fetch("/api/news", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        data.forEach((n) => {
          const li = document.createElement("li");
          li.innerHTML = `<a href="${n.url}" target="_blank">${n.title}</a>`;
          const del = document.createElement("button");
          del.textContent = "Delete";
          del.className = "delete-btn";
          del.addEventListener("click", async () => {
            if (!confirm("Delete this article?")) return;
            await fetch(`/api/news/${n.id}`, {
              method: "DELETE",
              credentials: "include",
            });
            loadNews();
          });
          li.appendChild(del);
          list.appendChild(li);
        });
      }
    } catch (err) {
      console.error("Load news error", err);
    }
  }

  async function loadEvents() {
    const list = document.getElementById("events-admin-list");
    if (!list) return;
    list.innerHTML = "";

    // helper: convert ISO UTC timestamp to "YYYY-MM-DDTHH:MM" for datetime-local
    function isoToLocalDatetimeValue(iso) {
      const dt = new Date(iso); // parsed as UTC, internal representation is local
      const pad = (n) => n.toString().padStart(2, "0");
      const year = dt.getFullYear();
      const month = pad(dt.getMonth() + 1);
      const day = pad(dt.getDate());
      const hours = pad(dt.getHours());
      const minutes = pad(dt.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    try {
      const res = await fetch("/api/events", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        data.forEach((ev) => {
          const li = document.createElement("li");
          li.textContent = `${ev.title} - ${new Date(ev.eventDate).toLocaleDateString()}`;

          const edit = document.createElement("button");
          edit.textContent = "Edit";
          edit.addEventListener("click", () => {
            eventIdInput.value = ev.id;
            document.getElementById("title").value = ev.title;
            document.getElementById("eventDate").value = isoToLocalDatetimeValue(ev.eventDate);
            document.getElementById("location").value = ev.location || "";
            document.getElementById("description").value = ev.description || "";
            submitBtn.textContent = "Update Event";
            cancelEditBtn.style.display = "inline";
            window.scrollTo({ top: 0, behavior: "smooth" });
          });

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

          li.appendChild(edit);
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
