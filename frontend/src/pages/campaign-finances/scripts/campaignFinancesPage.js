import { subscribeToFinanceTransactions } from "../../../scripts/campaignFinanceData.js";
import { formatCurrency } from "../../../scripts/campaignStats.js";
import { hasFinanceSheetConfigured } from "../../../scripts/campaignFinanceConfig.js";

const parseDateInput = (value, isEnd = false) => {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T${isEnd ? "23:59:59" : "00:00:00"}`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (date, fallback) => {
  if (fallback) {
    return fallback;
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


const getTransactionTimestamp = (transaction) => {
  if (!transaction) {
    return 0;
  }

  const { date, displayDate } = transaction;

  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.getTime();
  }

  if (typeof date === "string") {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }

  if (displayDate) {
    const fallback = new Date(displayDate);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback.getTime();
    }
  }

  return 0;
};

const buildOptionElements = (select, values, currentValue) => {
  if (!select) {
    return;
  }

  const previousValue = currentValue ?? select.value;
  const fragment = document.createDocumentFragment();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All";
  fragment.appendChild(allOption);

  Array.from(new Set(values))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      fragment.appendChild(option);
    });

  select.innerHTML = "";
  select.appendChild(fragment);

  if (previousValue && values.includes(previousValue)) {
    select.value = previousValue;
  } else {
    select.value = "all";
  }
};

const createTransactionRow = (transaction) => {
  const tr = document.createElement("tr");

  const dateCell = document.createElement("td");
  dateCell.textContent = formatDate(transaction.date, transaction.displayDate);
  tr.appendChild(dateCell);

  const typeCell = document.createElement("td");
  typeCell.textContent = transaction.type || "—";
  tr.appendChild(typeCell);

  const categoryCell = document.createElement("td");
  categoryCell.textContent = transaction.category || "—";
  tr.appendChild(categoryCell);

  const descriptionCell = document.createElement("td");
  descriptionCell.classList.add("finance-ledger__col--description");
  descriptionCell.textContent = transaction.description || "—";
  tr.appendChild(descriptionCell);

  const amountCell = document.createElement("td");
  amountCell.textContent = formatCurrency(transaction.amount || 0);
  tr.appendChild(amountCell);

  return tr;
};

const initCampaignFinancesPage = () => {
  const ledgerSection = document.querySelector(".finance-ledger");
  if (!ledgerSection) {
    return null;
  }

  const typeSelect = ledgerSection.querySelector("[data-filter-type]");
  const categorySelect = ledgerSection.querySelector("[data-filter-category]");
  const startInput = ledgerSection.querySelector("[data-filter-start]");
  const endInput = ledgerSection.querySelector("[data-filter-end]");
  const searchInput = ledgerSection.querySelector("[data-filter-search]");
  const tableBody = ledgerSection.querySelector("[data-finance-rows]");
  const emptyState = ledgerSection.querySelector("[data-finance-empty]");
  const statusElement = ledgerSection.querySelector("[data-finance-status]");

  if (!tableBody || !statusElement) {
    return null;
  }

  if (!hasFinanceSheetConfigured) {
    statusElement.textContent =
      "Connect your Google Sheet ID in campaignFinanceConfig.js to load the ledger.";
    return null;
  }

  let transactions = [];
  let filteredTransactions = [];
  let lastUpdatedAt = null;

  const filters = {
    type: typeSelect ? typeSelect.value : "all",
    category: categorySelect ? categorySelect.value : "all",
    startDate: null,
    endDate: null,
    search: "",
  };

  const updateStatus = () => {
    if (!statusElement) {
      return;
    }

    if (!transactions.length) {
      statusElement.textContent =
        "Waiting for transactions… updates appear automatically from Google Sheets.";
      return;
    }

    const base = `Showing ${filteredTransactions.length} of ${transactions.length} entries.`;

    if (lastUpdatedAt) {
      statusElement.textContent = `${base} Updated ${lastUpdatedAt.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })}.`;
    } else {
      statusElement.textContent = `${base} Updates sync every few minutes.`;
    }
  };

  const renderTransactions = (rows) => {
    tableBody.innerHTML = "";

    rows.forEach((transaction) => {
      tableBody.appendChild(createTransactionRow(transaction));
    });

    if (emptyState) {
      emptyState.hidden = rows.length !== 0;
    }
  };

  const applyFilters = () => {
    const query = filters.search.trim().toLowerCase();

    const sorted = [...transactions].sort(
      (a, b) => getTransactionTimestamp(b) - getTransactionTimestamp(a),
    );

    filteredTransactions = sorted.filter((transaction) => {
      const matchesType =
        filters.type === "all" ||
        (transaction.type && transaction.type.toLowerCase() === filters.type.toLowerCase());

      const matchesCategory =
        filters.category === "all" ||
        (transaction.category &&
          transaction.category.toLowerCase() === filters.category.toLowerCase());

      const matchesSearch =
        !query ||
        [transaction.description, transaction.category, transaction.type]
          .filter(Boolean)
          .some((value) => value.toString().toLowerCase().includes(query));

      const { startDate, endDate } = filters;
      const hasDate = transaction.date instanceof Date && !Number.isNaN(transaction.date.getTime());

      const matchesStart = !startDate || (hasDate && transaction.date >= startDate);
      const matchesEnd = !endDate || (hasDate && transaction.date <= endDate);

      if ((startDate || endDate) && !hasDate) {
        return false;
      }

      return matchesType && matchesCategory && matchesSearch && matchesStart && matchesEnd;
    });

    renderTransactions(filteredTransactions);
    updateStatus();
  };

  const updateFilterOptions = () => {
    const typeValues = transactions.map((transaction) => transaction.type || "Other");
    const categoryValues = transactions.map((transaction) => transaction.category || "General");

    buildOptionElements(typeSelect, typeValues, filters.type);
    buildOptionElements(categorySelect, categoryValues, filters.category);
  };

  const handleTransactionsUpdate = (rows) => {
    transactions = Array.isArray(rows) ? rows : [];
    lastUpdatedAt = new Date();

    updateFilterOptions();
    applyFilters();
  };

  if (typeSelect) {
    typeSelect.addEventListener("change", (event) => {
      filters.type = event.target.value;
      applyFilters();
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", (event) => {
      filters.category = event.target.value;
      applyFilters();
    });
  }

  if (startInput) {
    startInput.addEventListener("change", (event) => {
      filters.startDate = parseDateInput(event.target.value);
      applyFilters();
    });
  }

  if (endInput) {
    endInput.addEventListener("change", (event) => {
      filters.endDate = parseDateInput(event.target.value, true);
      applyFilters();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      filters.search = event.target.value;
      applyFilters();
    });
  }

  statusElement.textContent = "Loading transactions…";

  const unsubscribe = subscribeToFinanceTransactions(handleTransactionsUpdate, {
    onError: (error) => {
      statusElement.textContent = `Unable to refresh transactions (${error.message}).`;
    },
  });

  window.addEventListener(
    "beforeunload",
    () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    },
    { once: true },
  );

  return unsubscribe;
};

export default initCampaignFinancesPage;
