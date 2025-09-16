/**
 * Configuration values for campaign finance data.
 *
 * To reduce casual discovery of the private Google Sheet, reverse the sheet ID
 * string and assign it to FINANCE_SHEET_ID_ENCODED. Example: paste the sheet ID
 * into a text editor, reverse the characters, and use the reversed value.
 *
 * The reversed ID is supplied through the FRONTEND_FINANCE_SHEET_ID_REVERSED
 * environment variable (see .env at the project root).
 */
const FINANCE_SHEET_ID_ENCODED =
  process.env.FRONTEND_FINANCE_SHEET_ID_REVERSED || "REVERSE_YOUR_SHEET_ID";

const decodeSheetId = (encoded) => {
  if (!encoded || encoded === "REVERSE_YOUR_SHEET_ID") {
    return null;
  }

  return encoded
    .toString()
    .replace(/\s+/g, "")
    .split("")
    .reverse()
    .join("");
};

export const FINANCE_SHEET_ID = decodeSheetId(FINANCE_SHEET_ID_ENCODED);

export const SUMMARY_SHEET_NAME = "Summary";
export const TRANSACTIONS_SHEET_NAME = "Transactions";
export const MILEAGE_SHEET_NAME = "Mileage";
export const FINANCE_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const hasFinanceSheetConfigured = Boolean(FINANCE_SHEET_ID);

export const financeSheetApiBase = hasFinanceSheetConfigured
  ? `https://docs.google.com/spreadsheets/d/${FINANCE_SHEET_ID}`
  : null;
