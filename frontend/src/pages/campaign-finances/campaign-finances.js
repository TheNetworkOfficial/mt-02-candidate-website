import "./css/campaign-finances.css";
import initCampaignFinancesPage from "./scripts/campaignFinancesPage.js";

import initFinanceSummary from "../../scripts/initFinanceSummary.js";

document.addEventListener("DOMContentLoaded", () => {
  initFinanceSummary({
    containerSelector: ".finance-summary",
    valueSelector: ".finance-summary__value[data-summary-field]",
    animateOnInit: false,
  });

  initCampaignFinancesPage();
});
