// pendingAdoptionsTab.js
// Handles loading and approving/denying adoption applications, now with sortable columns

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("pending-apps-body");
  let apps = [];

  // ————— Sorting state & header elements —————
  let currentSort = { key: null, direction: "asc" };
  const pendingTable = document.querySelector("#pending-apps table");
  const headers = pendingTable
    ? pendingTable.querySelectorAll("th[data-sort]")
    : [];

  function sortApps() {
    apps.sort((a, b) => {
      const aVal = (a[currentSort.key] || "").toLowerCase();
      const bVal = (b[currentSort.key] || "").toLowerCase();
      return currentSort.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }

  function updateHeaderIndicators() {
    headers.forEach((th) => {
      th.classList.remove("sorted-asc", "sorted-desc");
      if (th.dataset.sort === currentSort.key) {
        th.classList.add(`sorted-${currentSort.direction}`);
      }
    });
  }

  headers.forEach((th) => {
    th.addEventListener("click", () => {
      const sortKey = th.dataset.sort;
      if (currentSort.key === sortKey) {
        // toggle direction
        currentSort.direction =
          currentSort.direction === "asc" ? "desc" : "asc";
      } else {
        currentSort.key = sortKey;
        currentSort.direction = "asc";
      }
      sortApps();
      renderList();
      updateHeaderIndicators();
    });
  });

  // ————— Load & render —————
  async function loadApps() {
    try {
      const res = await fetch("/api/adoption-apps/pending");
      apps = res.ok ? await res.json() : [];
      if (currentSort.key) sortApps();
      renderList();
    } catch (err) {
      console.error("Failed to load applications", err);
    }
  }

  function renderList() {
    tableBody.innerHTML = "";
    apps.forEach((app) => {
      const tr = document.createElement("tr");
      tr.dataset.id = app.id;
      tr.innerHTML = `
        <td>${app.reptile_id || ""}</td>
        <td>${app.reptileDescription || ""}</td>
        <td>${app.primaryName || ""}</td>
        <td>${app.primaryEmail || ""}</td>
        <td><button class="view-app-btn btn-option">View</button></td>
      `;
      tableBody.appendChild(tr);
    });
    updateHeaderIndicators();
  }

  // ————— Popup logic —————
  let popup, detailsElem, approveBtn, denyBtn;
  document.addEventListener("popupsLoaded", () => {
    popup = document.getElementById("adoption-app-popup-container");
    detailsElem = document.getElementById("adoption-app-details");
    approveBtn = document.getElementById("approve-app-btn");
    denyBtn = document.getElementById("deny-app-btn");

    if (approveBtn)
      approveBtn.addEventListener("click", () => updateStatus("approved"));
    if (denyBtn)
      denyBtn.addEventListener("click", () => updateStatus("rejected"));
  });

  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-app-btn")) {
      const tr = e.target.closest("tr");
      if (tr) openPopup(tr.dataset.id);
    }
  });

  function openPopup(id) {
    const app = apps.find((a) => String(a.id) === String(id));
    if (!app || !popup) return;
    popup.dataset.id = id;
    if (app.reptile_id) popup.dataset.reptileId = app.reptile_id;
    let html = "<table class='detail-table'>";
    Object.entries(app).forEach(([k, v]) => {
      if (["id", "createdAt", "updatedAt"].includes(k)) return;
      html += `<tr><th>${k}</th><td>${v || ""}</td></tr>`;
    });
    html += "</table>";
    detailsElem.innerHTML = html;
    popup.style.display = "flex";
  }

  async function updateStatus(status) {
    if (!popup) return;
    const id = popup.dataset.id;
    const reptileId = popup.dataset.reptileId;
    try {
      const res = await fetch(`/api/adoption-apps/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reptileId }),
      });
      if (res.ok) {
        popup.style.display = "none";
        loadApps();
      } else {
        console.error("Failed to update status", res.status);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Initial load
  loadApps();
});