// pendingPaymentsTab.js
// Displays reptiles awaiting payment after application approval

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("pending-payment-body");
  if (!tableBody) return;

  async function loadList() {
    try {
      const res = await fetch("/api/adoption-apps/pending-payment");
      const items = res.ok ? await res.json() : [];
      render(items);
    } catch (err) {
      console.error("Failed to load pending payments", err);
    }
  }

  function render(items) {
    tableBody.innerHTML = "";
    items.forEach((item) => {
      const tr = document.createElement("tr");
      const reptile = item.reptile || {};
      const user = item.user || {};
      tr.innerHTML = `
        <td>${reptile.id}</td>
        <td>${reptile.name || ""}</td>
        <td>${user.username || ""}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadList();
});