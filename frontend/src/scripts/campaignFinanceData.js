import {
  FINANCE_SHEET_ID,
  SUMMARY_SHEET_NAME,
  TRANSACTIONS_SHEET_NAME,
  MILEAGE_SHEET_NAME,
  FINANCE_REFRESH_INTERVAL,
  hasFinanceSheetConfigured,
  financeSheetApiBase,
} from "./campaignFinanceConfig.js";

const GVIZ_QUERY_PREFIX = "https://docs.google.com/spreadsheets/d/";

const SUMMARY_KEY_ALIASES = new Map(
  [
    ["total raised", "totalRaised"],
    ["raised", "totalRaised"],
    ["self financed", "selfFinanced"],
    ["self-financed", "selfFinanced"],
    ["candidate self finance", "selfFinanced"],
    ["self finance", "selfFinanced"],
    ["total spent", "totalSpent"],
    ["spent", "totalSpent"],
    ["cash on hand", "cashOnHand"],
    ["cash", "cashOnHand"],
    ["cash reserve", "cashOnHand"],
    ["candidate salary", "candidateSalary"],
    ["candidate compensation", "candidateSalary"],
    ["candidate payroll", "candidateSalary"],
    ["campaign staff salary", "staffSalaries"],
    ["campaign staff salaries", "staffSalaries"],
    ["staff salary", "staffSalaries"],
    ["staff compensation", "staffSalaries"],
    ["staff payroll", "staffSalaries"],
    ["total miles", "totalMiles"],
    ["miles traveled", "totalMiles"],
    ["miles", "totalMiles"],
  ].map(([key, value]) => [key, value]),
);

const DEFAULT_SUMMARY = {
  totalRaised: 0,
  selfFinanced: 0,
  totalSpent: 0,
  cashOnHand: 0,
  candidateSalary: 0,
  staffSalaries: 0,
  superPacRaised: 0,
  totalMiles: 0,
  updatedAt: null,
};

const normalizeHeader = (label, fallback) => {
  if (!label && fallback) {
    return fallback;
  }

  const sanitized = (label || fallback || "")
    .toString()
    .trim()
    .toLowerCase();

  if (!sanitized) {
    return "col";
  }

  return sanitized.replace(/[^a-z0-9]+([a-z0-9])/g, (_, chr) =>
    chr.toUpperCase(),
  );
};

const sanitizeNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const numeric = Number(value.replace(/[^0-9.-]+/g, ""));
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  return 0;
};

const parseGvizTable = (table) => {
  if (!table || !Array.isArray(table.cols) || !Array.isArray(table.rows)) {
    return [];
  }

  const headers = table.cols.map((col, index) => ({
    key: normalizeHeader(col.label, `col_${index}`),
    raw: col.label || col.id || `col_${index}`,
  }));

  return table.rows
    .map((row) => row?.c || [])
    .filter((cells) => cells.some((cell) => cell && cell.v !== null && cell.v !== ""))
    .map((cells) => {
      const record = {};

      headers.forEach((header, index) => {
        const cell = cells[index];

        if (!header.key) {
          return;
        }

        if (cell && Object.prototype.hasOwnProperty.call(cell, "v")) {
          record[header.key] = cell.v;
        } else {
          record[header.key] = null;
        }

        if (cell && cell.f && cell.f !== cell.v) {
          record[`${header.key}Formatted`] = cell.f;
        }
      });

      return record;
    });
};

const extractJson = (responseText) => {
  const jsonStart = responseText.indexOf("{");
  const jsonEnd = responseText.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Unexpected response from Google Sheets API");
  }

  const jsonString = responseText.substring(jsonStart, jsonEnd + 1);
  return JSON.parse(jsonString);
};

