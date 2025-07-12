// ticker.js
document.addEventListener("DOMContentLoaded", () => {
  const ticker = document.getElementById("heroTicker");
  if (!ticker) return;
  // duplicate the content so the marquee never has a gap
  ticker.innerHTML += ticker.innerHTML;
});