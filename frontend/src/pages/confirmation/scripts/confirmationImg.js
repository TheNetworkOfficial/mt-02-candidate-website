import defaultAvatar from "../../../assets/images/icons/defaultAvatar.png";

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const imageUrl = params.get("reptileImage");
  const reptileName = params.get("reptileDescription") || "";

  const imgEl = document.getElementById("animal-image");
  if (imageUrl) {
    imgEl.src = imageUrl;
    imgEl.alt = reptileName || "Adopted Reptile";
  } else {
    imgEl.src = defaultAvatar;
    imgEl.alt = "Default Avatar";
  }

  document.getElementById("home-button")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});