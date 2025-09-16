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

  const coalitionForm = document.getElementById("coalition-form");
  const coalitionIdInput = document.getElementById("coalition-id");
  const coalitionSubmitBtn = document.getElementById("coalition-submit-btn");
  const coalitionCancelBtn = document.getElementById("coalition-cancel-edit");
  const coalitionHeadshotInput = document.getElementById("coalition-headshot");
  const coalitionHeadshotPreview = document.getElementById(
    "coalition-headshot-preview",
  );
  const coalitionRemoveHeadshotWrapper = document.querySelector(
    ".coalition-remove-headshot",
  );
  const coalitionRemoveHeadshot = document.getElementById(
    "coalition-remove-headshot",
  );
  const coalitionSocialLinksContainer = document.getElementById(
    "coalition-social-links",
  );
  const coalitionAddSocialLinkBtn = document.getElementById("add-social-link");
  const coalitionTableBody = document.getElementById("coalition-table-body");

  let coalitionCandidates = [];
  let editingCoalitionCandidate = null;
  let coalitionHeadshotObjectUrl = null;

  function formatLevel(level) {
    if (!level) return "";
    return level.charAt(0).toUpperCase() + level.slice(1);
  }

  function addSocialLinkRow(initial = {}) {
    if (!coalitionSocialLinksContainer) return;
    const row = document.createElement("div");
    row.className = "coalition-social-row";

    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.placeholder = "Label (e.g., Twitter)";
    labelInput.className = "coalition-social-label";
    labelInput.value = initial.label || "";

    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.placeholder = "https://";
    urlInput.className = "coalition-social-url";
    urlInput.value = initial.url || "";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.className = "secondary-btn";
    removeBtn.addEventListener("click", () => {
      row.remove();
      if (!coalitionSocialLinksContainer.children.length) {
        addSocialLinkRow();
      }
    });

    row.appendChild(labelInput);
    row.appendChild(urlInput);
    row.appendChild(removeBtn);
    coalitionSocialLinksContainer.appendChild(row);
  }

  function collectSocialLinks() {
    if (!coalitionSocialLinksContainer) return [];
    const rows = coalitionSocialLinksContainer.querySelectorAll(
      ".coalition-social-row",
    );
    const links = [];
    rows.forEach((row) => {
      const label = row
        .querySelector(".coalition-social-label")
        .value.trim();
      const url = row.querySelector(".coalition-social-url").value.trim();
      if (label && url) {
        links.push({ label, url });
      }
    });
    return links;
  }

  function showHeadshotPreview(src) {
    if (!coalitionHeadshotPreview) return;
    if (src) {
      coalitionHeadshotPreview.hidden = false;
      coalitionHeadshotPreview.innerHTML = "";
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Candidate headshot preview";
      coalitionHeadshotPreview.appendChild(img);
    } else {
      coalitionHeadshotPreview.hidden = true;
      coalitionHeadshotPreview.innerHTML = "";
    }
  }

  function resetCoalitionForm() {
    if (!coalitionForm) return;
    coalitionForm.reset();
    coalitionIdInput.value = "";
    coalitionSubmitBtn.textContent = "Add Candidate";
    if (coalitionCancelBtn) coalitionCancelBtn.style.display = "none";
    editingCoalitionCandidate = null;
    if (coalitionHeadshotInput) coalitionHeadshotInput.value = "";
    if (coalitionHeadshotObjectUrl) {
      URL.revokeObjectURL(coalitionHeadshotObjectUrl);
      coalitionHeadshotObjectUrl = null;
    }
    showHeadshotPreview(null);
    if (coalitionRemoveHeadshotWrapper) {
      coalitionRemoveHeadshotWrapper.hidden = true;
    }
    if (coalitionRemoveHeadshot) coalitionRemoveHeadshot.checked = false;
    if (coalitionSocialLinksContainer) {
      coalitionSocialLinksContainer.innerHTML = "";
      addSocialLinkRow();
    }
  }

  function populateCoalitionForm(candidate) {
    if (!coalitionForm) return;
    editingCoalitionCandidate = candidate;
    coalitionIdInput.value = candidate.id;
    coalitionSubmitBtn.textContent = "Update Candidate";
    if (coalitionCancelBtn) {
      coalitionCancelBtn.style.display = "inline-flex";
    }

    coalitionForm.querySelector("#coalition-name").value = candidate.name || "";
    coalitionForm.querySelector("#coalition-level").value =
      candidate.jurisdictionLevel || "";
    coalitionForm.querySelector("#coalition-office").value =
      candidate.office || "";
    coalitionForm.querySelector("#coalition-region").value =
      candidate.region || "";
    coalitionForm.querySelector("#coalition-website").value =
      candidate.websiteUrl || "";
    coalitionForm.querySelector("#coalition-sort-order").value =
      candidate.sortOrder ?? 0;
    coalitionForm.querySelector("#coalition-tags").value = (
      candidate.tags || []
    ).join(", ");
    coalitionForm.querySelector("#coalition-description").value =
      candidate.description || "";

    if (coalitionRemoveHeadshotWrapper) {
      coalitionRemoveHeadshotWrapper.hidden = !candidate.headshotImage;
    }
    if (coalitionRemoveHeadshot) coalitionRemoveHeadshot.checked = false;

    if (coalitionSocialLinksContainer) {
      coalitionSocialLinksContainer.innerHTML = "";
      if (candidate.socialLinks && candidate.socialLinks.length) {
        candidate.socialLinks.forEach((link) => addSocialLinkRow(link));
      } else {
        addSocialLinkRow();
      }
    }

    showHeadshotPreview(candidate.headshotImage);

    coalitionForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (coalitionForm) {
    if (coalitionAddSocialLinkBtn) {
      coalitionAddSocialLinkBtn.addEventListener("click", () => {
        addSocialLinkRow();
      });
    }

    if (coalitionCancelBtn) {
      coalitionCancelBtn.addEventListener("click", () => {
        resetCoalitionForm();
      });
    }

    if (coalitionHeadshotInput) {
      coalitionHeadshotInput.addEventListener("change", () => {
        if (coalitionHeadshotObjectUrl) {
          URL.revokeObjectURL(coalitionHeadshotObjectUrl);
          coalitionHeadshotObjectUrl = null;
        }
        const file = coalitionHeadshotInput.files[0];
        if (file) {
          coalitionHeadshotObjectUrl = URL.createObjectURL(file);
          showHeadshotPreview(coalitionHeadshotObjectUrl);
          if (coalitionRemoveHeadshot) coalitionRemoveHeadshot.checked = false;
          if (coalitionRemoveHeadshotWrapper)
            coalitionRemoveHeadshotWrapper.hidden = false;
        } else if (editingCoalitionCandidate) {
          showHeadshotPreview(editingCoalitionCandidate.headshotImage);
        } else {
          showHeadshotPreview(null);
        }
      });
    }

    resetCoalitionForm();

    coalitionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = coalitionForm
        .querySelector("#coalition-name")
        .value.trim();
      const level = coalitionForm
        .querySelector("#coalition-level")
        .value.trim();
      const description = coalitionForm
        .querySelector("#coalition-description")
        .value.trim();

      if (!name || !level || !description) {
        alert("Name, level, and description are required");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("jurisdictionLevel", level);
      formData.append("description", description);
      formData.append(
        "office",
        coalitionForm.querySelector("#coalition-office").value.trim(),
      );
      formData.append(
        "region",
        coalitionForm.querySelector("#coalition-region").value.trim(),
      );
      formData.append(
        "websiteUrl",
        coalitionForm.querySelector("#coalition-website").value.trim(),
      );
      formData.append(
        "sortOrder",
        coalitionForm.querySelector("#coalition-sort-order").value.trim() || "0",
      );

      const tagsValue = coalitionForm
        .querySelector("#coalition-tags")
        .value.trim();
      const tagList = tagsValue
        ? tagsValue
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];
      formData.append("tags", JSON.stringify(tagList));

      const socials = collectSocialLinks();
      formData.append("socialLinks", JSON.stringify(socials));

      if (coalitionHeadshotInput && coalitionHeadshotInput.files[0]) {
        formData.append("headshot", coalitionHeadshotInput.files[0]);
      }

      if (coalitionRemoveHeadshot && coalitionRemoveHeadshot.checked) {
        formData.append("removeHeadshot", "true");
      }

      const id = coalitionIdInput.value;
      const url = id ? `/api/coalition/${id}` : "/api/coalition";
      const method = id ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          credentials: "include",
          body: formData,
        });
        if (res.ok) {
          alert(id ? "Candidate updated" : "Candidate added");
          resetCoalitionForm();
          await loadCoalitionCandidates();
        } else {
          const data = await res.json();
          alert(data.error || "Error saving candidate");
        }
      } catch (err) {
        console.error("Save coalition candidate error", err);
        alert("Server error");
      }
    });
  }

  async function loadData() {
    await Promise.all([
      loadMessages(),
      loadVolunteers(),
      loadSignups(),
      loadMailingList(),
      loadNews(),
      loadEvents(),
      loadCoalitionCandidates(),
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

  async function loadCoalitionCandidates() {
    if (!coalitionTableBody) return;
    coalitionTableBody.innerHTML = "";
    try {
      const res = await fetch("/api/coalition", {
        credentials: "include",
      });
      if (res.ok) {
        coalitionCandidates = await res.json();
        renderCoalitionCandidates();
      }
    } catch (err) {
      console.error("Load coalition candidates error", err);
    }
  }

  function renderCoalitionCandidates() {
    if (!coalitionTableBody) return;
    coalitionTableBody.innerHTML = "";
    coalitionCandidates.forEach((candidate) => {
      const tr = document.createElement("tr");

      const nameTd = document.createElement("td");
      nameTd.textContent = candidate.name || "";

      const levelTd = document.createElement("td");
      levelTd.textContent = formatLevel(candidate.jurisdictionLevel);

      const tagsTd = document.createElement("td");
      tagsTd.textContent = (candidate.tags || []).join(", ");

      const updatedTd = document.createElement("td");
      updatedTd.textContent = candidate.updatedAt
        ? new Date(candidate.updatedAt).toLocaleDateString()
        : "";

      const actionsTd = document.createElement("td");
      actionsTd.style.whiteSpace = "nowrap";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Edit";
      editBtn.className = "secondary-btn";
      editBtn.addEventListener("click", () => populateCoalitionForm(candidate));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", async () => {
        if (!confirm(`Delete ${candidate.name}?`)) return;
        try {
          const res = await fetch(`/api/coalition/${candidate.id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (res.ok) {
            await loadCoalitionCandidates();
            if (editingCoalitionCandidate && editingCoalitionCandidate.id === candidate.id) {
              resetCoalitionForm();
            }
          } else {
            const data = await res.json();
            alert(data.error || "Error deleting candidate");
          }
        } catch (err) {
          console.error("Delete coalition candidate error", err);
          alert("Server error");
        }
      });

      actionsTd.appendChild(editBtn);
      actionsTd.appendChild(deleteBtn);

      tr.appendChild(nameTd);
      tr.appendChild(levelTd);
      tr.appendChild(tagsTd);
      tr.appendChild(updatedTd);
      tr.appendChild(actionsTd);

      coalitionTableBody.appendChild(tr);
    });
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
