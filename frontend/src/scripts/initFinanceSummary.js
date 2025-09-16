import initCampaignStats, {
  updateCampaignStatValue,
} from "./campaignStats.js";
import {
  subscribeToFinanceSummary,
  getFinanceSheetStatus,
} from "./campaignFinanceData.js";
import { hasFinanceSheetConfigured } from "./campaignFinanceConfig.js";

const DEFAULT_FIELDS = [
  "totalRaised",
  "selfFinanced",
  "totalSpent",
  "cashOnHand",
  "candidateSalary",
  "staffSalaries",
  "totalMiles",
];

const formatUpdatedAt = (isoString) => {
  if (!isoString) {
    return "Live totals refresh every few minutes.";
  }

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "Live totals refresh every few minutes.";
  }

  return `Last updated ${date.toLocaleDateString(undefined, {
    dateStyle: "medium",
  })}`;
};

const configureSheetLink = (element) => {
  if (!element) {
    return;
  }

  element.hidden = true;
  element.removeAttribute("href");
  element.textContent = "";
};

const applySummaryToElements = (
  fields,
  elementsByField,
  updatedElement,
  summary,
  animate,
) => {
  fields.forEach((field) => {
    const element = elementsByField.get(field);

    if (!element) {
      return;
    }

    const value = summary?.[field];
    updateCampaignStatValue(element, value, { animate });
  });

  if (!updatedElement) {
    return;
  }

  if (summary?.error) {
    updatedElement.textContent = summary.error;
    return;
  }

  updatedElement.textContent = formatUpdatedAt(summary?.updatedAt);
};

const initFinanceSummary = ({
  containerSelector = "#campaign-stats",
  valueSelector = ".campaign-stats__value[data-summary-field]",
  updatedSelector = "[data-finance-summary-updated]",
  sheetLinkSelector = "[data-finance-sheet-link]",
  sheetLinkScope,
  missingConfigMessage =
    "Connect your Google Sheet ID in campaignFinanceConfig.js to enable live totals.",
  animateOnInit = false,
  fields = DEFAULT_FIELDS,
} = {}) => {
  const resolveRoot = (selectorOrElement, fallback = document) => {
    if (!selectorOrElement) {
      return fallback;
    }

    if (selectorOrElement instanceof Element) {
      return selectorOrElement;
    }

    if (typeof selectorOrElement === "string") {
      return document.querySelector(selectorOrElement) || fallback;
    }

    return fallback;
  };

  const resolveElement = (root, selectorOrElement) => {
    if (!selectorOrElement) {
      return null;
    }

    if (selectorOrElement instanceof Element) {
      return selectorOrElement;
    }

    if (!root) {
      return null;
    }

    return root.querySelector(selectorOrElement);
  };

  const container = resolveRoot(containerSelector, null);

  if (!container) {
    return null;
  }

  const statElements = new Map();
  container.querySelectorAll(valueSelector).forEach((element) => {
    statElements.set(element.dataset.summaryField, element);
  });

  const updatedElement = resolveElement(container, updatedSelector);
  const sheetLinkRoot = resolveRoot(sheetLinkScope, container);
  const sheetLinkElement = resolveElement(sheetLinkRoot, sheetLinkSelector);

  initCampaignStats({
    animateOnInit,
    root: container,
    valueSelector,
  });

  configureSheetLink(sheetLinkElement);

  if (!statElements.size) {
    if (updatedElement) {
      updatedElement.textContent = "Finance summary not available.";
    }
    return null;
  }

  if (!hasFinanceSheetConfigured) {
    if (updatedElement) {
      updatedElement.textContent = missingConfigMessage;
    }
    return null;
  }

  const status = getFinanceSheetStatus();
  if (!status.hasFinanceSheetConfigured) {
    if (updatedElement) {
      updatedElement.textContent = missingConfigMessage;
    }
    return null;
  }

  if (updatedElement) {
    updatedElement.textContent = "Loading live finance summary…";
  }

  const unsubscribe = subscribeToFinanceSummary(
    (summary) => {
      if (!summary || summary.error) {
        applySummaryToElements(fields, statElements, updatedElement, {
          ...summary,
          error: summary?.error || "Unable to load finance summary.",
        });
        return;
      }

      applySummaryToElements(fields, statElements, updatedElement, summary, true);
    },
    {
      onError: (error) => {
        if (updatedElement) {
          updatedElement.textContent = `Unable to refresh finance totals (${error.message}).`;
        }
      },
    },
  );

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

export default initFinanceSummary;