const fetchSheet = async (sheetName) => {
  if (!hasFinanceSheetConfigured || !financeSheetApiBase) {
    throw new Error(
      "Campaign finance Google Sheet is not configured. Update campaignFinanceConfig.js with your sheet ID.",
    );
  }

  const url = `${GVIZ_QUERY_PREFIX}${encodeURIComponent(
    FINANCE_SHEET_ID,
  )}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

  const response = await fetch(url, {
    cache: "no-cache",
    credentials: "omit",
    mode: "cors",
  });

  if (!response.ok) {
    throw new Error(`Failed to load Google Sheet: ${response.statusText}`);
  }

  const text = await response.text();
  const parsed = extractJson(text);
  return parseGvizTable(parsed.table);
};

const EXCEL_EPOCH_OFFSET = 25569; // Excel/Lotus epoch starts 1899-12-30
const MS_PER_DAY = 86400 * 1000;

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const fromSerial = new Date((value - EXCEL_EPOCH_OFFSET) * MS_PER_DAY);
    return Number.isNaN(fromSerial.getTime()) ? null : fromSerial;
  }

  const candidate = new Date(value);
  return Number.isNaN(candidate.getTime()) ? null : candidate;
};

export const fetchFinanceSummary = async () => {
  const [summaryRows, mileageOutcome, transactionRows] = await Promise.all([
    fetchSheet(SUMMARY_SHEET_NAME),
    (async () => {
      try {
        const rows = await fetchSheet(MILEAGE_SHEET_NAME);
        return { rows };
      } catch (error) {
        return { error };
      }
    })(),
    (async () => {
      try {
        return await fetchSheet(TRANSACTIONS_SHEET_NAME);
      } catch (error) {
        return [];
      }
    })(),
  ]);

  const summary = { ...DEFAULT_SUMMARY };
  let latestDate = null;

  const registerDate = (candidate) => {
    if (!(candidate instanceof Date) || Number.isNaN(candidate.getTime())) {
      return;
    }

    if (!latestDate || candidate.getTime() > latestDate.getTime()) {
      latestDate = candidate;
    }
  };

  summaryRows.forEach((row) => {
    const labels = [
      row.metric,
      row.metricName,
      row.name,
      row.label,
      row.category,
      row.item,
    ].filter(Boolean);

    const amountCandidate =
      row.amount !== undefined
        ? row.amount
        : row.value !== undefined
          ? row.value
          : row.total !== undefined
            ? row.total
            : row.number;

    const normalizedMetric = labels
      .map((label) => label.toString().trim().toLowerCase())
      .find((label) => SUMMARY_KEY_ALIASES.has(label));

    if (normalizedMetric) {
      const key = SUMMARY_KEY_ALIASES.get(normalizedMetric);
      summary[key] = sanitizeNumber(amountCandidate);
    }

    const asOf = row.asof || row.asOf || row.updated || row.updatedat;
    registerDate(parseDate(asOf));
  });

  if (Array.isArray(mileageOutcome.rows)) {
    const mileageRows = mileageOutcome.rows;

    const totalMiles = mileageRows.reduce((total, mileageRow) => {
      const milesValue =
        mileageRow.miles ??
        mileageRow.mileage ??
        mileageRow.distance ??
        mileageRow.total ??
        mileageRow.value;
      return total + sanitizeNumber(milesValue);
    }, 0);

    summary.totalMiles = totalMiles;

    const mostRecentMileageDate = mileageRows
      .map((mileageRow) =>
        parseDate(
          mileageRow.date ||
            mileageRow.day ||
            mileageRow.logged ||
            mileageRow.recorded ||
            mileageRow.timestamp,
        ),
      )
      .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    registerDate(mostRecentMileageDate);
  }

  if (Array.isArray(transactionRows) && transactionRows.length) {
    const superPacTotal = transactionRows
      .filter((row) => {
        const source = (row.source || "").toString().trim().toLowerCase();
        const type = (row.type || row.transactiontype || row.kind || "")
          .toString()
          .trim()
          .toLowerCase();

        return source === "super pac" && type.startsWith("don");
      })
      .reduce((total, row) => {
        const amount = row.amount ?? row.value ?? row.total ?? row.debit ?? row.credit;
        return total + sanitizeNumber(amount);
      }, 0);

    summary.superPacRaised = superPacTotal;
  }

  if (latestDate) {
    summary.updatedAt = latestDate.toISOString();
  } else {
    summary.updatedAt = new Date().toISOString();
  }

  return summary;
};

export const fetchFinanceTransactions = async () => {
  const rows = await fetchSheet(TRANSACTIONS_SHEET_NAME);

  return rows.map((row) => {
    const rawDateValue = row.date || row.transactiondate || row.posted || null;
    const parsedDate = parseDate(rawDateValue);
    const formattedDate =
      row.dateFormatted ||
      row.transactiondateformatted ||
      row.postedformatted ||
      (typeof rawDateValue === "string" ? rawDateValue : null);

    const amount = sanitizeNumber(
      row.amount ?? row.value ?? row.total ?? row.debit ?? row.credit,
    );

    const typeValue =
      row.type || row.transactiontype || row.kind || row.flow || "Expense";

    const normalizedType = typeValue
      ? typeValue.toString().trim().toLowerCase()
      : "expense";

    const type =
      normalizedType.startsWith("don") || normalizedType.startsWith("con")
        ? "Donation"
        : normalizedType.startsWith("exp") || normalizedType.startsWith("sp")
          ? "Expense"
          : normalizedType.startsWith("payroll")
            ? "Expense"
            : normalizedType.startsWith("trans")
              ? "Transfer"
              : normalizedType.startsWith("refund")
                ? "Refund"
                : normalizedType.replace(/\b\w/g, (char) => char.toUpperCase());

    const category =
      row.category || row.lineitem || row.bucket || row.classification || "General";

    return {
      date: parsedDate,
      displayDate: formattedDate,
      type,
      category,
      description:
        row.description ||
        row.summary ||
        row.note ||
        row.payee ||
        row.vendor ||
        "",
      amount,
      source: row.source || row.donor || row.vendor || row.payee || "",
      receiptUrl:
        row.receipt || row.proof || row.link || row.url || row.document || null,
    };
  });
};

const runWithInterval = (fn, callback, { onError } = {}) => {
  let cancelled = false;

  const execute = async () => {
    try {
      const result = await fn();
      if (!cancelled) {
        callback(result);
      }
    } catch (error) {
      if (!cancelled && onError) {
        onError(error);
      }
    }
  };

  execute();

  const timer = window.setInterval(execute, FINANCE_REFRESH_INTERVAL);

  return () => {
    cancelled = true;
    window.clearInterval(timer);
  };
};

export const subscribeToFinanceSummary = (callback, options = {}) => {
  return runWithInterval(fetchFinanceSummary, callback, options);
};

export const subscribeToFinanceTransactions = (callback, options = {}) => {
  return runWithInterval(fetchFinanceTransactions, callback, options);
};

export const getFinanceSheetStatus = () => ({
  hasFinanceSheetConfigured,
  financeSheetApiBase,
});
