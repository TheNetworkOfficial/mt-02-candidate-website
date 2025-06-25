// adjustHeaderPadding.js
window.addEventListener("load", function () {
  var header = document.querySelector(".site-header");
  if (header) {
    var headerHeight = header.offsetHeight;
    document.body.style.paddingTop = headerHeight + "px";
  }
});
